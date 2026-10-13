import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PaperTradeService } from './paper-trade.service';

describe('PaperTradeService', () => {
  let service: PaperTradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaperTradeService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PaperTradeService);
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
});
