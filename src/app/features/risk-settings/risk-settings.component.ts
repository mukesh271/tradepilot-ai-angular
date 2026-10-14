import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TimeoutError, finalize, timeout } from 'rxjs';
import { UpdateRiskSettingsRequest } from '../../core/models/risk-settings.model';
import { NotificationService } from '../../core/services/notification.service';
import { RiskSettingsService } from '../../core/services/risk-settings.service';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-risk-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingStateComponent],
  template: `
    <section class="risk-page">
      <div class="panel">
        <h2>Risk Settings</h2>

        <div *ngIf="isLoading"><app-loading-state /></div>
        <div *ngIf="errorMessage" class="error-state" role="alert">
          <span>{{ errorMessage }}</span>
          <button type="button" (click)="loadSettings()">Retry</button>
        </div>

        <form *ngIf="!isLoading && !errorMessage" [formGroup]="form" (ngSubmit)="save()">
          <div class="grid">
            <label>
              Trading Capital
              <input type="number" formControlName="tradingCapital" min="1">
            </label>
            <label>
              Risk Per Trade %
              <input type="number" formControlName="riskPerTradePercent" min="0.01" max="100" step="0.01">
            </label>
            <label>
              Maximum Daily Loss %
              <input type="number" formControlName="maximumDailyLossPercent" min="0.01" max="100" step="0.01">
            </label>
            <label>
              Minimum Signal Score
              <input type="number" formControlName="minimumSignalScore" min="0" max="100" step="1">
            </label>
            <label class="toggle-row">
              <span>Paper Trading Enabled</span>
              <input type="checkbox" formControlName="paperTradingEnabled">
            </label>
          </div>

          <div class="validation" *ngIf="form.invalid && form.touched">
            <p *ngIf="form.controls.tradingCapital.hasError('min') || form.controls.tradingCapital.hasError('required')">Trading Capital must be greater than 0.</p>
            <p *ngIf="form.controls.riskPerTradePercent.invalid">Risk Per Trade must be greater than 0 and at most 100.</p>
            <p *ngIf="form.controls.maximumDailyLossPercent.invalid">Maximum Daily Loss must be greater than 0 and at most 100.</p>
            <p *ngIf="form.controls.minimumSignalScore.hasError('min') || form.controls.minimumSignalScore.hasError('max')">Minimum Signal Score must be between 0 and 100.</p>
          </div>

          <div class="actions">
            <button type="submit" [disabled]="form.invalid">Save Settings</button>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [
    '.risk-page { display:grid; gap:1rem; }',
    '.panel { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:20px; padding:1rem; }',
    'h2 { margin-top:0; }',
    '.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; }',
    'label { display:grid; gap:0.5rem; color:#dfeafc; }',
    'input { background:rgba(15,23,42,.9); color:#f8fafc; border:1px solid rgba(148,163,184,.2); border-radius:10px; padding:0.75rem; }',
    '.toggle-row { align-items:center; display:flex; justify-content:space-between; padding:0.4rem 0; }',
    '.toggle-row input { width:22px; height:22px; }',
    '.validation { margin-top:1rem; color:#fecaca; }',
    '.error-state { display:flex; justify-content:space-between; align-items:center; gap:1rem; color:#fecaca; padding:.8rem; border:1px solid rgba(248,113,113,.4); border-radius:12px; }',
    '.actions { display:flex; justify-content:flex-end; margin-top:1rem; }',
    'button { background:#5eead4; color:#04111a; border:none; border-radius:12px; padding:0.8rem 1.2rem; font-weight:700; cursor:pointer; }',
    'button:disabled { opacity:0.5; cursor:not-allowed; }'
  ]
})
export class RiskSettingsComponent implements OnInit {
  isLoading = true;
  errorMessage: string | null = null;
  form = this.fb.group({
    tradingCapital: [0, [Validators.required, Validators.min(1)]],
    riskPerTradePercent: [0, [Validators.required, Validators.min(Number.EPSILON), Validators.max(100)]],
    maximumDailyLossPercent: [0, [Validators.required, Validators.min(Number.EPSILON), Validators.max(100)]],
    minimumSignalScore: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    paperTradingEnabled: [true]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly riskSettingsService: RiskSettingsService,
    private readonly notificationService: NotificationService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.riskSettingsService.getRiskSettings().pipe(
      timeout({ first: 15000 }),
      finalize(() => {
        this.isLoading = false;
        this.changeDetector.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.errorMessage = response.message || response.errors?.join(' ') || 'The server did not return risk settings.';
          this.changeDetector.markForCheck();
          return;
        }
        this.form.patchValue({
          tradingCapital: response.data.tradingCapital,
          riskPerTradePercent: response.data.riskPerTradePercent,
          maximumDailyLossPercent: response.data.maximumDailyLossPercent,
          minimumSignalScore: response.data.minimumSignalScore,
          paperTradingEnabled: response.data.paperTradingEnabled
        });
        this.changeDetector.markForCheck();
      },
      error: (error: Error) => {
        this.errorMessage = error instanceof TimeoutError
          ? 'Loading risk settings timed out. Check the backend URL and that CORS allows this frontend origin.'
          : error.message || 'Unable to load risk settings.';
        this.changeDetector.markForCheck();
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.error('Please fix the form validation errors before saving.');
      return;
    }

    const values = this.form.getRawValue();
    const payload: UpdateRiskSettingsRequest = {
      tradingCapital: Number(values.tradingCapital),
      riskPerTradePercent: Number(values.riskPerTradePercent),
      maximumDailyLossPercent: Number(values.maximumDailyLossPercent),
      minimumSignalScore: Number(values.minimumSignalScore),
      paperTradingEnabled: values.paperTradingEnabled ?? false
    };
    this.riskSettingsService.updateRiskSettings(payload).subscribe({
      next: () => {
        this.notificationService.success('Risk settings updated successfully.');
      },
      error: () => {
        this.notificationService.error('Unable to update risk settings.');
      }
    });
  }
}
