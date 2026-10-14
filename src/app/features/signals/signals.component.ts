import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Signal, SignalStatus } from '../../core/models/signal.model';
import { SignalService } from '../../core/services/signal.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { SignalScoreComponent } from '../../shared/components/signal-score/signal-score.component';

@Component({
  selector: 'app-signals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingStateComponent, EmptyStateComponent, SignalScoreComponent, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <section class="signals-page">
      <div class="panel">
        <div class="toolbar">
          <div class="filters">
            <label>
              Minimum Score
              <select [formControl]="minimumScoreControl">
                <option [ngValue]="0">All</option>
                <option [ngValue]="60">60+</option>
                <option [ngValue]="75">75+</option>
                <option [ngValue]="90">90+</option>
              </select>
            </label>
            <label>
              Status
              <select [formControl]="statusControl">
                <option [value]="''">All</option>
                <option value="Detected">Detected</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
            </label>
          </div>
        </div>

        <div *ngIf="isLoading"><app-loading-state /></div>

        <div class="table-wrap" *ngIf="!isLoading && signals.length; else noSignals">
          <table>
            <thead>
              <tr>
                <th>Instrument</th>
                <th>Direction</th>
                <th>Strategy</th>
                <th>Score</th>
                <th>Entry</th>
                <th>Stop</th>
                <th>Target</th>
                <th>R:R</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let signal of signals">
                <td><a [routerLink]="['/signals', signal.id]">{{ signal.instrument?.symbol || signal.instrumentSymbol || 'N/A' }}</a></td>
                <td>{{ getDirection(signal.direction) }}</td>
                <td>{{ signal.strategy?.name || signal.strategyName || 'N/A' }}</td>
                <td><app-signal-score [score]="signal.signalScore" /></td>
                <td>{{ signal.entryPrice | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                <td>{{ signal.stopLoss | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                <td>{{ signal.target | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                <td>1:{{ signal.riskRewardRatio }}</td>
                <td>{{ signal.statusLabel || getStatus(signal.status) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noSignals>
          <app-empty-state title="No signals available." message="Signals detected by the backend will appear here." />
        </ng-template>
      </div>
    </section>
  `,
  styles: [
    '.signals-page { display:grid; gap:1rem; }',
    '.panel { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:20px; padding:1rem; }',
    '.toolbar { display:flex; justify-content:flex-end; margin-bottom:1rem; }',
    '.filters { display:flex; gap:1rem; flex-wrap:wrap; }',
    'label { display:grid; gap:0.5rem; color:#dfeafc; font-size:0.85rem; }',
    'select { min-width:140px; border:1px solid rgba(148,163,184,.25); background:#0b1220; color:#f8fafc; border-radius:12px; padding:0.55rem 0.75rem; }',
    '.table-wrap { overflow-x:auto; }',
    'table { width:100%; min-width:760px; border-collapse:collapse; }',
    'th, td { padding:0.85rem 0.75rem; border-bottom:1px solid rgba(148,163,184,.15); color:#dfeafc; }',
    'th { text-transform:uppercase; color:#9fb0c6; font-size:0.7rem; letter-spacing:0.08em; }',
    'a { color:#5eead4; }'
  ]
})
export class SignalsComponent implements OnInit {
  minimumScoreControl = new FormControl(0);
  statusControl = new FormControl('');
  signals: Signal[] = [];
  isLoading = true;

  constructor(private readonly signalService: SignalService) {}

  ngOnInit(): void {
    this.minimumScoreControl.valueChanges.subscribe(() => this.loadSignals());
    this.statusControl.valueChanges.subscribe(() => this.loadSignals());
    this.loadSignals();
  }

  loadSignals(): void {
    this.isLoading = true;
    const minimumScore = this.minimumScoreControl.value ?? 0;
    const statusValue = this.statusControl.value || undefined;

    this.signalService.getSignals(minimumScore || undefined, statusValue).subscribe({
      next: (response) => {
        this.signals = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getDirection(direction: number): string {
    if (direction === 1) return 'Bullish';
    if (direction === 2) return 'Bearish';
    return 'Neutral';
  }

  getStatus(status: number | string): string {
    if (typeof status === 'string') return status;
    switch (status) {
      case SignalStatus.Detected: return 'Detected';
      case SignalStatus.Alerted: return 'Alerted';
      case SignalStatus.Confirmed: return 'Confirmed';
      case SignalStatus.Expired: return 'Expired';
      default: return 'Invalidated';
    }
  }
}
