import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { Instrument, InstrumentType } from '../models/instrument.model';

const mockInstruments: Instrument[] = [
  { id: 1, symbol: 'NIFTY', exchange: 'NSE', type: InstrumentType.Future, isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z', underlyingSymbol: 'NIFTY', lotSize: 50 },
  { id: 2, symbol: 'RELIANCE', exchange: 'NSE', type: InstrumentType.Equity, isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z', lotSize: 1 },
  { id: 3, symbol: 'BANKNIFTY', exchange: 'NSE', type: InstrumentType.Future, isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z', underlyingSymbol: 'BANKNIFTY', lotSize: 15 },
  { id: 4, symbol: 'INFY 250CE', exchange: 'NSE', type: InstrumentType.Option, isActive: true, createdAtUtc: '2025-01-02T10:00:00Z', updatedAtUtc: '2025-01-02T10:00:00Z', underlyingSymbol: 'INFY', expiryDate: '2025-01-30', strikePrice: 250, optionType: 'CE', lotSize: 250 }
];

@Injectable({ providedIn: 'root' })
export class InstrumentService {
  constructor(private readonly http: HttpClient) {}

  getInstruments(type?: InstrumentType): Observable<ApiResponse<Instrument[]>> {
    if (environment.useMockData) {
      const filtered = type ? mockInstruments.filter((item) => item.type === type) : mockInstruments;
      return of({ success: true, data: filtered, message: 'Mock instruments loaded.' });
    }

    let params = new HttpParams();
    if (type !== undefined) {
      params = params.set('type', String(type));
    }

    return this.http.get<ApiResponse<Instrument[]>>(`${environment.apiBaseUrl}${API_ENDPOINTS.instruments}`, { params });
  }

  getInstrument(id: number): Observable<ApiResponse<Instrument>> {
    if (environment.useMockData) {
      const instrument = mockInstruments.find((item) => item.id === id) ?? mockInstruments[0];
      return of({ success: true, data: instrument, message: 'Mock instrument loaded.' });
    }

    return this.http.get<ApiResponse<Instrument>>(`${environment.apiBaseUrl}${API_ENDPOINTS.instruments}/${id}`);
  }
}
