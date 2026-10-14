import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Instrument } from '../../core/models/instrument.model';
import { RiskSettingsService } from '../../core/services/risk-settings.service';
import { environment } from '../../../environments/environment';
import {
  Candle,
  StrategyCondition,
  StrategySetup,
  TechnicalAnalysis,
  TECHNICAL_ANALYSIS_TIMEFRAMES,
  TechnicalAnalysisTimeframe
} from '../../core/models/technical-analysis.model';
import { InstrumentService } from '../../core/services/instrument.service';
import { NotificationService } from '../../core/services/notification.service';
import { TechnicalAnalysisService } from '../../core/services/technical-analysis.service';
import { CandlestickChartComponent } from './candlestick-chart.component';
import { IndicatorCardsComponent } from './indicator-cards.component';

@Component({
  selector: 'app-technical-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CandlestickChartComponent, IndicatorCardsComponent],
  template: `
    <section class="analysis-page">
      <header class="page-header">
        <div>
          <span class="eyebrow">Research workspace</span>
          <h1>Technical Analysis</h1>
          <p>Review historical candle data and backend-reported indicator and strategy results.</p>
        </div>
        <span class="paper-mode" role="status">
          {{ paperTradingEnabled === null
            ? 'PAPER TRADING STATUS UNAVAILABLE'
            : paperTradingEnabled ? 'PAPER TRADING ENABLED' : 'PAPER TRADING DISABLED' }}
        </span>
      </header>

      <div class="mode-banner" [class.mode-banner--mock]="isMockMode">
        <strong>{{ isMockMode ? 'MOCK DATA' : 'BACKEND STORED HISTORY' }}</strong>
        <span>{{ isMockMode
          ? 'Deterministic sample history and illustrative analysis; not live market data or predictions.'
          : 'Historical candles and on-demand analysis from the backend; no live market data feed.' }}</span>
      </div>

      <section class="controls" aria-label="Analysis controls">
        <label>
          <span>Instrument</span>
          <select aria-label="Instrument" [(ngModel)]="selectedInstrumentId" (ngModelChange)="onInstrumentChange($event)" [disabled]="!instruments.length || isLoading || isCalculating">
            <option [ngValue]="null">Select instrument</option>
            <option *ngFor="let instrument of instruments" [ngValue]="instrument.id">{{ instrument.symbol }} · {{ instrument.exchange }}</option>
          </select>
        </label>
        <label>
          <span>Timeframe</span>
          <select aria-label="Timeframe" [(ngModel)]="selectedTimeframe" (ngModelChange)="onTimeframeChange()" [disabled]="isLoading || isCalculating">
            <option *ngFor="let timeframe of timeframes" [ngValue]="timeframe">{{ timeframe }}</option>
          </select>
        </label>
        <button type="button" (click)="runAnalysis()" [disabled]="isLoading || isCalculating || !candles.length || !selectedInstrument">
          {{ isCalculating ? 'Running…' : 'Run Analysis' }}
        </button>
      </section>

      <div *ngIf="isLoadingInstruments" class="state-message" role="status">Loading instruments…</div>
      <div *ngIf="errorMessage" class="error-state" role="alert">
        <span>{{ errorMessage }}</span>
        <button type="button" (click)="retry()">Retry</button>
      </div>
      <div *ngIf="!isLoadingInstruments && !instruments.length && !errorMessage" class="state-message" role="status">
        No active instruments are available.
      </div>
      <div *ngIf="isLoading" class="state-message" role="status"><span class="spinner"></span> Loading candles and analysis…</div>

      <ng-container *ngIf="!isLoading && selectedInstrument && !errorMessage">
        <section class="summary-grid" aria-label="Analysis summary">
          <article><span>Instrument</span><strong>{{ selectedInstrument.symbol }}</strong></article>
          <article><span>Timeframe</span><strong>{{ selectedTimeframe }}</strong></article>
          <article><span>Latest analyzed close</span><strong>{{ latestClose === null ? 'N/A' : (latestClose | number:'1.2-2') }}</strong></article>
          <article><span>Latest candle</span><strong>{{ latestCandleAt ? (latestCandleAt | date:'medium') : 'N/A' }}</strong></article>
          <article><span>Available indicators</span><strong>{{ availableIndicatorCount }} / {{ analysis?.indicators?.length ?? 0 }}</strong></article>
          <article><span>Strategy results</span><strong>{{ strategies.length }}</strong></article>
        </section>

        <p *ngIf="analysis?.insufficientData" class="warning" role="status">
          {{ analysis.message || 'Insufficient history for this analysis.' }}
        </p>
        <ul *ngIf="analysis && analysis.warnings.length" class="warnings">
          <li *ngFor="let warning of analysis.warnings">{{ warning }}</li>
        </ul>

        <app-candlestick-chart [candles]="candles" [timeframe]="selectedTimeframe" />

        <section class="section">
          <div class="section-heading">
            <div><h2>Indicator values</h2><p>Descriptive measurements only; indicators are not predictions.</p></div>
            <span *ngIf="analysis?.latestCandleAt">As of {{ analysis.latestCandleAt | date:'medium' }}</span>
          </div>
          <app-indicator-cards [indicators]="analysis?.indicators ?? []" />
        </section>

        <section class="section">
          <div class="section-heading">
            <div><h2>Strategy analysis</h2><p>Statuses and condition results come from the analysis response.</p></div>
          </div>
          <div *ngIf="!analysis; else strategyList" class="state-message">No analysis available for this selection.</div>
          <ng-template #strategyList>
            <div *ngIf="!strategies.length" class="state-message">No strategy results were returned. An empty result is not a setup.</div>
            <div class="strategy-grid">
              <details *ngFor="let strategy of strategies" class="strategy-card">
                <summary>
                  <span class="strategy-title">{{ strategy.name }}</span>
                  <span class="status" [ngClass]="statusClass(strategy.status)">{{ strategy.status }}</span>
                  <span class="strategy-count">{{ countText(strategy) }}</span>
                  <span *ngIf="strategy.direction" class="direction">{{ strategy.direction }}</span>
                </summary>
                <p *ngIf="strategy.explanation" class="strategy-explanation">{{ strategy.explanation }}</p>
                <p *ngIf="!strategy.conditions.length" class="state-message">No conditions were provided by the analysis.</p>
                <ul *ngIf="strategy.conditions.length" class="condition-list">
                  <li *ngFor="let condition of strategy.conditions">
                    <span class="condition-result" [ngClass]="conditionClass(condition.passed)">{{ conditionText(condition.passed) }}</span>
                    <span class="condition-name">{{ condition.name }}</span>
                    <span *ngIf="hasValue(condition.actualValue)" class="condition-value">Actual: {{ condition.actualValue }}</span>
                    <span *ngIf="hasValue(condition.threshold)" class="condition-value">Threshold: {{ condition.threshold }}</span>
                    <span *ngIf="condition.explanation" class="condition-explanation">{{ condition.explanation }}</span>
                  </li>
                </ul>
              </details>
            </div>
          </ng-template>
        </section>
      </ng-container>
      <div *ngIf="isCalculating" class="calculating" role="status"><span class="spinner"></span> Running analysis against stored candles…</div>
    </section>
  `,
  styles: [
    '.analysis-page { display:grid; gap:1rem; min-width:0; max-width:100%; }',
    '.page-header { display:flex; justify-content:space-between; align-items:center; gap:1rem; }',
    '.eyebrow { color:var(--primary); font-size:.72rem; text-transform:uppercase; letter-spacing:.1em; }',
    'h1 { margin:.25rem 0; font-size:clamp(1.5rem,3vw,2rem); }',
    '.page-header p, .section-heading p { color:var(--muted); margin:.25rem 0 0; font-size:.85rem; }',
    '.paper-mode { color:#fde68a; border:1px solid rgba(251,191,36,.35); background:rgba(251,191,36,.08); padding:.55rem .7rem; border-radius:999px; font-size:.68rem; font-weight:700; white-space:nowrap; }',
    '.mode-banner { display:flex; flex-wrap:wrap; gap:.4rem .75rem; border:1px solid rgba(251,191,36,.35); border-radius:12px; background:rgba(120,53,15,.18); color:#fde68a; padding:.7rem .9rem; font-size:.8rem; }',
    '.mode-banner--mock { border-color:rgba(94,234,212,.28); background:rgba(15,118,110,.1); color:#99f6e4; }',
    '.controls { display:flex; flex-wrap:wrap; align-items:end; gap:.8rem; border:1px solid var(--border); border-radius:16px; background:rgba(17,28,46,.75); padding:1rem; }',
    'label { display:grid; gap:.4rem; min-width:180px; color:var(--muted); font-size:.78rem; }',
    'select { width:100%; background:#0b1220; color:#e5eefc; border:1px solid var(--border); border-radius:9px; padding:.65rem .75rem; }',
    'button { border:0; border-radius:9px; padding:.7rem 1rem; font-weight:700; background:var(--primary); color:#0b1220; cursor:pointer; }',
    'button:disabled { opacity:.5; cursor:not-allowed; }',
    '.summary-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:.7rem; }',
    '.summary-grid article { min-width:0; display:grid; gap:.45rem; border:1px solid var(--border); background:rgba(17,28,46,.72); border-radius:13px; padding:.85rem; }',
    '.summary-grid span { color:var(--muted); font-size:.72rem; }',
    '.summary-grid strong { overflow-wrap:anywhere; font-size:.95rem; }',
    '.section { display:grid; gap:.75rem; min-width:0; }',
    '.section-heading { display:flex; align-items:center; justify-content:space-between; gap:.8rem; }',
    'h2 { margin:0; font-size:1.15rem; }',
    '.section-heading > span { color:var(--muted); font-size:.78rem; }',
    '.strategy-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr)); gap:.75rem; }',
    '.strategy-card { min-width:0; border:1px solid var(--border); border-radius:14px; background:rgba(17,28,46,.75); padding:.9rem; }',
    'summary { cursor:pointer; display:flex; align-items:center; flex-wrap:wrap; gap:.5rem; list-style:none; }',
    'summary::-webkit-details-marker { display:none; }',
    '.strategy-title { font-weight:700; flex:1 1 140px; }',
    '.status, .direction { font-size:.72rem; border-radius:999px; padding:.25rem .5rem; color:#dbeafe; background:rgba(148,163,184,.15); }',
    '.status--confirmed { color:#bbf7d0; background:rgba(34,197,94,.15); }',
    '.status--incomplete, .status--unavailable, .status--insufficient { color:#fde68a; background:rgba(251,191,36,.12); }',
    '.strategy-count, .strategy-explanation, .condition-value, .condition-explanation { color:var(--muted); font-size:.78rem; }',
    '.strategy-explanation { line-height:1.5; }',
    '.condition-list { display:grid; gap:.6rem; list-style:none; padding:0; }',
    '.condition-list li { display:grid; grid-template-columns:auto 1fr; gap:.25rem .6rem; border-top:1px solid rgba(148,163,184,.12); padding-top:.55rem; }',
    '.condition-result { font-size:.7rem; text-transform:uppercase; font-weight:700; }',
    '.condition-result--pass { color:#86efac; } .condition-result--fail { color:#fca5a5; } .condition-result--na { color:#fde68a; }',
    '.condition-name { font-size:.85rem; }',
    '.condition-value, .condition-explanation { grid-column:2; }',
    '.state-message, .calculating { display:flex; align-items:center; gap:.6rem; color:var(--muted); border:1px solid var(--border); border-radius:12px; padding:.85rem; }',
    '.error-state { display:flex; align-items:center; justify-content:space-between; gap:1rem; color:#fecaca; border:1px solid rgba(248,113,113,.4); background:rgba(127,29,29,.12); border-radius:12px; padding:.85rem; }',
    '.warning, .warnings { color:#fde68a; border-radius:10px; background:rgba(120,53,15,.18); padding:.75rem 1rem; margin:0; }',
    '.warnings { padding-left:2rem; }',
    '.spinner { width:15px; height:15px; flex:none; border:2px solid rgba(148,163,184,.3); border-top-color:var(--primary); border-radius:50%; animation:spin .8s linear infinite; }',
    '@keyframes spin { to { transform:rotate(360deg); } }',
    '@media(max-width:700px) { .page-header { align-items:flex-start; flex-direction:column; } .controls { align-items:stretch; } label { flex:1 1 100%; min-width:0; } .controls button { width:100%; } .section-heading { align-items:flex-start; flex-direction:column; } }'
  ]
})
export class TechnicalAnalysisComponent implements OnInit {
  readonly timeframes = TECHNICAL_ANALYSIS_TIMEFRAMES;
  readonly isMockMode = environment.useMockData;
  instruments: Instrument[] = [];
  selectedInstrumentId: number | null = null;
  selectedTimeframe: TechnicalAnalysisTimeframe = '15m';
  candles: Candle[] = [];
  analysis: TechnicalAnalysis | null = null;
  isLoadingInstruments = true;
  paperTradingEnabled: boolean | null = null;
  isLoading = false;
  isCalculating = false;
  errorMessage: string | null = null;

