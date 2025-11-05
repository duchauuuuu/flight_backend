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
    console.log('🔍 Validating user with email:', trimmedEmail);
    console.log('🔍 Email length:', trimmedEmail.length);
    console.log('🔍 Email characters:', JSON.stringify(trimmedEmail));
    
    const user = await this.usersService.findByEmailWithPassword(trimmedEmail);
    
    console.log('🔍 User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('🔍 User email in DB:', user.email);
      console.log('🔍 User email match:', user.email === trimmedEmail);
      console.log('🔍 User has password:', !!user.password);
    }
    
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.password) {
      console.log('❌ User has no password');
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    console.log('🔐 Comparing password...');
    console.log('🔐 Input password length:', password.length);
    console.log('🔐 Stored password hash length:', user.password.length);
    console.log('🔐 Stored password starts with:', user.password.substring(0, 10));
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('🔐 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password does not match');
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    
    console.log('✅ Password validated successfully');
    
    // Log user object trước khi return
    console.log('✅ User object before return:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      points: user.points,
      role: user.role,
      hasPassword: !!user.password,
    });

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
    
    console.log('✅ User object after destructuring:', {
      _id: result._id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      points: result.points,
      role: result.role,
    });
    
    return result;
  }

  async loginWithCredentials(loginDto: LoginDto) {
    console.log('📥 Login request received:');
    console.log('📥 Email:', loginDto.email);
    console.log('📥 Email type:', typeof loginDto.email);
    console.log('📥 Email length:', loginDto.email?.length);
    console.log('📥 Password length:', loginDto.password?.length);
    
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    console.log('✅ User validated, creating tokens...');
    console.log('✅ User _id:', user._id);
    console.log('✅ User name:', user.name);
    console.log('✅ User email:', user.email);
    
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    // Tạo access token (15 phút)
    console.log('🔑 Creating access token...');
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    console.log('🔑 Access token created, length:', accessToken.length);

    // Tạo refresh token (7 ngày)
    console.log('🔑 Creating refresh token...');
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    console.log('🔑 Refresh token created, length:', refreshToken.length);

    // Lưu refresh token vào database
    console.log('💾 Saving refresh token to database...');
    await this.usersService.updateRefreshToken(user._id, refreshToken);
    console.log('💾 Refresh token saved');

    // Lấy hạng thành viên dựa trên điểm
    console.log('🏆 Getting membership tier...');
    const membershipTier = this.usersService.getMembershipTier(user.points || 0);
    console.log('🏆 Membership tier:', membershipTier);

    // Đảm bảo field name luôn có giá trị từ database
    if (!user.name || user.name.trim() === '') {
      console.log('⚠️ User has no name, updating from email...');
      const fallbackName = user.email?.split('@')[0] || 'User';
      await this.usersService.update(user._id, { name: fallbackName });
      user.name = fallbackName;
      console.log('⚠️ User name updated to:', fallbackName);
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

    console.log('✅ Login successful, returning response');
    console.log('✅ Response user name:', response.user.name);
    console.log('✅ Response user email:', response.user.email);
    
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
