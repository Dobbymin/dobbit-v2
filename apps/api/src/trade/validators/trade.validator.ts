import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class TradeValidator {
  validateQuantity(quantity: number): void {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new BadRequestException('수량은 0보다 커야 해요.');
    }
  }

  validatePrice(price: number): void {
    if (!Number.isFinite(price) || price <= 0) {
      throw new BadRequestException('가격은 0보다 커야 해요.');
    }
  }

  validateCashBalance(currentBalance: number, requiredAmount: number): void {
    if (currentBalance < requiredAmount) {
      throw new BadRequestException('잔액이 부족해요.');
    }
  }

  validateHoldings(currentHoldings: number, requiredQuantity: number): void {
    if (currentHoldings < requiredQuantity) {
      throw new BadRequestException('보유 수량이 부족해요.');
    }
  }
}
