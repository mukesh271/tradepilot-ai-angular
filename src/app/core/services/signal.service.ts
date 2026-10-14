import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { InstrumentType } from '../models/instrument.model';
import { CreateSignalRequest, Signal, SignalCondition, SignalDirection, SignalDto, SignalStatus } from '../models/signal.model';
import { Strategy } from '../models/strategy.model';

const mockSignalConditions: SignalCondition[] = [
  { id: 1, signalId: 1, name: 'Trend', score: 92, passed: true, explanation: 'Momentum remains aligned with the primary trend.', createdAtUtc: '2025-01-02T10:00:00Z' },
  { id: 2, signalId: 1, name: 'Volume', score: 88, passed: true, explanation: 'Volume expansion confirmed buyer participation.', createdAtUtc: '2025-01-02T10:00:00Z' },
  { id: 3, signalId: 1, name: 'RSI', score: 84, passed: true, explanation: 'RSI remains bullish without overextension.', createdAtUtc: '2025-01-02T10:00:00Z' },
  { id: 4, signalId: 1, name: 'VWAP', score: 80, passed: true, explanation: 'Price remains above VWAP with support.', createdAtUtc: '2025-01-02T10:00:00Z' },
  { id: 5, signalId: 1, name: 'Risk/Reward', score: 78, passed: true, explanation: 'Risk reward profile supports a disciplined setup.', createdAtUtc: '2025-01-02T10:00:00Z' }
];

