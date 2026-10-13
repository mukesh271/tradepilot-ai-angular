import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { StrategyPerformance } from '../../core/models/performance.model';
import { PerformanceService } from '../../core/services/performance.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, LoadingStateComponent, EmptyStateComponent, CurrencyPipe],
  template: `
    <section class="performance-page">
      <div *ngIf="isLoading"><app-loading-state /></div>

      <div *ngIf="!isLoading && performance.length; else noData" class="content-wrap">
        <div class="stats-grid">
          <article class="stat-card"><span>Total Trades</span><strong>{{ totalTrades }}</strong></article>
          <article class="stat-card"><span>Winning Trades</span><strong>{{ winningTrades }}</strong></article>
          <article class="stat-card"><span>Losing Trades</span><strong>{{ losingTrades }}</strong></article>
          <article class="stat-card"><span>Win Rate</span><strong>{{ winRate }}%</strong></article>
          <article class="stat-card"><span>Profit Factor</span><strong>{{ profitFactor }}</strong></article>
          <article class="stat-card"><span>Total Net P/L</span><strong>{{ totalNetProfitLoss | currency:'INR':'symbol-narrow':'1.0-0' }}</strong></article>
          <article class="stat-card"><span>Average Winning Trade</span><strong>{{ averageWinningTrade | currency:'INR':'symbol-narrow':'1.0-0' }}</strong></article>
          <article class="stat-card"><span>Average Losing Trade</span><strong>{{ averageLosingTrade | currency:'INR':'symbol-narrow':'1.0-0' }}</strong></article>
          <article class="stat-card"><span>Maximum Drawdown</span><strong>{{ maximumDrawdown }}%</strong></article>
        </div>

        <div class="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Trades</th>
                <th>Win Rate</th>
                <th>Profit Factor</th>
                <th>Net P/L</th>
                <th>Drawdown</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of performance">
                <td>{{ item.strategyName || 'Strategy' }}</td>
                <td>{{ item.totalTrades }}</td>
                <td>{{ item.winRate }}%</td>
                <td>{{ item.profitFactor }}</td>
                <td>{{ item.totalNetProfitLoss | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                <td>{{ item.maximumDrawdown }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ng-template #noData>
        <app-empty-state title="No performance data available yet." message="Performance metrics will appear once trading results are available." />
      </ng-template>
    </section>
  `,
  styles: [
    '.performance-page { display:grid; gap:1rem; }',
    '.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; }',
    '.stat-card { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:18px; padding:1rem; display:flex; flex-direction:column; gap:0.5rem; min-height:120px; }',
    '.stat-card span { color:#a7b5c9; }',
    '.stat-card strong { font-size:1.5rem; color:#f8fafc; }',
    '.panel { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:18px; padding:1rem; }',
    '.table-wrap { overflow-x:auto; }',
    'table { width:100%; min-width:620px; border-collapse:collapse; }',
    'th, td { padding:0.75rem; border-bottom:1px solid rgba(148,163,184,.12); color:#dfeafc; }',
    'th { text-transform:uppercase; color:#9fb0c6; letter-spacing:0.08em; }'
  ]
})
export class PerformanceComponent implements OnInit {
  performance: StrategyPerformance[] = [];
  isLoading = true;

  constructor(private readonly performanceService: PerformanceService) {}

  ngOnInit(): void {
    this.performanceService.getPerformance().subscribe({
      next: (response) => {
        this.performance = Array.isArray(response.data) ? response.data : [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get totalTrades(): number { return this.performance.reduce((sum, item) => sum + item.totalTrades, 0); }
  get winningTrades(): number { return this.performance.reduce((sum, item) => sum + item.winningTrades, 0); }
  get losingTrades(): number { return this.performance.reduce((sum, item) => sum + item.losingTrades, 0); }
  get winRate(): number { return this.performance.length ? Number((this.performance.reduce((sum, item) => sum + item.winRate, 0) / this.performance.length).toFixed(2)) : 0; }
  get profitFactor(): number { return this.performance.length ? Number((this.performance.reduce((sum, item) => sum + item.profitFactor, 0) / this.performance.length).toFixed(2)) : 0; }
  get totalNetProfitLoss(): number { return this.performance.reduce((sum, item) => sum + item.totalNetProfitLoss, 0); }
  get averageWinningTrade(): number { return this.performance.reduce((sum, item) => sum + item.averageWinningTrade, 0); }
  get averageLosingTrade(): number { return this.performance.reduce((sum, item) => sum + item.averageLosingTrade, 0); }
  get maximumDrawdown(): number { return this.performance.length ? Number((this.performance.reduce((sum, item) => sum + item.maximumDrawdown, 0) / this.performance.length).toFixed(2)) : 0; }
}
