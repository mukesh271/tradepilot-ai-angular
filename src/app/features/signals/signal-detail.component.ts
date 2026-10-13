import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Signal, SignalCondition, SignalDirection } from '../../core/models/signal.model';
import { RiskSettingsService } from '../../core/services/risk-settings.service';
import { SignalService } from '../../core/services/signal.service';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { SignalScoreComponent } from '../../shared/components/signal-score/signal-score.component';

@Component({
  selector: 'app-signal-detail',
  standalone: true,
  imports: [CommonModule, LoadingStateComponent, SignalScoreComponent, CurrencyPipe, DatePipe],
  template: `
    <section class="signal-detail" *ngIf="signal; else loading">
      <div class="hero">
        <div>
          <p class="eyebrow">Signal</p>
          <h1>{{ signal.instrument?.symbol || 'Instrument' }} <span class="direction">{{ getDirection(signal.direction) }}</span></h1>
        </div>
        <div class="score-box">
          <span>Score</span>
          <app-signal-score [score]="signal.signalScore" />
        </div>
      </div>

      <div class="grid two-cols">
        <article class="panel">
          <h3>Trade Setup</h3>
          <dl>
            <div><dt>Entry</dt><dd>{{ signal.entryPrice | currency:'INR':'symbol-narrow':'1.0-0' }}</dd></div>
            <div><dt>Stop Loss</dt><dd>{{ signal.stopLoss | currency:'INR':'symbol-narrow':'1.0-0' }}</dd></div>
            <div><dt>Target</dt><dd>{{ signal.target | currency:'INR':'symbol-narrow':'1.0-0' }}</dd></div>
            <div><dt>Risk/Reward</dt><dd>1:{{ signal.riskRewardRatio }}</dd></div>
            <div><dt>Timeframe</dt><dd>{{ signal.timeFrame }}</dd></div>
          </dl>
        </article>

        <article class="panel">
          <h3>Why This Signal?</h3>
          <ul class="condition-list">
            <li *ngFor="let condition of signal.conditions || []">
              <span class="check">✓</span>
              <span>{{ condition.name }}</span>
            </li>
          </ul>
        </article>
      </div>

      <article class="panel explanation">
        <h3>Explanation</h3>
        <p>{{ signal.explanation }}</p>
      </article>

      <div class="actions">
        <button type="button" class="primary" (click)="openPaperTrade()" [disabled]="!paperTradingEnabled">
          {{ paperTradingEnabled ? 'Paper Trade' : 'Paper Trading Disabled' }}
        </button>
      </div>
    </section>

    <ng-template #loading><app-loading-state /></ng-template>
  `,
  styles: [
    '.signal-detail { display:grid; gap:1.25rem; }',
    '.hero { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:20px; padding:1.25rem; }',
    '.eyebrow { margin:0 0 0.5rem; color:#5eead4; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.08em; }',
    'h1 { margin:0; font-size:2rem; }',
    '.direction { color:#5eead4; text-transform:uppercase; font-size:1rem; }',
    '.score-box { min-width:180px; }',
    '.grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; }',
    '.panel { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:18px; padding:1rem; }',
    'h3 { margin-top:0; }',
    'dl { display:grid; gap:0.85rem; margin:0; }',
    'dl div { display:flex; justify-content:space-between; gap:1rem; border-bottom:1px solid rgba(148,163,184,.12); padding-bottom:0.4rem; }',
    'dt { color:#a7b5c9; }',
    'dd { margin:0; font-weight:600; }',
    '.condition-list { list-style:none; padding:0; display:grid; gap:0.8rem; margin:0; }',
    '.condition-list li { display:flex; align-items:center; gap:0.75rem; }',
    '.check { display:inline-flex; width:22px; height:22px; align-items:center; justify-content:center; border-radius:50%; background:rgba(34,197,94,.12); color:#4ade80; }',
    '.explanation p { margin:0; color:#dfeafc; line-height:1.6; }',
    '.actions { display:flex; justify-content:flex-end; }',
    '.primary { background:#5eead4; color:#04111a; border:none; border-radius:12px; padding:0.8rem 1.2rem; font-weight:700; cursor:pointer; }',
    '.primary:disabled { opacity:0.5; cursor:not-allowed; }',
    '@media (max-width: 768px) { .hero, .grid { grid-template-columns:1fr; display:grid; } }'
  ]
})
export class SignalDetailComponent implements OnInit {
  signal?: Signal;
  paperTradingEnabled = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly signalService: SignalService,
    private readonly riskSettingsService: RiskSettingsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.signalService.getSignal(id).subscribe((response) => {
      this.signal = response.data;
    });

    this.riskSettingsService.getRiskSettings().subscribe((response) => {
      this.paperTradingEnabled = response.data.paperTradingEnabled;
    });
  }

  getDirection(direction: number): string {
    return direction === SignalDirection.Bullish ? 'Bullish' : direction === SignalDirection.Bearish ? 'Bearish' : 'Neutral';
  }

  openPaperTrade(): void {
    if (!this.signal) return;
    this.router.navigate(['/paper-trades'], { queryParams: { signalId: this.signal.id } });
  }
}
