import {
  Candle,
  IndicatorValue,
  StrategySetup,
  TechnicalAnalysis,
  TechnicalAnalysisTimeframe
} from '../models/technical-analysis.model';

const timeframeMilliseconds: Record<TechnicalAnalysisTimeframe, number> = {
  '1m': 60_000,
  '5m': 5 * 60_000,
  '15m': 15 * 60_000,
  '1h': 60 * 60_000,
  '1d': 24 * 60 * 60_000
};

export function createMockCandles(
  timeframe: TechnicalAnalysisTimeframe,
  limit = 200
): Candle[] {
  const interval = timeframeMilliseconds[timeframe];
  const end = timeframe === '1h'
    ? Date.UTC(2025, 0, 10, 15)
    : timeframe === '1d'
      ? Date.UTC(2025, 0, 10)
      : Date.UTC(2025, 0, 10, 15, 30);
  const total = Math.max(240, limit);

  return Array.from({ length: total }, (_, index) => {
    const timestamp = end - (total - index - 1) * interval;
    const base = 24_850 + index * 1.15 + Math.sin(index / 8) * 38 + Math.sin(index / 19) * 24;
    const open = Number(base.toFixed(2));
    const close = Number((base + Math.sin(index * 1.7) * 16 + 3).toFixed(2));
    const high = Number((Math.max(open, close) + 9 + (index % 5)).toFixed(2));
    const low = Number((Math.min(open, close) - 8 - (index % 4)).toFixed(2));

    return {
      timestamp: new Date(timestamp).toISOString(),
      open,
      high,
      low,
      close,
      volume: 1_200 + (index % 11) * 73 + Math.round((Math.sin(index / 4) + 1) * 420)
    };
  }).slice(-limit);
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getIndicators(candles: Candle[], timeframe: TechnicalAnalysisTimeframe): IndicatorValue[] {
  const closes = candles.map((candle) => candle.close);
  const latest = candles[candles.length - 1];
  const sma20 = candles.length >= 20 ? mean(closes.slice(-20)) : null;
  const sma50 = candles.length >= 50 ? mean(closes.slice(-50)) : null;
  const volumeSma20 = candles.length >= 20 ? mean(candles.slice(-20).map((candle) => candle.volume)) : null;
  const recentCloses = closes.slice(-15);
  const gainLoss = recentCloses.slice(1).map((value, index) => value - recentCloses[index]);
  const gains = gainLoss.filter((change) => change > 0).reduce((sum, value) => sum + value, 0);
  const losses = Math.abs(gainLoss.filter((change) => change < 0).reduce((sum, value) => sum + value, 0));
  const rsi = candles.length < 15 ? null : losses === 0 ? 100 : 100 - (100 / (1 + gains / losses));
  const tr = candles.slice(-14).map((candle, index, recent) => {
    const priorClose = recent[index - 1]?.close ?? candle.close;
    return Math.max(candle.high - candle.low, Math.abs(candle.high - priorClose), Math.abs(candle.low - priorClose));
  });
  const sessionStart = timeframe === '1d' ? candles.length : candles.findIndex((candle, index) =>
    index > 0 && new Date(candle.timestamp).getUTCDate() !== new Date(candles[index - 1].timestamp).getUTCDate());
  const vwapCandles = candles.slice(Math.max(0, sessionStart));
  const vwap = timeframe === '1d' || !vwapCandles.length ? null : vwapCandles.reduce((sum, candle) => sum + ((candle.high + candle.low + candle.close) / 3) * candle.volume, 0)
    / vwapCandles.reduce((sum, candle) => sum + candle.volume, 0);
  const ema = (values: number[], period: number): number => {
    const multiplier = 2 / (period + 1);
    return values.slice(1).reduce((value, close) => close * multiplier + value * (1 - multiplier), values[0]);
  };
  const macdValues = closes.slice(-60);
  const macdLine = candles.length < 34 ? null : ema(macdValues, 12) - ema(macdValues, 26);
  const macdSignal = macdLine === null ? null : macdLine * 0.82;

  return [
    { key: 'latestClose', label: 'Latest close', value: latest.close, description: 'The closing price of the latest analyzed candle.' },
    { key: 'sma20', label: 'SMA20', value: sma20, description: 'Average closing price over the last 20 candles.' },
    { key: 'sma50', label: 'SMA50', value: sma50, description: 'Average closing price over the last 50 candles.' },
    { key: 'ema9', label: 'EMA9', value: candles.length < 9 ? null : ema(closes.slice(-40), 9), description: 'A 9-candle moving average that weights recent closes more heavily.' },
    { key: 'ema21', label: 'EMA21', value: candles.length < 21 ? null : ema(closes.slice(-60), 21), description: 'A 21-candle moving average that weights recent closes more heavily.' },
    { key: 'rsi14', label: 'RSI14', value: rsi, description: 'Momentum gauge comparing recent average gains and losses.', unit: ' points' },
    { key: 'macdLine', label: 'MACD line', value: macdLine, description: 'Difference between the 12- and 26-candle exponential averages.' },
    { key: 'macdSignal', label: 'MACD signal', value: macdSignal, description: 'A smoothed reference line for the MACD line.' },
    { key: 'macdHistogram', label: 'MACD histogram', value: macdLine === null || macdSignal === null ? null : macdLine - macdSignal, description: 'Difference between the MACD line and its signal line.' },
    { key: 'vwap', label: 'VWAP', value: vwap, description: 'Volume-weighted average price across the displayed sample.' },
    { key: 'atr14', label: 'ATR14', value: candles.length < 15 ? null : mean(tr), description: 'Average true range over the last 14 candles; a measure of price range.' },
    { key: 'volumeSma20', label: 'Volume SMA20', value: volumeSma20, description: 'Average traded volume over the last 20 candles.', unit: ' shares' },
    { key: 'relativeVolume', label: 'Relative volume', value: volumeSma20 === null ? null : latest.volume / volumeSma20, description: 'Latest volume divided by its 20-candle average.', unit: '×' }
  ].map((indicator) => ({ ...indicator, value: indicator.value === null ? null : Number(indicator.value.toFixed(2)) }));
}

function getMockStrategies(): StrategySetup[] {
  return [
    {
      name: 'Breakout',
      status: 'Incomplete',
      direction: 'Bullish',
      conditionsPassed: 2,
      conditionsTotal: 3,
      explanation: 'Mock example only. One required condition has not passed, so this setup is incomplete.',
      conditions: [
        { name: 'Close above resistance', passed: true, actualValue: '25,194.20', threshold: '25,180.00', explanation: 'The latest close is above the sample resistance level.' },
        { name: 'SMA20 above SMA50', passed: true, actualValue: '25,173.45 vs 25,149.02', threshold: 'SMA20 > SMA50', explanation: 'The short average is above the longer average.' },
        { name: 'Breakout volume', passed: false, actualValue: '0.94× average', threshold: '≥ 1.20×', explanation: 'Sample volume does not meet the illustrative threshold.' }
      ]
    },
    {
      name: 'Breakout + Volume',
      status: 'InsufficientData',
      conditionsPassed: 1,
      conditionsTotal: 3,
      explanation: 'Insufficient confirmation in this illustrative response.',
      conditions: [
        { name: 'Price breakout', passed: true, actualValue: '25,194.20', threshold: '25,180.00' },
        { name: 'Volume expansion', passed: false, actualValue: '0.94×', threshold: '≥ 1.50×' },
        { name: 'Trend alignment', passed: null, explanation: 'Not evaluated by this mock result.' }
      ]
    },
    {
      name: 'Trend Continuation',
      status: 'Incomplete',
      direction: 'Bullish',
      conditionsPassed: 1,
      conditionsTotal: 2,
      explanation: 'The illustrative pullback condition is not met.',
      conditions: [
        { name: 'Trend alignment', passed: true, actualValue: 'SMA20 > SMA50', threshold: 'SMA20 > SMA50' },
        { name: 'Pullback holds EMA21', passed: false, actualValue: 'Below EMA21', threshold: 'Close ≥ EMA21' }
      ]
    },
    {
      name: 'Support Reversal',
      status: 'InsufficientData',
      explanation: 'The mock response has no confirmed support-reversal setup.',
      conditions: [{ name: 'Support rejection', passed: null, explanation: 'Insufficient data for this condition.' }]
    },
    {
      name: 'Resistance Reversal',
      status: 'Incomplete',
      explanation: 'No illustrative resistance-reversal setup was returned.',
      conditions: [{ name: 'Resistance rejection', passed: false, actualValue: 'No rejection', threshold: 'Rejection candle required' }]
    }
  ];
}

export function createMockAnalysis(
  timeframe: TechnicalAnalysisTimeframe,
  candles: Candle[]
): TechnicalAnalysis {
  const indicators = candles.length ? getIndicators(candles, timeframe) : [];
  const strategies = candles.length >= 50 ? getMockStrategies() : getMockStrategies().map((strategy) => ({
    ...strategy,
    status: 'InsufficientData',
    conditionsPassed: 0,
    conditionsTotal: strategy.conditions.length,
    explanation: 'Insufficient sample history to evaluate this strategy.'
  }));
  return {
    timeframe,
    latestCandleAt: candles[candles.length - 1]?.timestamp ?? null,
    lastClose: candles[candles.length - 1]?.close ?? null,
    indicators,
    strategies,
    warnings: candles.length < 50 ? ['Insufficient candle history to calculate the sample indicators.'] : [],
    insufficientData: candles.length < 50,
    message: candles.length < 50 ? 'At least 50 candles are needed for this sample analysis.' : undefined
  };
}
