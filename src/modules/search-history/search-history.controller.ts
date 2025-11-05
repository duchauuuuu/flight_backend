import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SearchHistoryService } from './search-history.service';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';

@Controller('search-history')
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Post()
  create(@Body() createSearchHistoryDto: CreateSearchHistoryDto) {
    return this.searchHistoryService.create(createSearchHistoryDto);
  }

  @Get()
  findByUserId(@Query('userId') userId: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.searchHistoryService.findByUserId(userId, limitNum);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.searchHistoryService.delete(id);
  }

  @Delete('user/:userId')
  deleteAllByUserId(@Param('userId') userId: string) {
    return this.searchHistoryService.deleteAllByUserId(userId);
  }
}

