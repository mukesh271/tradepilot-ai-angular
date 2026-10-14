import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PerformanceMetrics } from '../../core/models/performance.model';
import { PerformanceService } from '../../core/services/performance.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, LoadingStateComponent, EmptyStateComponent, CurrencyPipe, DatePipe],
  template: `
    <section class="performance-page">
      <div *ngIf="isLoading"><app-loading-state /></div>

      <div *ngIf="!isLoading && performance; else noData" class="content-wrap">
        <div class="stats-grid">
          <article class="stat-card"><span>Total Trades</span><strong>{{ performance.totalTrades }}</strong></article>
          <article class="stat-card"><span>Winning Trades</span><strong>{{ performance.winningTrades }}</strong></article>
          <article class="stat-card"><span>Losing Trades</span><strong>{{ performance.losingTrades }}</strong></article>
          <article class="stat-card"><span>Win Rate</span><strong>{{ performance.winRate }}%</strong></article>
          <article class="stat-card"><span>Profit Factor</span><strong>{{ performance.profitFactor }}</strong></article>
          <article class="stat-card"><span>Total Net P/L</span><strong>{{ performance.totalNetProfitLoss | currency:'INR':'symbol-narrow':'1.0-0' }}</strong></article>
          <article class="stat-card"><span>Average Winning Trade</span><strong>{{ performance.averageWinningTrade | currency:'INR':'symbol-narrow':'1.0-0' }}</strong></article>
          <article class="stat-card"><span>Average Losing Trade</span><strong>{{ performance.averageLosingTrade | currency:'INR':'symbol-narrow':'1.0-0' }}</strong></article>
          <article class="stat-card"><span>Maximum Drawdown</span><strong>{{ performance.maximumDrawdown | currency:'INR':'symbol-narrow':'1.0-0' }}</strong></article>
        </div>

        <p class="calculated">Overall performance · calculated {{ performance.calculatedAtUtc | date:'medium' }}</p>
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
    '.calculated { color:var(--muted); font-size:.85rem; }',
    '.panel { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:18px; padding:1rem; }',
    '.table-wrap { overflow-x:auto; }',
    'table { width:100%; min-width:620px; border-collapse:collapse; }',
    'th, td { padding:0.75rem; border-bottom:1px solid rgba(148,163,184,.12); color:#dfeafc; }',
    'th { text-transform:uppercase; color:#9fb0c6; letter-spacing:0.08em; }'
  ]
})
export class PerformanceComponent implements OnInit {
  performance: PerformanceMetrics | null = null;
  isLoading = true;

  constructor(private readonly performanceService: PerformanceService) {}

  ngOnInit(): void {
    this.performanceService.getPerformance().subscribe({
      next: (response) => {
        this.performance = response.success ? response.data : null;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
