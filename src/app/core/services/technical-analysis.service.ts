import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import {
  CalculateAnalysisRequest,
  Candle,
  CandleDto,
  ImportCandleRequest,
  ImportCandlesResult,
  TechnicalAnalysis,
  TechnicalAnalysisResultDto,
  TechnicalAnalysisTimeframe
} from '../models/technical-analysis.model';
import { createMockAnalysis, createMockCandles } from './technical-analysis-mock-data';

interface BackendResponse<T> {
  success: boolean;
  data: T | null;
  message?: string | null;
  errors?: string[] | null;
}

const indicatorDefinitions = [
  ['latestClose', 'Latest close', 'The closing price of the latest analyzed candle.'],
  ['sma20', 'SMA20', 'Average closing price over the last 20 candles.'],
  ['sma50', 'SMA50', 'Average closing price over the last 50 candles.'],
  ['ema9', 'EMA9', 'A 9-candle moving average that weights recent closes more heavily.'],
  ['ema21', 'EMA21', 'A 21-candle moving average that weights recent closes more heavily.'],
  ['rsi14', 'RSI14', 'Momentum gauge comparing recent average gains and losses.'],
  ['macdLine', 'MACD line', 'Difference between the 12- and 26-candle exponential averages.'],
  ['macdSignal', 'MACD signal', 'A smoothed reference line for the MACD line.'],
  ['macdHistogram', 'MACD histogram', 'Difference between the MACD line and its signal line.'],
  ['vwap', 'VWAP', 'Volume-weighted average price for the current session.'],
  ['atr14', 'ATR14', 'Average true range over the last 14 candles; a measure of price range.'],
  ['volumeSma20', 'Volume SMA20', 'Average traded volume over the last 20 candles.', ' shares'],
  ['relativeVolume', 'Relative volume', 'Latest volume divided by its 20-candle average.', '×']
] as const;

@Injectable({ providedIn: 'root' })
export class TechnicalAnalysisService {
  constructor(private readonly http: HttpClient) {}

  getCandles(
    instrumentId: number,
    timeframe: TechnicalAnalysisTimeframe,
    limit = 200
  ): Observable<ApiResponse<Candle[]>> {
    if (environment.useMockData) {
      return of({
        success: true,
        data: createMockCandles(timeframe, limit),
        message: 'Deterministic mock candles. This is historical sample data, not live market data.'
      });
    }

    const params = new HttpParams().set('timeframe', timeframe).set('limit', limit);
    return this.http.get<BackendResponse<CandleDto[]>>(
      `${environment.apiBaseUrl}${API_ENDPOINTS.candles}/${instrumentId}`,
      { params }
    ).pipe(map((response) => this.mapResponse(response, (data) => data.map((candle) => ({
      id: candle.id,
      instrumentId: candle.instrumentId,
      timeframe: candle.timeframe,
      timestamp: candle.timestampUtc,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume
    })))));
  }

  getAnalysis(
    instrumentId: number,
    timeframe: TechnicalAnalysisTimeframe
  ): Observable<ApiResponse<TechnicalAnalysis>> {
    if (environment.useMockData) {
      const candles = createMockCandles(timeframe);
      return of({
        success: true,
        data: createMockAnalysis(timeframe, candles),
        message: 'Deterministic mock analysis. This is not a prediction or trading recommendation.'
      });
    }

    const params = new HttpParams().set('timeframe', timeframe);
    return this.http.get<BackendResponse<TechnicalAnalysisResultDto>>(
      `${environment.apiBaseUrl}${API_ENDPOINTS.analysis}/${instrumentId}`,
      { params }
    ).pipe(map((response) => this.mapResponse(response, (data) => this.mapAnalysis(data))));
  }

  getAnalysisHistory(
    instrumentId: number,
    timeframe: TechnicalAnalysisTimeframe,
    limit = 50
  ): Observable<ApiResponse<TechnicalAnalysis[]>> {
    if (environment.useMockData) {
      const candles = createMockCandles(timeframe, Math.max(limit + 49, 50));
      const snapshots = candles.slice(-limit).map((_, index) =>
        createMockAnalysis(timeframe, candles.slice(0, candles.length - limit + index + 1)));
      return of({ success: true, data: snapshots, message: 'Deterministic mock analysis history.' });
    }

    const params = new HttpParams().set('timeframe', timeframe).set('limit', limit);
    return this.http.get<BackendResponse<TechnicalAnalysisResultDto[]>>(
      `${environment.apiBaseUrl}${API_ENDPOINTS.analysis}/${instrumentId}/history`,
      { params }
    ).pipe(map((response) => this.mapResponse(response, (data) => data.map((item) => this.mapAnalysis(item)))));
  }

