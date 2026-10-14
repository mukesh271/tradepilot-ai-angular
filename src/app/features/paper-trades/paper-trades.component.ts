import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PaperTrade, TradeStatus } from '../../core/models/paper-trade.model';
import { Signal } from '../../core/models/signal.model';
import { PaperTradeService } from '../../core/services/paper-trade.service';
import { SignalService } from '../../core/services/signal.service';
import { NotificationService } from '../../core/services/notification.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-paper-trades',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EmptyStateComponent, LoadingStateComponent, CurrencyPipe, DatePipe],
  template: `
    <section class="paper-page">
      <div class="summary-grid">
        <article class="stat-card"><span>Open Trades</span><strong>{{ openTrades.length }}</strong></article>
        <article class="stat-card"><span>Closed Trades</span><strong>{{ closedTrades.length }}</strong></article>
      </div>

      <div class="panel" *ngIf="isLoading"><app-loading-state /></div>

      <div *ngIf="!isLoading && trades.length; else noTrades" class="table-wrap panel">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Direction</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Quantity</th>
              <th>P/L</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let trade of trades">
              <td>{{ getSignalSymbol(trade.signalId) }}</td>
              <td>{{ trade.signalDirection || getDirectionForTrade(trade.signalId) }}</td>
              <td>{{ trade.entryPrice | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
              <td>{{ trade.exitPrice ?? '-' }}</td>
              <td>{{ trade.quantity }}</td>
              <td>{{ trade.profitLoss ?? '-' }}</td>
              <td>{{ getStatusText(trade.status) }}</td>
              <td>{{ trade.createdAtUtc | date:'mediumDate' }}</td>
              <td>
                <div *ngIf="trade.status === TradeStatus.Open" class="close-controls">
                  <input type="number" min="0.01" step="0.01" placeholder="Exit price" aria-label="Exit price"
                    [(ngModel)]="closeExitPrices[trade.id]">
                  <input type="text" placeholder="Exit reason" aria-label="Exit reason"
                    [(ngModel)]="closeExitReasons[trade.id]">
                  <button type="button" (click)="closeTrade(trade.id, closeExitPrices[trade.id], closeExitReasons[trade.id])"
                    [disabled]="!closeExitPrices[trade.id] || !closeExitReasons[trade.id]?.trim()">Close Trade</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #noTrades>
        <app-empty-state title="No paper trades yet." message="Create your first paper trade from a signal." />
      </ng-template>

      <div class="panel create-panel" *ngIf="selectedSignal">
        <h2>Paper Trade Details</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <label>
              Signal
              <input type="text" [value]="selectedSignal.instrument?.symbol || 'NIFTY'" readonly>
            </label>
            <label>
              Entry Price
              <input type="number" formControlName="entryPrice" min="0.01">
            </label>
            <label>
              Quantity
              <input type="number" formControlName="quantity" min="1">
            </label>
            <label>
              Stop Loss
              <input type="number" formControlName="stopLoss" min="0.01">
            </label>
            <label>
              Target
              <input type="number" formControlName="target" min="0.01">
            </label>
            <label>
              Maximum Risk
              <input type="number" formControlName="maximumRisk" min="0">
            </label>
          </div>
          <div class="actions">
            <button type="submit" [disabled]="form.invalid">Create Paper Trade</button>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [
    '.paper-page { display:grid; gap:1.25rem; }',
    '.summary-grid { display:grid; grid-template-columns:repeat(2,minmax(180px,1fr)); gap:1rem; }',
    '.stat-card { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:18px; padding:1rem; display:flex; flex-direction:column; gap:0.5rem; }',
    '.stat-card span { color:#a7b5c9; }',
    '.stat-card strong { font-size:2rem; }',
    '.panel { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:18px; padding:1rem; }',
    '.table-wrap { overflow-x:auto; }',
    'table { width:100%; min-width:760px; border-collapse:collapse; }',
    'th, td { padding:0.75rem; border-bottom:1px solid rgba(148,163,184,.14); color:#dfeafc; }',
    'th { text-transform:uppercase; color:#9fb0c6; font-size:0.7rem; letter-spacing:0.08em; }',
    '.form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; }',
    'label { display:grid; gap:0.5rem; color:#dfeafc; }',
    'input { background:rgba(15,23,42,.9); color:#f8fafc; border:1px solid rgba(148,163,184,.2); border-radius:10px; padding:0.75rem; }',
    '.actions { display:flex; justify-content:flex-end; margin-top:1rem; }',
    'button { background:#5eead4; color:#04111a; border:none; border-radius:10px; padding:0.8rem 1rem; font-weight:700; cursor:pointer; }',
    'button:disabled { opacity:0.5; cursor:not-allowed; }',
    '.close-controls { display:grid; min-width:150px; gap:.35rem; }',
    '@media (max-width: 768px) { .summary-grid { grid-template-columns:1fr; } }'
  ]
})
export class PaperTradesComponent implements OnInit {
  readonly TradeStatus = TradeStatus;
  trades: PaperTrade[] = [];
  signals: Signal[] = [];
  selectedSignal?: Signal;
  isLoading = true;
  closeExitPrices: Record<number, number | null> = {};
  closeExitReasons: Record<number, string> = {};

  form = this.fb.group({
    entryPrice: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    quantity: [1, [Validators.required, Validators.min(1)]],
    stopLoss: [0, [Validators.required, Validators.min(0.01)]],
    target: [0, [Validators.required, Validators.min(0.01)]],
    maximumRisk: [0, [Validators.min(0)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly paperTradeService: PaperTradeService,
    private readonly signalService: SignalService,
    private readonly notificationService: NotificationService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const signalId = Number(this.route.snapshot.queryParamMap.get('signalId')) || undefined;
    this.signalService.getSignals().subscribe((response) => {
      this.signals = response.data;
      if (signalId) {
        this.selectedSignal = this.signals.find((signal) => signal.id === signalId) ?? this.signals[0];
        this.form.patchValue({
          entryPrice: this.selectedSignal?.entryPrice ?? 0,
          stopLoss: this.selectedSignal?.stopLoss ?? 0,
          target: this.selectedSignal?.target ?? 0,
          maximumRisk: ((this.selectedSignal?.entryPrice ?? 0) - (this.selectedSignal?.stopLoss ?? 0)) * (this.selectedSignal?.instrument?.lotSize ?? 1)
        });
      }
    });

    this.loadTrades();
  }

  get openTrades(): PaperTrade[] {
    return this.trades.filter((trade) => trade.status === TradeStatus.Open);
  }

  get closedTrades(): PaperTrade[] {
    return this.trades.filter((trade) => trade.status !== TradeStatus.Open);
  }

  loadTrades(): void {
    this.isLoading = true;
    this.paperTradeService.getPaperTrades().subscribe({
      next: (response) => {
        this.trades = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getSignalSymbol(signalId: number): string {
    const match = this.signals.find((signal) => signal.id === signalId);
    return match?.instrument?.symbol || 'NIFTY';
  }

  getDirectionForTrade(signalId: number): string {
    const match = this.signals.find((signal) => signal.id === signalId);
    return match ? (match.direction === 1 ? 'Bullish' : match.direction === 2 ? 'Bearish' : 'Neutral') : 'Bullish';
  }

  getStatusText(status: number): string {
    switch (status) {
      case TradeStatus.Open: return 'Open';
      case TradeStatus.TargetHit: return 'Target Hit';
      case TradeStatus.StopLossHit: return 'Stop Loss';
      case TradeStatus.ManuallyClosed: return 'Closed';
      case TradeStatus.Expired: return 'Expired';
      default: return 'Unknown';
    }
  }

  submit(): void {
    if (this.form.invalid || !this.selectedSignal) {
      this.notificationService.error('Please complete all paper trade fields correctly.');
      return;
    }

    const payload = {
      signalId: this.selectedSignal.id,
      entryPrice: Number(this.form.value.entryPrice),
      quantity: Number(this.form.value.quantity),
      status: TradeStatus.Open
    };

    this.paperTradeService.createPaperTrade(payload).subscribe({
      next: () => {
        this.notificationService.success('Paper trade created successfully.');
        this.loadTrades();
      },
      error: () => {
        this.notificationService.error('Unable to create paper trade.');
      }
    });
  }

  closeTrade(id: number, exitPrice: number | null | undefined, exitReason: string | undefined): void {
    if (!exitPrice || !exitReason?.trim()) {
      this.notificationService.error('Enter a valid exit price and reason before closing this trade.');
      return;
    }
    this.paperTradeService.closePaperTrade(id, { exitPrice, exitReason: exitReason.trim() }).subscribe({
      next: () => {
        this.notificationService.info('Paper trade closed.');
        this.loadTrades();
      },
      error: () => {
        this.notificationService.error('Unable to close paper trade.');
      }
    });
  }
}
