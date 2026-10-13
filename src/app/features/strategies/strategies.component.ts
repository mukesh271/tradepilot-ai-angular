import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Strategy } from '../../core/models/strategy.model';
import { StrategyService } from '../../core/services/strategy.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-strategies',
  standalone: true,
  imports: [CommonModule, LoadingStateComponent, EmptyStateComponent],
  template: `
    <section class="strategies-page">
      <div *ngIf="isLoading"><app-loading-state /></div>

      <div class="card-grid" *ngIf="!isLoading && strategies.length; else noStrategies">
        <article class="strategy-card" *ngFor="let strategy of strategies">
          <div class="card-header">
            <h3>{{ strategy.name }}</h3>
            <span class="status" [class.active]="strategy.isActive" [class.inactive]="!strategy.isActive">
              {{ strategy.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <p>{{ strategy.description }}</p>
        </article>
      </div>

      <ng-template #noStrategies>
        <app-empty-state title="No strategies available." message="Strategy definitions will appear here once the backend returns data." />
      </ng-template>
    </section>
  `,
  styles: [
    '.strategies-page { display:grid; gap:1rem; }',
    '.card-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; }',
    '.strategy-card { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:18px; padding:1rem; }',
    '.card-header { display:flex; justify-content:space-between; gap:0.75rem; align-items:center; margin-bottom:0.75rem; }',
    '.card-header h3 { margin:0; }',
    '.status { display:inline-flex; padding:0.35rem 0.6rem; border-radius:999px; font-size:0.72rem; font-weight:600; }',
    '.status.active { background:rgba(34,197,94,.12); color:#86efac; }',
    '.status.inactive { background:rgba(148,163,184,.12); color:#cbd5e1; }',
    'p { color:#dfeafc; margin:0; line-height:1.6; }'
  ]
})
export class StrategiesComponent implements OnInit {
  strategies: Strategy[] = [];
  isLoading = true;

  constructor(private readonly strategyService: StrategyService) {}

  ngOnInit(): void {
    this.strategyService.getStrategies().subscribe({
      next: (response) => {
        this.strategies = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
