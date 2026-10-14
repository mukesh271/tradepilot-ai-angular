import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndicatorCardsComponent } from './indicator-cards.component';

describe('IndicatorCardsComponent', () => {
  let fixture: ComponentFixture<IndicatorCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IndicatorCardsComponent] }).compileComponents();
    fixture = TestBed.createComponent(IndicatorCardsComponent);
  });

  it('marks unavailable indicator values as N/A instead of zero', () => {
    fixture.componentInstance.indicators = [
      { key: 'vwap', label: 'VWAP', value: null, description: 'Volume weighted price.' },
      { key: 'rsi', label: 'RSI14', value: 0, description: 'Momentum measure.' }
    ];
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('N/A');
    expect(text).toContain('0');
  });

  it('explains indicator measurements and renders the no-history state', () => {
    fixture.componentInstance.indicators = [];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Indicator values are unavailable');
  });
});
