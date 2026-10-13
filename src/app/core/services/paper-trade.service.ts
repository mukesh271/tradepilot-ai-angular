import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { PaperTrade, TradeStatus } from '../models/paper-trade.model';

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

    return this.http.get<ApiResponse<PaperTrade[]>>(`${environment.apiBaseUrl}${API_ENDPOINTS.paperTrades}`);
  }

  getPaperTrade(id: number): Observable<ApiResponse<PaperTrade>> {
    if (environment.useMockData) {
      const trade = mockPaperTrades.find((item) => item.id === id) ?? mockPaperTrades[0];
      return of({ success: true, data: trade, message: 'Mock paper trade loaded.' });
    }

    return this.http.get<ApiResponse<PaperTrade>>(`${environment.apiBaseUrl}${API_ENDPOINTS.paperTrades}/${id}`);
  }

  createPaperTrade(payload: Partial<PaperTrade>): Observable<ApiResponse<PaperTrade>> {
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

    return this.http.post<ApiResponse<PaperTrade>>(`${environment.apiBaseUrl}${API_ENDPOINTS.paperTrades}`, payload);
  }

  closePaperTrade(id: number): Observable<ApiResponse<PaperTrade>> {
    if (environment.useMockData) {
      const existing = mockPaperTrades.find((item) => item.id === id) ?? mockPaperTrades[0];
      const updated = { ...existing, status: TradeStatus.ManuallyClosed, closedAtUtc: new Date().toISOString() };
      return of({ success: true, data: updated, message: 'Paper trade closed.' });
    }

    return this.http.post<ApiResponse<PaperTrade>>(`${environment.apiBaseUrl}${API_ENDPOINTS.paperTrades}/${id}/close`, {});
  }
}