  constructor(
    private readonly instrumentService: InstrumentService,
    private readonly analysisService: TechnicalAnalysisService,
    private readonly riskSettingsService: RiskSettingsService,
    private readonly notifications: NotificationService
  ) {}

  get selectedInstrument(): Instrument | undefined {
    return this.instruments.find((instrument) => instrument.id === this.selectedInstrumentId);
  }

  get strategies(): StrategySetup[] {
    return this.analysis?.strategies ?? [];
  }

  get latestCandleAt(): string | null {
    return this.candles[this.candles.length - 1]?.timestamp ?? this.analysis?.latestCandleAt ?? null;
  }

  get latestClose(): number | null {
    return this.analysis?.lastClose ?? null;
  }

  get availableIndicatorCount(): number {
    return this.analysis?.indicators.filter((indicator) => indicator.value !== null && Number.isFinite(indicator.value)).length ?? 0;
  }

  ngOnInit(): void {
    this.loadInstruments();
    this.loadPaperTradingStatus();
  }

  private loadPaperTradingStatus(): void {
    this.riskSettingsService.getRiskSettings().subscribe({
      next: (response) => {
        this.paperTradingEnabled = response.success && response.data
          ? response.data.paperTradingEnabled
          : null;
      },
      error: () => {
        this.paperTradingEnabled = null;
      }
    });
  }

