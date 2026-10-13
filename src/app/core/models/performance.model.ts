export interface StrategyPerformance {
  strategyId: number;
  strategyName?: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  totalNetProfitLoss: number;
  averageWinningTrade: number;
  averageLosingTrade: number;
  maximumDrawdown: number;
  calculatedAtUtc: string;
}
