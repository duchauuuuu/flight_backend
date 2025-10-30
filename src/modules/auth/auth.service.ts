import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateGoogleUser(profile: any): Promise<any> {
    const { id, displayName, emails, photos } = profile;
    
    const email = emails[0].value;
    
    // Kiểm tra xem user đã tồn tại chưa
    let user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      user = await this.usersService.create({
        name: displayName,
        email: email,
        phone: '', // Có thể để trống hoặc yêu cầu user cập nhật sau
        password: `google_${id}`, // Password placeholder cho Google OAuth
        role: 'Customer',
      });
    }
    
    return user;
  }

  async login(user: any) {
    const membershipTier = this.usersService.getMembershipTier(user.points || 0);
    return {
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        points: user.points || 0,
        membershipTier,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailWithPassword(email);
    
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra nếu là Google user (không có password thực)
    if (user.password && user.password.startsWith('google_')) {
      throw new UnauthorizedException('Vui lòng đăng nhập bằng Google');
    }

    if (!user.password) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async loginWithCredentials(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    // Tạo access token (15 phút)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    // Tạo refresh token (7 ngày)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // Lưu refresh token vào database
    await this.usersService.updateRefreshToken(user._id, refreshToken);

    // Lấy hạng thành viên dựa trên điểm
    const membershipTier = this.usersService.getMembershipTier(user.points || 0);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        points: user.points || 0,
        membershipTier,
        role: user.role,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken);
      
      // Kiểm tra refresh token có trong database không
      const user = await this.usersService.findByRefreshToken(refreshToken);
      if (!user) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      // Tạo access token mới
      const newPayload = {
        sub: user._id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }
}
