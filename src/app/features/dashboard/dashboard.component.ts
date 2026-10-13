import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { SignalScoreComponent } from '../../shared/components/signal-score/signal-score.component';
import { RiskSettings } from '../../core/models/risk-settings.model';
import { RiskSettingsService } from '../../core/services/risk-settings.service';
import { Signal } from '../../core/models/signal.model';
import { SignalService } from '../../core/services/signal.service';
import { PaperTrade } from '../../core/models/paper-trade.model';
import { PaperTradeService } from '../../core/services/paper-trade.service';
import { TradeStatus } from '../../core/models/paper-trade.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingStateComponent, SignalScoreComponent, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <section class="dashboard-page">
      <div *ngIf="isLoading" class="full-width"><app-loading-state /></div>

      <ng-container *ngIf="!isLoading">
        <div class="hero-grid">
          <article class="stat-card">
            <span class="label">Trading Capital</span>
            <strong>{{ riskSettings?.tradingCapital | currency:'INR':'symbol-narrow':'1.0-0' }}</strong>
          </article>
          <article class="stat-card">
            <span class="label">Risk / Trade</span>
            <strong>{{ riskSettings?.riskPerTradePercent || 0 }}%</strong>
            <small>{{ maxRisk | currency:'INR':'symbol-narrow':'1.0-0' }} max risk</small>
          </article>
          <article class="stat-card">
            <span class="label">Daily Loss Limit</span>
            <strong>{{ maxDailyLoss | currency:'INR':'symbol-narrow':'1.0-0' }}</strong>
          </article>
          <article class="stat-card">
            <span class="label">Active Signals</span>
            <strong>{{ signals.length }}</strong>
          </article>
          <article class="stat-card">
            <span class="label">Open Trades</span>
            <strong>{{ openTradeCount }}</strong>
          </article>
          <article class="stat-card performance-card">
            <span class="label">Win Rate</span>
            <strong *ngIf="performanceValue !== null; else noHistory">{{ performanceValue }}%</strong>
            <ng-template #noHistory>
              <small>No trading history yet</small>
            </ng-template>
          </article>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2>Latest Signals</h2>
            <a routerLink="/signals">View all</a>
          </div>

          <div class="table-wrap" *ngIf="signals.length; else noSignals">
            <table>
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Direction</th>
                  <th>Strategy</th>
                  <th>Score</th>
                  <th>Entry</th>
                  <th>Stop Loss</th>
                  <th>Target</th>
                  <th>R:R</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let signal of signals">
                  <td><a [routerLink]="['/signals', signal.id]">{{ signal.instrument?.symbol || 'NIFTY' }}</a></td>
                  <td>{{ getDirectionText(signal.direction) }}</td>
                  <td>{{ signal.strategy?.name || 'Breakout' }}</td>
                  <td><app-signal-score [score]="signal.signalScore" /></td>
                  <td>{{ signal.entryPrice | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                  <td>{{ signal.stopLoss | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                  <td>{{ signal.target | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                  <td>1:{{ signal.riskRewardRatio }}</td>
                  <td>{{ getStatusText(signal.status) }}</td>
                  <td>{{ signal.createdAtUtc | date:'shortTime' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ng-template #noSignals>
            <div class="empty-block">No signals available.</div>
          </ng-template>
        </div>
      </ng-container>
    </section>
  `,
  styles: [
    '.dashboard-page { display:grid; gap:1.5rem; }',
    '.full-width { width:100%; }',
    '.hero-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; }',
    '.stat-card { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:18px; padding:1rem; display:flex; flex-direction:column; gap:0.45rem; min-height:120px; box-shadow:var(--card-shadow); }',
    '.label { color:#a7b5c9; font-size:0.78rem; letter-spacing:0.04em; text-transform:uppercase; }',
    '.stat-card strong { font-size:1.7rem; color:#f8fafc; }',
    '.stat-card small { color:#9ed6ff; }',
    '.panel { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:20px; padding:1rem; }',
    '.panel-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }',
    '.panel-header h2 { margin:0; }',
    '.panel-header a { color:#5eead4; }',
    '.table-wrap { overflow-x:auto; }',
    'table { width:100%; border-collapse:collapse; min-width:760px; }',
    'th, td { padding:0.8rem 0.75rem; border-bottom:1px solid rgba(148,163,184,.15); text-align:left; color:#dfeafc; }',
    'th { color:#a7b5c9; font-size:0.72rem; text-transform:uppercase; letter-spacing:0.06em; }',
    'tbody tr:hover { background:rgba(94,234,212,.04); }',
    'a { color:#5eead4; }',
    '.empty-block { padding:2rem; text-align:center; color:#a7b5c9; }',
    '@media (max-width: 768px) { .hero-grid { grid-template-columns:1fr; } }'
  ]
})
export class DashboardComponent implements OnInit {
  riskSettings?: RiskSettings;
  signals: Signal[] = [];
  paperTrades: PaperTrade[] = [];
  isLoading = true;
  performanceValue: number | null = null;

  constructor(
    private readonly riskSettingsService: RiskSettingsService,
    private readonly signalService: SignalService,
    private readonly paperTradeService: PaperTradeService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  get maxRisk(): number {
    if (!this.riskSettings) return 0;
    return (this.riskSettings.tradingCapital * this.riskSettings.riskPerTradePercent) / 100;
  }

  get maxDailyLoss(): number {
    if (!this.riskSettings) return 0;
    return (this.riskSettings.tradingCapital * this.riskSettings.maximumDailyLossPercent) / 100;
  }

  get openTradeCount(): number {
    return this.paperTrades.filter((trade) => trade.status === TradeStatus.Open).length;
  }

  loadDashboard(): void {
    this.isLoading = true;
    forkJoin({
      risk: this.riskSettingsService.getRiskSettings(),
      signals: this.signalService.getSignals(),
      trades: this.paperTradeService.getPaperTrades()
    }).subscribe({
      next: ({ risk, signals, trades }) => {
        this.riskSettings = risk.data;
        this.signals = signals.data.slice(0, 5);
        this.paperTrades = trades.data;
        this.performanceValue = null;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getDirectionText(direction: number): string {
    return direction === 1 ? 'BULLISH' : direction === 2 ? 'BEARISH' : 'NEUTRAL';
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Detected';
      case 2: return 'Alerted';
      case 3: return 'Confirmed';
      case 4: return 'Expired';
      default: return 'Invalidated';
    }
  }
}
