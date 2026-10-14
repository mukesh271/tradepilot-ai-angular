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
  statusLabel?: string;
  signalDirection?: string;
  createdAtUtc: string;
  closedAtUtc?: string;
}

export interface PaperTradeDto {
  id: number;
  signalId: number;
  signalDirection: string;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  profitLoss: number | null;
  status: string;
  createdAtUtc: string;
  closedAtUtc: string | null;
}

export interface CreatePaperTradeRequest {
  signalId: number;
  entryPrice: number;
  quantity: number;
}

export interface ClosePaperTradeRequest {
  exitPrice: number;
  exitReason: string;
}
