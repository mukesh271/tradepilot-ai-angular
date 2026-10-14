import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandlestickChartComponent } from './candlestick-chart.component';
import { createMockCandles } from '../../core/services/technical-analysis-mock-data';

describe('CandlestickChartComponent', () => {
  let fixture: ComponentFixture<CandlestickChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CandlestickChartComponent] }).compileComponents();
    fixture = TestBed.createComponent(CandlestickChartComponent);
    fixture.componentRef.setInput('candles', createMockCandles('15m', 3));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.chart-host').style.width = '640px';
  });

  it('renders a chart for valid candle data and labels timeframe and latest timestamp', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('15m');
    expect(fixture.componentInstance.latestCandleAt).toBe(fixture.componentInstance.candles[2].timestamp);
    expect(fixture.nativeElement.querySelector('.chart-host').children.length).toBeGreaterThan(0);
  });

  it('shows an empty state for an empty candle array', () => {
    fixture.componentRef.setInput('candles', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No candles available');
    expect(fixture.nativeElement.querySelector('.chart-host').children.length).toBe(0);
  });
});