  loadInstruments(): void {
    this.isLoadingInstruments = true;
    this.errorMessage = null;
    this.instrumentService.getInstruments().subscribe({
      next: (response) => {
        this.instruments = response.success && Array.isArray(response.data)
          ? response.data.filter((instrument) => instrument.isActive)
          : [];
        this.isLoadingInstruments = false;
        if (!response.success) {
          this.errorMessage = response.message || 'Unable to load instruments.';
          return;
        }
        this.selectedInstrumentId = this.instruments[0]?.id ?? null;
        if (this.selectedInstrumentId !== null) this.loadWorkspace();
      },
      error: (error: Error) => {
        this.isLoadingInstruments = false;
        this.errorMessage = error.message || 'Unable to load instruments.';
      }
    });
  }

  onInstrumentChange(value: number | null): void {
    this.selectedInstrumentId = value === null ? null : Number(value);
    this.candles = [];
    this.analysis = null;
    if (this.selectedInstrument) this.loadWorkspace();
    else this.errorMessage = 'Select a valid instrument to load analysis.';
  }

  onTimeframeChange(): void {
    if (this.selectedInstrument) this.loadWorkspace();
  }

  retry(): void {
    if (this.instruments.length) this.loadWorkspace();
    else this.loadInstruments();
  }

  runAnalysis(): void {
    const instrument = this.selectedInstrument;
    if (!instrument || !this.candles.length || this.isCalculating) return;

    this.isCalculating = true;
    this.errorMessage = null;
    this.analysisService.calculateAnalysis(instrument.id, this.selectedTimeframe).subscribe({
      next: (response) => {
        this.isCalculating = false;
        if (!response.success || !response.data) {
          this.errorMessage = response.message || 'No analysis is available for this selection.';
          return;
        }
        this.analysis = response.data;
        this.notifications.success('Technical analysis completed successfully.');
      },
      error: (error: Error) => {
        this.isCalculating = false;
        this.errorMessage = error.message || 'Analysis could not be completed.';
      }
    });
  }

