import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PaperTradeService } from './paper-trade.service';
import { environment } from '../../../environments/environment';

describe('PaperTradeService', () => {
  let service: PaperTradeService;
  let http: HttpTestingController;
  let originalMockSetting: boolean;

  beforeEach(() => {
    originalMockSetting = environment.useMockData;
    environment.useMockData = true;
    TestBed.configureTestingModule({
      providers: [PaperTradeService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PaperTradeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    environment.useMockData = originalMockSetting;
    http.verify();
  });

  it('should load mock paper trades', () => {
    service.getPaperTrades().subscribe((response) => {
      expect(response.success).toBeTrue();
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  it('should create a paper trade successfully', () => {
    service.createPaperTrade({ signalId: 1, entryPrice: 25100, quantity: 10 }).subscribe((response) => {
      expect(response.success).toBeTrue();
      expect(response.data.signalId).toBe(1);
      expect(response.data.quantity).toBe(10);
    });
  });

  it('uses the documented paperTrades route in real API mode', () => {
    environment.useMockData = false;
    service.getPaperTrades().subscribe();

    const request = http.expectOne(`${environment.apiBaseUrl}/paperTrades`);
    expect(request.request.method).toBe('GET');
    request.flush({
      success: true,
      data: [{
        id: 5,
        signalId: 10,
        signalDirection: 'Bullish',
        entryPrice: 2456.3,
        exitPrice: 0,
        quantity: 10,
        profitLoss: 0,
        status: 'Open',
        createdAtUtc: '2026-10-12T17:52:15Z',
        closedAtUtc: null
      }],
      message: null,
      errors: null
    });
  });

  it('sends the documented exit price and exit reason when closing a trade', () => {
    environment.useMockData = false;
    service.closePaperTrade(5, { exitPrice: 2500, exitReason: 'Manually closed' }).subscribe();

    const request = http.expectOne(`${environment.apiBaseUrl}/paperTrades/5/close`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ exitPrice: 2500, exitReason: 'Manually closed' });
    request.flush({
      success: true,
      data: {
        id: 5,
        signalId: 10,
        signalDirection: 'Bullish',
        entryPrice: 2456.3,
        exitPrice: 2500,
        quantity: 10,
        profitLoss: 437,
        status: 'ManuallyClosed',
        createdAtUtc: '2026-10-12T17:52:15Z',
        closedAtUtc: '2026-10-12T18:00:00Z'
      },
      message: null,
      errors: null
    });
  });
});
