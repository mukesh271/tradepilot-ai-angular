export const TECHNICAL_ANALYSIS_TIMEFRAMES = ['1m', '5m', '15m', '1h', '1d'] as const;

export type TechnicalAnalysisTimeframe = (typeof TECHNICAL_ANALYSIS_TIMEFRAMES)[number];

export interface Candle {
  id?: number;
  instrumentId?: number;
  timeframe?: TechnicalAnalysisTimeframe;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorValue {
  key: string;
  label: string;
  value: number | null;
  description: string;
  unit?: string;
}

export interface StrategyCondition {
  name: string;
  passed: boolean | null;
  actualValue?: string | number | null;
  threshold?: string | number | null;
  explanation?: string;
}

export interface StrategySetup {
  name: string;
  status: string;
  direction?: string | null;
  conditionsPassed?: number | null;
  conditionsTotal?: number | null;
  conditions: StrategyCondition[];
  explanation?: string;
}

export interface TechnicalAnalysis {
  instrumentId?: number;
  symbol?: string;
  timeframe: TechnicalAnalysisTimeframe;
  latestCandleAt: string | null;
  lastClose: number | null;
  createdAtUtc?: string;
  indicators: IndicatorValue[];
  strategies: StrategySetup[];
  warnings: string[];
  insufficientData: boolean;
  message?: string;
}

export interface CandleDto {
  id: number;
  instrumentId: number;
  timeframe: TechnicalAnalysisTimeframe;
  timestampUtc: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnalysisConditionDto {
  name: string;
  passed: boolean;
  explanation: string;
  actualValue: number | null;
  expectedValue: number | null;
}

export interface AnalysisSetupDto {
  strategyName: string;
  direction: string | null;
  conditions: AnalysisConditionDto[];
  conditionsPassed: number;
  totalConditions: number;
  status: 'Complete' | 'Incomplete' | 'InsufficientData' | string;
  explanation: string;
}

export interface TechnicalAnalysisResultDto {
  instrumentId: number;
  symbol: string;
  timeframe: TechnicalAnalysisTimeframe;
  lastCandleTimestampUtc: string;
  lastClose: number;
  sma20: number | null;
  sma50: number | null;
  ema9: number | null;
  ema21: number | null;
  rsi14: number | null;
  macdLine: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  vwap: number | null;
  atr14: number | null;
  volumeSma20: number | null;
  relativeVolume: number | null;
  createdAtUtc: string;
  setups: AnalysisSetupDto[];
}

export interface ImportCandleRequest {
  timestampUtc: string;
  timeframe: TechnicalAnalysisTimeframe;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ImportCandlesResult {
  requested: number;
  imported: number;
  skipped: number;
  errors: string[];
}

export interface CalculateAnalysisRequest {
  timeframe: TechnicalAnalysisTimeframe;
  limit?: number;
  relativeVolumeThreshold?: number;
  breakoutLookback?: number;
}
