import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { PaymentTransactionsService } from './payment-transactions.service';
import { PaymentTransaction } from './schemas/payment-transaction.schema';
import { CreatePaymentTransactionDto } from './dto/create-payment-transaction.dto';
import { UpdatePaymentTransactionDto } from './dto/update-payment-transaction.dto';

@Controller('payment-transactions')
export class PaymentTransactionsController {
  constructor(
    private readonly paymentTransactionsService: PaymentTransactionsService,
  ) {}

  @Post()
  create(
    @Body() createDto: CreatePaymentTransactionDto,
  ): Promise<PaymentTransaction> {
    return this.paymentTransactionsService.create(createDto);
  }

  @Get()
  findAll(
    @Query('bookingId') bookingId?: string,
    @Query('status') status?: string,
  ): Promise<PaymentTransaction[]> {
    if (bookingId) {
      return this.paymentTransactionsService.findByBookingId(bookingId);
    }
    if (status) {
      return this.paymentTransactionsService.findByStatus(status);
    }
    return this.paymentTransactionsService.findAll();
  }

  @Get('transaction-code/:code')
  findByTransactionCode(
    @Param('code') code: string,
  ): Promise<PaymentTransaction | null> {
    return this.paymentTransactionsService.findByTransactionCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PaymentTransaction> {
    return this.paymentTransactionsService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePaymentTransactionDto,
  ): Promise<PaymentTransaction> {
    return this.paymentTransactionsService.update(id, updateDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<PaymentTransaction> {
    return this.paymentTransactionsService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<PaymentTransaction> {
    return this.paymentTransactionsService.delete(id);
  }
}
