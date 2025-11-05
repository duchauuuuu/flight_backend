import { Controller, Post, Get } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async seedAll() {
    const result = await this.seedService.seedAll();
    return {
      message: 'Đã tạo dữ liệu fake thành công',
      data: result,
    };
  }

  @Get('status')
  getStatus() {
    return {
      message:
        'Seed service đang hoạt động. Gọi POST /seed để tạo dữ liệu fake.',
    };
  }
}
