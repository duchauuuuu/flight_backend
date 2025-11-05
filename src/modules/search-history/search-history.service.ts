import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchHistory, SearchHistoryDocument } from './schemas/search-history.schema';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectModel(SearchHistory.name)
    private searchHistoryModel: Model<SearchHistoryDocument>,
  ) {}

  async create(createSearchHistoryDto: CreateSearchHistoryDto): Promise<SearchHistory> {
    const searchHistory = new this.searchHistoryModel(createSearchHistoryDto);
    return searchHistory.save();
  }

  async findByUserId(userId: string, limit: number = 10): Promise<SearchHistory[]> {
    return this.searchHistoryModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async delete(id: string): Promise<SearchHistory> {
    const deleted = await this.searchHistoryModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Search history not found');
    return deleted;
  }

  async deleteAllByUserId(userId: string): Promise<{ deletedCount: number }> {
    const result = await this.searchHistoryModel.deleteMany({ userId }).exec();
    return { deletedCount: result.deletedCount || 0 };
  }
}

