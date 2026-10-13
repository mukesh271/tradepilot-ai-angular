export enum TradeStatus {
  Open = 1,
  TargetHit = 2,
  StopLossHit = 3,
  ManuallyClosed = 4,
  Expired = 5
}

export interface PaperTrade {
  id: number;
  signalId: number;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  profitLoss?: number;
  status: TradeStatus;
  createdAtUtc: string;
  closedAtUtc?: string;
}
