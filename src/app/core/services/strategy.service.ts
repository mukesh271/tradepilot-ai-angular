import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { Strategy } from '../models/strategy.model';

const mockStrategies: Strategy[] = [
  { id: 1, name: 'Breakout', description: 'Momentum continuation breakout above a recent range.', isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z' },
  { id: 2, name: 'Breakout + Volume', description: 'Breakout confirmed by a volume expansion and trend support.', isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z' },
  { id: 3, name: 'Support Reversal', description: 'Reversal occurring at a validated support area.', isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z' },
  { id: 4, name: 'Resistance Reversal', description: 'Short setup building around resistance rejection.', isActive: false, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z' },
  { id: 5, name: 'Trend Continuation', description: 'Keeps position in the prevailing trend direction.', isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z' },
  { id: 6, name: 'VWAP Momentum', description: 'Trend acceleration anchored to the VWAP.', isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z' },
  { id: 7, name: 'RSI Reversal', description: 'Mean reversion after an RSI exhaustion move.', isActive: false, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z' }
];

@Injectable({ providedIn: 'root' })
export class StrategyService {
  constructor(private readonly http: HttpClient) {}

  getStrategies(): Observable<ApiResponse<Strategy[]>> {
    if (environment.useMockData) {
      return of({ success: true, data: mockStrategies, message: 'Mock strategies loaded.' });
    }

    return this.http.get<ApiResponse<Strategy[]>>(`${environment.apiBaseUrl}${API_ENDPOINTS.strategies}`);
  }

  getStrategy(id: number): Observable<ApiResponse<Strategy>> {
    if (environment.useMockData) {
      const strategy = mockStrategies.find((item) => item.id === id) ?? mockStrategies[0];
      return of({ success: true, data: strategy, message: 'Mock strategy loaded.' });
    }

    return this.http.get<ApiResponse<Strategy>>(`${environment.apiBaseUrl}${API_ENDPOINTS.strategies}/${id}`);
  }
}
