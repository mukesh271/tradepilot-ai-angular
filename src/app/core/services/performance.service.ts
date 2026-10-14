import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { PerformanceMetrics } from '../models/performance.model';

const mockPerformance: PerformanceMetrics = {
    totalTrades: 10,
    winningTrades: 7,
    losingTrades: 3,
    winRate: 70,
    profitFactor: 1.75,
    totalNetProfitLoss: 2400,
    averageWinningTrade: 680,
    averageLosingTrade: -280,
    maximumDrawdown: 1250,
    calculatedAtUtc: '2025-01-10T10:00:00Z'
};

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  constructor(private readonly http: HttpClient) {}

  getPerformance(): Observable<ApiResponse<PerformanceMetrics>> {
    if (environment.useMockData) {
      return of({ success: true, data: mockPerformance, message: 'Mock performance loaded.' });
    }

    return this.http.get<ApiResponse<PerformanceMetrics>>(`${environment.apiBaseUrl}${API_ENDPOINTS.performance}`);
  }

  getStrategyPerformance(strategyId: number): Observable<ApiResponse<PerformanceMetrics>> {
    if (environment.useMockData) {
      const item = { ...mockPerformance, strategyId, strategyName: 'Breakout' };
      return of({ success: true, data: item, message: 'Mock strategy performance loaded.' });
    }

    return this.http.get<ApiResponse<PerformanceMetrics>>(`${environment.apiBaseUrl}${API_ENDPOINTS.performance}/strategy/${strategyId}`);
  }
}
