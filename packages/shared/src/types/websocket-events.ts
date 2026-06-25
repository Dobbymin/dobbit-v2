// ============================================================================
// Market Events (Public)
// ============================================================================

export interface MarketTickerUpdatedEvent {
  type: "market.ticker.updated";
  marketCode: string;
  tradePrice: number;
  signedChangeRate: number;
  signedChangePrice: number;
  accTradeVolume24h: number;
  timestamp: string;
}

export interface MarketOrderbookUpdatedEvent {
  type: "market.orderbook.updated";
  marketCode: string;
  units: Array<{
    askPrice: number;
    bidPrice: number;
    askSize: number;
    bidSize: number;
  }>;
  timestamp: string;
}

// ============================================================================
// Trade Events (Private)
// ============================================================================

export interface TradeExecutedEvent {
  type: "trade.executed";
  tradeId: string;
  userId: string;
  marketCode: string;
  side: "BUY" | "SELL";
  price: number;
  quantity: number;
  totalAmount: number;
  executedAt: string;
}

// ============================================================================
// Wallet Events (Private)
// ============================================================================

export interface WalletUpdatedEvent {
  type: "wallet.updated";
  userId: string;
  marketCode: string;
  quantity: number;
  averagePrice: number;
  totalCost: number;
  evaluatedAmount: number;
  profitRate: number;
  updatedAt: string;
}

// ============================================================================
// Notification Events (Private)
// ============================================================================

export interface NotificationCreatedEvent {
  type: "notification.created";
  notificationId: string;
  userId: string;
  marketCode?: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  channels: Array<"WEBSOCKET" | "SLACK">;
  createdAt: string;
}

export interface NotificationDeliveryFailedEvent {
  type: "notification.delivery.failed";
  notificationId: string;
  userId: string;
  channel: "SLACK";
  reason: string;
  failedAt: string;
}

// ============================================================================
// Union Type
// ============================================================================

export type WebSocketEvent =
  | MarketTickerUpdatedEvent
  | MarketOrderbookUpdatedEvent
  | TradeExecutedEvent
  | WalletUpdatedEvent
  | NotificationCreatedEvent
  | NotificationDeliveryFailedEvent;
