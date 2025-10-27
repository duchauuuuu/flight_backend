import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

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
    return {
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
