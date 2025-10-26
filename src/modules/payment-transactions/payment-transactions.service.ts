import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PaymentTransaction,
  PaymentTransactionDocument,
} from './schemas/payment-transaction.schema';
import { CreatePaymentTransactionDto } from './dto/create-payment-transaction.dto';
import { UpdatePaymentTransactionDto } from './dto/update-payment-transaction.dto';

@Injectable()
export class PaymentTransactionsService {
  constructor(
    @InjectModel(PaymentTransaction.name)
    private paymentTransactionModel: Model<PaymentTransactionDocument>,
  ) {}

  async create(
    createDto: CreatePaymentTransactionDto,
  ): Promise<PaymentTransaction> {
    const transaction = new this.paymentTransactionModel(createDto);
    return transaction.save();
  }

  async findAll(): Promise<PaymentTransaction[]> {
    return this.paymentTransactionModel
      .find()
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<PaymentTransaction> {
    const transaction = await this.paymentTransactionModel
      .findById(id)
      .populate('bookingId')
      .exec();
    if (!transaction)
      throw new NotFoundException('Payment transaction not found');
    return transaction;
  }

  async findByBookingId(bookingId: string): Promise<PaymentTransaction[]> {
    return this.paymentTransactionModel
      .find({ bookingId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByStatus(status: string): Promise<PaymentTransaction[]> {
    return this.paymentTransactionModel
      .find({ status })
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTransactionCode(
    transactionCode: string,
  ): Promise<PaymentTransaction | null> {
    return this.paymentTransactionModel
      .findOne({ transactionCode })
      .populate('bookingId')
      .exec();
  }

  async update(
    id: string,
    updateDto: UpdatePaymentTransactionDto,
  ): Promise<PaymentTransaction> {
    const updated = await this.paymentTransactionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('bookingId')
      .exec();
    if (!updated)
      throw new NotFoundException('Payment transaction not found');
    return updated;
  }

  async updateStatus(id: string, status: string): Promise<PaymentTransaction> {
    const updated = await this.paymentTransactionModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('bookingId')
      .exec();
    if (!updated)
      throw new NotFoundException('Payment transaction not found');
    return updated;
  }

  async delete(id: string): Promise<PaymentTransaction> {
    const deleted = await this.paymentTransactionModel
      .findByIdAndDelete(id)
      .exec();
    if (!deleted)
      throw new NotFoundException('Payment transaction not found');
    return deleted;
  }
}
