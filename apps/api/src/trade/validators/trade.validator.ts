import { Injectable } from '@nestjs/common';

@Injectable()
export class TradeValidator {
  validateQuantity(quantity: number): boolean {
    // TODO: Implement quantity validation
    // - Must be positive
    // - Must meet minimum order size
    return quantity > 0;
  }

  validatePrice(price: number): boolean {
    // TODO: Implement price validation
    // - Must be positive
    // - Must meet acceptable range
    return price > 0;
  }

  validateCashBalance(currentBalance: number, requiredAmount: number): boolean {
    // TODO: Implement cash balance validation
    return currentBalance >= requiredAmount;
  }

  validateHoldings(currentHoldings: number, requiredQuantity: number): boolean {
    // TODO: Implement holdings validation
    return currentHoldings >= requiredQuantity;
  }
}
