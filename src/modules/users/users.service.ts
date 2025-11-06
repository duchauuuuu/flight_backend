import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Đảm bảo field name luôn có giá trị
    if (!createUserDto.name || createUserDto.name.trim() === '') {
      throw new BadRequestException('Tên không được để trống');
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.findByEmail(createUserDto.email.trim());
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    // Hash password nếu có
    if (
      createUserDto.password &&
      !createUserDto.password.startsWith('google_')
    ) {
      const saltRounds = 10;
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );
    }
    
    // Đảm bảo tất cả required fields được lưu
    // Giữ nguyên email như người dùng nhập (phân biệt hoa thường)
    const userData = {
      name: createUserDto.name.trim(),
      email: createUserDto.email.trim(),
      password: createUserDto.password,
      phone: createUserDto.phone || '',
      points: createUserDto.points || 0,
      role: createUserDto.role || 'Customer',
      status: 'active',
    };
    
    try {
      const user = new this.userModel(userData);
      return await user.save();
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate key error (email already exists)
        throw new BadRequestException('Email đã được sử dụng');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({ status: 'active' }).select('-password').exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: id, status: 'active' }).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    // Tìm kiếm email phân biệt hoa thường (chỉ trim whitespace)
    // Chỉ tìm users có status = 'active'
    return this.userModel.findOne({ email: email.trim(), status: 'active' }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    // Tìm kiếm email phân biệt hoa thường (chỉ trim whitespace)
    // Chỉ tìm users có status = 'active'
    const trimmedEmail = email.trim();
    
    const user = await this.userModel.findOne({ email: trimmedEmail, status: 'active' }).select('+password').exec();
    
    return user;
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshToken }).exec();
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    // Chỉ tìm users có status = 'active'
    return this.userModel.findOne({ refreshToken, status: 'active' }).exec();
  }

  getMembershipTier(points: number): string {
    if (points >= 10000) {
      return 'Kim Cương';
    } else if (points >= 5000) {
      return 'Bạch Kim';
    } else if (points >= 2000) {
      return 'Vàng';
    } else if (points >= 500) {
      return 'Bạc';
    } else {
      return 'Đồng';
    }
  }

  async addPoints(userId: string, pointsToAdd: number): Promise<User> {
    const user = await this.findById(userId);
    const newPoints = (user.points || 0) + pointsToAdd;
    return this.update(userId, { points: newPoints });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async delete(id: string): Promise<User> {
    // Soft delete: cập nhật status thành 'deleted' thay vì xóa cứng
    const user = await this.userModel.findOne({ _id: id, status: 'active' }).exec();
    if (!user) throw new NotFoundException('User not found');

    const deleted = await this.userModel
      .findByIdAndUpdate(id, { status: 'deleted' }, { new: true })
      .select('-password')
      .exec();

    if (!deleted) throw new NotFoundException('User not found');
    return deleted;
  }
}