  countText(strategy: StrategySetup): string {
    if (strategy.conditionsPassed === null || strategy.conditionsPassed === undefined
      || strategy.conditionsTotal === null || strategy.conditionsTotal === undefined) {
      return 'Conditions N/A';
    }
    return `${strategy.conditionsPassed} / ${strategy.conditionsTotal} conditions`;
  }

  conditionText(passed: boolean | null): string {
    return passed === true ? 'Pass' : passed === false ? 'Fail' : 'N/A';
  }

  conditionClass(passed: boolean | null): string {
    return passed === true ? 'condition-result--pass' : passed === false ? 'condition-result--fail' : 'condition-result--na';
  }

  statusClass(status: string): string {
    const normalized = status.toLowerCase();
    if (normalized === 'confirmed' || normalized === 'complete') return 'status--confirmed';
    if (normalized === 'incomplete' || normalized === 'unavailable') return 'status--incomplete';
    if (normalized === 'insufficientdata') return 'status--insufficient';
    return '';
  }

  hasValue(value: StrategyCondition['actualValue']): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  private loadWorkspace(): void {
    const instrument = this.selectedInstrument;
    if (!instrument) {
      this.errorMessage = 'The selected instrument is invalid.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    this.candles = [];
    this.analysis = null;
    this.analysisService.getCandles(instrument.id, this.selectedTimeframe).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (!response.success || !Array.isArray(response.data)) {
          this.errorMessage = response.message || 'Candle history could not be loaded.';
          return;
        }
        this.candles = response.data;
        if (!this.candles.length) {
          this.analysis = null;
          return;
        }
        this.isLoading = true;
        this.analysisService.getAnalysis(instrument.id, this.selectedTimeframe).subscribe({
          next: (analysis) => {
            this.isLoading = false;
            if (!analysis.success || !analysis.data) {
              this.errorMessage = analysis.message || 'No analysis is available for this selection.';
              return;
            }
            this.analysis = analysis.data;
          },
          error: (error: Error) => {
            this.isLoading = false;
            this.errorMessage = error.message || 'The analysis service is unavailable.';
          }
        });
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Candle history could not be loaded.';
      }
    });
  }
}
