import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RiskSettingsComponent } from './risk-settings.component';
import { RiskSettingsService } from '../../core/services/risk-settings.service';

describe('RiskSettingsComponent', () => {
  let component: RiskSettingsComponent;
  let fixture: ComponentFixture<RiskSettingsComponent>;

  const getRiskSettingsSpy = jasmine.createSpy('getRiskSettings')
    .and.returnValue(of({ success: true, data: { id: 1, tradingCapital: 20000, riskPerTradePercent: 1, maximumDailyLossPercent: 2, minimumSignalScore: 75, paperTradingEnabled: true, createdAtUtc: '2025-01-01T00:00:00Z', updatedAtUtc: '2025-01-01T00:00:00Z' } }));
  const riskSettingsServiceMock = {
    getRiskSettings: getRiskSettingsSpy,
    updateRiskSettings: () => of({ success: true, data: { id: 1, tradingCapital: 20000, riskPerTradePercent: 1, maximumDailyLossPercent: 2, minimumSignalScore: 75, paperTradingEnabled: true, createdAtUtc: '2025-01-01T00:00:00Z', updatedAtUtc: '2025-01-01T00:00:00Z' } })
  };

  beforeEach(async () => {
    getRiskSettingsSpy.and.returnValue(of({ success: true, data: { id: 1, tradingCapital: 20000, riskPerTradePercent: 1, maximumDailyLossPercent: 2, minimumSignalScore: 75, paperTradingEnabled: true, createdAtUtc: '2025-01-01T00:00:00Z', updatedAtUtc: '2025-01-01T00:00:00Z' } }));
    getRiskSettingsSpy.calls.reset();
    await TestBed.configureTestingModule({
      imports: [RiskSettingsComponent],
      providers: [{ provide: RiskSettingsService, useValue: riskSettingsServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(RiskSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('binds returned settings into the visible form controls', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect(inputs[0].value).toBe('20000');
    expect(inputs[1].value).toBe('1');
    expect(inputs[2].value).toBe('2');
    expect(inputs[3].value).toBe('75');
    expect(inputs[4].checked).toBeTrue();
  });

  it('stops loading and displays a retryable error when the request fails', () => {
    getRiskSettingsSpy.and.returnValue(throwError(() => new Error('API unavailable')));

    fixture.ngZone?.run(() => component.loadSettings());
    fixture.detectChanges();

    expect(getRiskSettingsSpy).toHaveBeenCalledTimes(2);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('API unavailable');
    expect(fixture.nativeElement.textContent).toContain('API unavailable');
    expect(fixture.nativeElement.textContent).toContain('Retry');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('should be invalid with non-positive trading capital', () => {
    component.form.patchValue({ tradingCapital: 0, riskPerTradePercent: 1, maximumDailyLossPercent: 2, minimumSignalScore: 75 });
    expect(component.form.valid).toBeFalse();
  });

  it('should allow a valid settings form', () => {
    component.form.patchValue({ tradingCapital: 25000, riskPerTradePercent: 1.5, maximumDailyLossPercent: 3, minimumSignalScore: 80, paperTradingEnabled: true });
    expect(component.form.valid).toBeTrue();
  });
});
