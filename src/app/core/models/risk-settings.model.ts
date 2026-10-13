export interface RiskSettings {
  id: number;
  tradingCapital: number;
  riskPerTradePercent: number;
  maximumDailyLossPercent: number;
  minimumSignalScore: number;
  paperTradingEnabled: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}
