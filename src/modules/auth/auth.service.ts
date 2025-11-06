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


  async validateUser(email: string, password: string): Promise<any> {
    // Chỉ trim email, giữ nguyên hoa thường
    const trimmedEmail = email.trim();
    
    const user = await this.usersService.findByEmailWithPassword(trimmedEmail);
    
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.password) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Đảm bảo trả về đầy đủ thông tin user (trừ password)
    const result = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      points: user.points,
      role: user.role,
    };
    
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

    // Đảm bảo field name luôn có giá trị từ database
    if (!user.name || user.name.trim() === '') {
      const fallbackName = user.email?.split('@')[0] || 'User';
      await this.usersService.update(user._id, { name: fallbackName });
      user.name = fallbackName;
    }

    const response = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        points: user.points || 0,
        membershipTier,
        role: user.role || 'Customer',
      },
    };
    
    return response;
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
