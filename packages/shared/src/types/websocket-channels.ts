export const WsChannels = {
  market: (marketCode: string) => `market:${marketCode}`,
  user: (userId: string) => `user:${userId}`,
} as const;

export const WsEvents = {
  MARKET_TICKER_UPDATED: "market.ticker.updated",
  MARKET_ORDERBOOK_UPDATED: "market.orderbook.updated",
  TRADE_EXECUTED: "trade.executed",
  WALLET_UPDATED: "wallet.updated",
  NOTIFICATION_CREATED: "notification.created",
  NOTIFICATION_DELIVERY_FAILED: "notification.delivery.failed",
} as const;

// Client → Server 이벤트
export const WsClientEvents = {
  MARKET_JOIN: "market:join",
  MARKET_LEAVE: "market:leave",
  PRIVATE_JOIN: "private:join",
} as const;
