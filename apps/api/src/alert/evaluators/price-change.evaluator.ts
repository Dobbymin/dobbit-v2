import { Injectable } from '@nestjs/common';

@Injectable()
export class PriceChangeEvaluator {
  evaluate(currentPrice: number, basePrice: number, changePercentage: number): boolean {
    // TODO: Implement price change evaluation
    // Compare price change with threshold
    const actualChange = Math.abs((currentPrice - basePrice) / basePrice) * 100;
    return actualChange >= changePercentage;
  }
}