  calculateAnalysis(
    instrumentId: number,
    timeframe: TechnicalAnalysisTimeframe,
    options: Omit<CalculateAnalysisRequest, 'timeframe'> = {}
  ): Observable<ApiResponse<TechnicalAnalysis>> {
    if (environment.useMockData) {
      const candles = createMockCandles(timeframe);
      return of({
        success: true,
        data: createMockAnalysis(timeframe, candles),
        message: 'Mock analysis completed. This sample does not evaluate live market data.'
      });
    }

    const body: CalculateAnalysisRequest = { timeframe, ...options };
    return this.http.post<BackendResponse<TechnicalAnalysisResultDto>>(
      `${environment.apiBaseUrl}${API_ENDPOINTS.analysis}/${instrumentId}/calculate`,
      body
    ).pipe(map((response) => this.mapResponse(response, (data) => this.mapAnalysis(data))));
  }

  importCandles(instrumentId: number, candles: ImportCandleRequest[]): Observable<ApiResponse<ImportCandlesResult>> {
    if (environment.useMockData) {
      return of({
        success: true,
        data: { requested: candles.length, imported: 0, skipped: 0, errors: ['Mock mode does not persist candles.'] },
        message: 'Mock candle import is not persisted; no backend data was changed.'
      });
    }

    const params = new HttpParams().set('instrumentId', instrumentId);
    return this.http.post<BackendResponse<ImportCandlesResult>>(
      `${environment.apiBaseUrl}${API_ENDPOINTS.candleImport}`,
      { candles },
      { params }
    ).pipe(map((response) => this.mapResponse(response, (data) => data)));
  }

  private mapAnalysis(dto: TechnicalAnalysisResultDto): TechnicalAnalysis {
    const values: Record<string, number | null> = {
      latestClose: dto.lastClose,
      sma20: dto.sma20,
      sma50: dto.sma50,
      ema9: dto.ema9,
      ema21: dto.ema21,
      rsi14: dto.rsi14,
      macdLine: dto.macdLine,
      macdSignal: dto.macdSignal,
      macdHistogram: dto.macdHistogram,
      vwap: dto.vwap,
      atr14: dto.atr14,
      volumeSma20: dto.volumeSma20,
      relativeVolume: dto.relativeVolume
    };
    const setups = (dto.setups ?? []).map((setup) => ({
      name: setup.strategyName,
      status: setup.status,
      direction: setup.direction,
      conditionsPassed: setup.conditionsPassed,
      conditionsTotal: setup.totalConditions,
      explanation: setup.explanation,
      conditions: (setup.conditions ?? []).map((condition) => ({
        name: condition.name,
        passed: condition.passed,
        actualValue: condition.actualValue,
        threshold: condition.expectedValue,
        explanation: condition.explanation
      }))
    }));
    const insufficientData = setups.some((setup) => setup.status.toLowerCase() === 'insufficientdata');

    return {
      instrumentId: dto.instrumentId,
      symbol: dto.symbol,
      timeframe: dto.timeframe,
      latestCandleAt: dto.lastCandleTimestampUtc,
      lastClose: dto.lastClose,
      createdAtUtc: dto.createdAtUtc,
      indicators: indicatorDefinitions.map(([key, label, description, unit]) => ({
        key,
        label,
        description,
        value: values[key] ?? null,
        ...(unit ? { unit } : {})
      })),
      strategies: setups,
      warnings: insufficientData ? ['Some strategy conditions could not be evaluated because candle history is insufficient.'] : [],
      insufficientData
    };
  }

  private mapResponse<TDto, TResult>(
    response: BackendResponse<TDto>,
    mapper: (data: TDto) => TResult
  ): ApiResponse<TResult> {
    if (!response.success || response.data === null) {
      const details = response.errors?.length ? ` ${response.errors.join(' ')}` : '';
      throw new Error(`${response.message || 'The API request was unsuccessful.'}${details}`);
    }
    return { success: true, data: mapper(response.data), message: response.message ?? undefined };
  }
}