const mockSignals: Signal[] = [
  {
    id: 1,
    instrumentId: 1,
    instrument: { id: 1, symbol: 'NIFTY', exchange: 'NSE', type: InstrumentType.Future, isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z', underlyingSymbol: 'NIFTY', lotSize: 50 },
    strategyId: 1,
    strategy: { id: 1, name: 'Breakout', description: 'Momentum breakout', isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z' } as Strategy,
    direction: SignalDirection.Bullish,
    signalScore: 86,
    entryPrice: 25100,
    stopLoss: 25050,
    target: 25200,
    riskRewardRatio: 2,
    timeFrame: '15M',
    explanation: 'NIFTY is holding above key breakout support while participation remains elevated.',
    status: SignalStatus.Detected,
    createdAtUtc: '2025-01-10T10:35:00Z',
    expiresAtUtc: '2025-01-10T11:35:00Z',
    conditions: mockSignalConditions
  },
  {
    id: 2,
    instrumentId: 2,
    instrument: { id: 2, symbol: 'RELIANCE', exchange: 'NSE', type: InstrumentType.Equity, isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z', lotSize: 1 },
    strategyId: 2,
    strategy: { id: 2, name: 'Breakout + Volume', description: 'Breakout with volume confirmation', isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z' } as Strategy,
    direction: SignalDirection.Bullish,
    signalScore: 81,
    entryPrice: 2860,
    stopLoss: 2845,
    target: 2890,
    riskRewardRatio: 1.75,
    timeFrame: '1H',
    explanation: 'Price is trending higher on increased participation, with a healthy support base.',
    status: SignalStatus.Confirmed,
    createdAtUtc: '2025-01-10T09:20:00Z',
    conditions: mockSignalConditions
  },
  {
    id: 3,
    instrumentId: 3,
    instrument: { id: 3, symbol: 'BANKNIFTY', exchange: 'NSE', type: InstrumentType.Future, isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z', underlyingSymbol: 'BANKNIFTY', lotSize: 15 },
    strategyId: 3,
    strategy: { id: 3, name: 'Support Reversal', description: 'Mean reversion at support', isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z' } as Strategy,
    direction: SignalDirection.Bearish,
    signalScore: 72,
    entryPrice: 50250,
    stopLoss: 50420,
    target: 49980,
    riskRewardRatio: 1.5,
    timeFrame: '30M',
    explanation: 'Bank Nifty is fading from resistance and rolling down as momentum weakens.',
    status: SignalStatus.Detected,
    createdAtUtc: '2025-01-10T08:30:00Z',
    conditions: mockSignalConditions
  }
];

const signalStatusValues: Record<string, SignalStatus> = {
  Detected: SignalStatus.Detected,
  Active: SignalStatus.Alerted,
  Alerted: SignalStatus.Alerted,
  Confirmed: SignalStatus.Confirmed,
  Expired: SignalStatus.Expired,
  Invalidated: SignalStatus.Invalidated
};

@Injectable({ providedIn: 'root' })
export class SignalService {
  constructor(private readonly http: HttpClient) {}

  getSignals(minimumScore?: number, status?: SignalStatus | string, instrument?: string): Observable<ApiResponse<Signal[]>> {
    if (environment.useMockData) {
      let signals = [...mockSignals];
      if (minimumScore !== undefined) {
        signals = signals.filter((signal) => signal.signalScore >= minimumScore);
      }
      if (status !== undefined) {
        const statusName = typeof status === 'number' ? SignalStatus[status] : status;
        const expectedStatus = signalStatusValues[statusName] ?? status;
        signals = signals.filter((signal) => signal.status === expectedStatus);
      }
      return of({ success: true, data: signals, message: 'Mock signals loaded.' });
    }

    let params = new HttpParams();
    if (minimumScore !== undefined) {
      params = params.set('minimumScore', String(minimumScore));
    }
    if (status !== undefined) {
      params = params.set('status', typeof status === 'number' ? SignalStatus[status] : status);
    }
    if (instrument?.trim()) {
      params = params.set('instrument', instrument.trim());
    }
    return this.http.get<ApiResponse<SignalDto[]>>(`${environment.apiBaseUrl}${API_ENDPOINTS.signals}`, { params })
      .pipe(map((response) => this.mapResponse(response, (items) => items.map((item) => this.mapSignal(item)))));
  }

  getSignal(id: number): Observable<ApiResponse<Signal>> {
    if (environment.useMockData) {
      const signal = mockSignals.find((item) => item.id === id) ?? mockSignals[0];
      return of({ success: true, data: signal, message: 'Mock signal loaded.' });
    }

    return this.http.get<ApiResponse<SignalDto>>(`${environment.apiBaseUrl}${API_ENDPOINTS.signals}/${id}`)
      .pipe(map((response) => this.mapResponse(response, (item) => this.mapSignal(item))));
  }

  createSignal(request: CreateSignalRequest): Observable<ApiResponse<Signal>> {
    if (environment.useMockData) {
      const direction = request.direction === 'Bullish' ? SignalDirection.Bullish
        : request.direction === 'Bearish' ? SignalDirection.Bearish
          : SignalDirection.Neutral;
      const created: Signal = {
        ...mockSignals[0],
        ...request,
        id: Date.now(),
        direction,
        expiresAtUtc: request.expiresAtUtc ?? undefined,
        conditions: request.conditions.map((condition, index) => ({
          ...condition,
          id: index + 1,
          signalId: Date.now(),
          createdAtUtc: new Date().toISOString()
        }))
      };
      return of({ success: true, data: created, message: 'Signal created successfully.' });
    }

    return this.http.post<ApiResponse<SignalDto>>(`${environment.apiBaseUrl}${API_ENDPOINTS.signals}`, request)
      .pipe(map((response) => this.mapResponse(response, (item) => this.mapSignal(item))));
  }

  private mapSignal(dto: SignalDto): Signal {
    const conditions: SignalCondition[] = (dto.conditions ?? []).map((condition) => ({
      ...condition,
      signalId: dto.id
    }));
    return {
      id: dto.id,
      instrumentId: dto.instrumentId,
      instrumentSymbol: dto.instrumentSymbol,
      strategyId: dto.strategyId,
      strategyName: dto.strategyName,
      direction: dto.direction === 'Bullish' ? SignalDirection.Bullish
        : dto.direction === 'Bearish' ? SignalDirection.Bearish
          : SignalDirection.Neutral,
      signalScore: dto.signalScore,
      entryPrice: dto.entryPrice,
      stopLoss: dto.stopLoss,
      target: dto.target,
      riskRewardRatio: dto.riskRewardRatio,
      timeFrame: dto.timeFrame,
      explanation: dto.explanation,
      status: dto.status,
      statusLabel: dto.status,
      createdAtUtc: dto.createdAtUtc,
      expiresAtUtc: dto.expiresAtUtc ?? undefined,
      conditions
    };
  }

  private mapResponse<T, R>(
    response: ApiResponse<T>,
    mapper: (data: T) => R
  ): ApiResponse<R> {
    if (!response.success || response.data === null) {
      throw new Error(response.message || response.errors?.join(' ') || 'The signals API request was unsuccessful.');
    }
    return { ...response, data: mapper(response.data) };
  }
}
