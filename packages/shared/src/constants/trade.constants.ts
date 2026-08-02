/** 업비트 원화(KRW) 마켓 거래 수수료율 (0.05%) */
export const TRADE_FEE_RATE = 0.0005;

/** 체결금액에 대한 거래 수수료를 계산한다. */
export const calculateTradeFee = (totalAmount: number): number => totalAmount * TRADE_FEE_RATE;
