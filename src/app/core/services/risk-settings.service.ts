import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { RiskSettings } from '../models/risk-settings.model';

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

    return this.http.get<ApiResponse<RiskSettings>>(`${environment.apiBaseUrl}${API_ENDPOINTS.riskSettings}`);
  }

  updateRiskSettings(settings: RiskSettings): Observable<ApiResponse<RiskSettings>> {
    if (environment.useMockData) {
      return of({ success: true, data: settings, message: 'Risk settings updated successfully.' });
    }

    return this.http.put<ApiResponse<RiskSettings>>(`${environment.apiBaseUrl}${API_ENDPOINTS.riskSettings}`, settings);
  }
}
