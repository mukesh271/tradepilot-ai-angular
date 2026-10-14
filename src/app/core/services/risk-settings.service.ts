import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { RiskSettings, UpdateRiskSettingsRequest } from '../models/risk-settings.model';

const mockRiskSettings: RiskSettings = {
  id: 1,
  tradingCapital: 20000,
  riskPerTradePercent: 1,
  maximumDailyLossPercent: 2,
  minimumSignalScore: 75,
  paperTradingEnabled: true,
  createdAtUtc: '2025-01-02T10:00:00Z',
  updatedAtUtc: '2025-01-10T10:00:00Z'
};

@Injectable({ providedIn: 'root' })
export class RiskSettingsService {
  constructor(private readonly http: HttpClient) {}

  getRiskSettings(): Observable<ApiResponse<RiskSettings>> {
    if (environment.useMockData) {
      return of({ success: true, data: mockRiskSettings, message: 'Mock risk settings loaded.' });
    }

    return this.http.get<ApiResponse<RiskSettings>>(`${environment.apiBaseUrl}${API_ENDPOINTS.riskSettings}`)
      .pipe(map((response) => this.validateResponse(response)));
  }

  updateRiskSettings(settings: UpdateRiskSettingsRequest): Observable<ApiResponse<RiskSettings>> {
    if (environment.useMockData) {
      return of({
        success: true,
        data: { ...mockRiskSettings, ...settings, updatedAtUtc: new Date().toISOString() },
        message: 'Risk settings updated successfully.'
      });
    }

    return this.http.put<ApiResponse<RiskSettings>>(`${environment.apiBaseUrl}${API_ENDPOINTS.riskSettings}`, settings)
      .pipe(map((response) => this.validateResponse(response)));
  }

  private validateResponse<T>(response: ApiResponse<T>): ApiResponse<T> {
    if (!response.success || response.data === null) {
      throw new Error(response.message || response.errors?.join(' ') || 'The risk settings API returned no settings.');
    }
    return response;
  }
}
