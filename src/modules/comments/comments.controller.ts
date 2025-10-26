import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto): Promise<Comment> {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  findAll(
    @Query('flightId') flightId?: string,
    @Query('userId') userId?: string,
  ): Promise<Comment[]> {
    if (flightId) {
      return this.commentsService.findByFlightId(flightId);
    }
    if (userId) {
      return this.commentsService.findByUserId(userId);
    }
    return this.commentsService.findAll();
  }

  @Get('flight/:flightId/average-rating')
  getAverageRating(@Param('flightId') flightId: string): Promise<number> {
    return this.commentsService.getAverageRating(flightId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Comment> {
    return this.commentsService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Comment> {
    return this.commentsService.delete(id);
  }
}
