import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import {
  ClosePaperTradeRequest,
  CreatePaperTradeRequest,
  PaperTrade,
  PaperTradeDto,
  TradeStatus
} from '../models/paper-trade.model';

const mockPaperTrades: PaperTrade[] = [
  { id: 1, signalId: 1, entryPrice: 25110, quantity: 25, profitLoss: 1100, status: TradeStatus.Open, createdAtUtc: '2025-01-10T10:35:00Z' },
  { id: 2, signalId: 2, entryPrice: 2858, exitPrice: 2892, quantity: 30, profitLoss: 1020, status: TradeStatus.TargetHit, createdAtUtc: '2025-01-09T09:20:00Z', closedAtUtc: '2025-01-09T11:00:00Z' }
];

@Injectable({ providedIn: 'root' })
export class PaperTradeService {
  constructor(private readonly http: HttpClient) {}

  getPaperTrades(): Observable<ApiResponse<PaperTrade[]>> {
    if (environment.useMockData) {
      return of({ success: true, data: mockPaperTrades, message: 'Mock paper trades loaded.' });
    }

    return this.http.get<ApiResponse<PaperTradeDto[]>>(`${environment.apiBaseUrl}${API_ENDPOINTS.paperTrades}`)
      .pipe(map((response) => this.mapResponse(response, (trades) => trades.map((trade) => this.mapTrade(trade)))));
  }

  getPaperTrade(id: number): Observable<ApiResponse<PaperTrade>> {
    if (environment.useMockData) {
      const trade = mockPaperTrades.find((item) => item.id === id) ?? mockPaperTrades[0];
      return of({ success: true, data: trade, message: 'Mock paper trade loaded.' });
    }

    return this.http.get<ApiResponse<PaperTradeDto>>(`${environment.apiBaseUrl}${API_ENDPOINTS.paperTrades}/${id}`)
      .pipe(map((response) => this.mapResponse(response, (trade) => this.mapTrade(trade))));
  }

  createPaperTrade(payload: CreatePaperTradeRequest): Observable<ApiResponse<PaperTrade>> {
    if (environment.useMockData) {
      const created: PaperTrade = {
        id: Date.now(),
        signalId: payload.signalId ?? 1,
        entryPrice: payload.entryPrice ?? 100,
        quantity: payload.quantity ?? 1,
        status: TradeStatus.Open,
        createdAtUtc: new Date().toISOString()
      };
      return of({ success: true, data: created, message: 'Paper trade created successfully.' });
    }

    return this.http.post<ApiResponse<PaperTradeDto>>(`${environment.apiBaseUrl}${API_ENDPOINTS.paperTrades}`, payload)
      .pipe(map((response) => this.mapResponse(response, (trade) => this.mapTrade(trade))));
  }

  closePaperTrade(id: number, payload: ClosePaperTradeRequest): Observable<ApiResponse<PaperTrade>> {
    if (environment.useMockData) {
      const existing = mockPaperTrades.find((item) => item.id === id) ?? mockPaperTrades[0];
      const updated = {
        ...existing,
        exitPrice: payload.exitPrice,
        status: TradeStatus.ManuallyClosed,
        statusLabel: 'ManuallyClosed',
        closedAtUtc: new Date().toISOString()
      };
      return of({ success: true, data: updated, message: 'Paper trade closed.' });
    }

    return this.http.post<ApiResponse<PaperTradeDto>>(
      `${environment.apiBaseUrl}${API_ENDPOINTS.paperTrades}/${id}/close`,
      payload
    ).pipe(map((response) => this.mapResponse(response, (trade) => this.mapTrade(trade))));
  }

  private mapTrade(dto: PaperTradeDto): PaperTrade {
    const statusMap: Record<string, TradeStatus> = {
      Open: TradeStatus.Open,
      TargetHit: TradeStatus.TargetHit,
      StopLossHit: TradeStatus.StopLossHit,
      ManuallyClosed: TradeStatus.ManuallyClosed,
      Expired: TradeStatus.Expired
    };
    return {
      id: dto.id,
      signalId: dto.signalId,
      signalDirection: dto.signalDirection,
      entryPrice: dto.entryPrice,
      exitPrice: dto.exitPrice ?? undefined,
      quantity: dto.quantity,
      profitLoss: dto.profitLoss ?? undefined,
      status: statusMap[dto.status] ?? this.invalidStatus(dto.status),
      statusLabel: dto.status,
      createdAtUtc: dto.createdAtUtc,
      closedAtUtc: dto.closedAtUtc ?? undefined
    };
  }

  private invalidStatus(status: string): never {
    throw new Error(`The paper trades API returned an unsupported status: ${status}`);
  }

  private mapResponse<T, R>(response: ApiResponse<T>, mapper: (data: T) => R): ApiResponse<R> {
    if (!response.success || response.data === null) {
      throw new Error(response.message || response.errors?.join(' ') || 'The paper trades API request was unsuccessful.');
    }
    return { ...response, data: mapper(response.data) };
  }
}
