import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Instrument, InstrumentType } from '../../core/models/instrument.model';
import { InstrumentService } from '../../core/services/instrument.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-instruments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingStateComponent, EmptyStateComponent],
  template: `
    <section class="instruments-page">
      <div class="panel">
        <div class="toolbar">
          <div class="filters">
            <label>
              Filter
              <select [formControl]="typeControl">
                <option [value]="'all'">All</option>
                <option [value]="'1'">Equity</option>
                <option [value]="'2'">Future</option>
                <option [value]="'3'">Option</option>
              </select>
            </label>
            <label>
              Search
              <input type="search" [formControl]="searchControl" placeholder="Search symbol..." aria-label="Search instruments">
            </label>
          </div>
        </div>

        <div *ngIf="isLoading"><app-loading-state /></div>

        <div class="table-wrap" *ngIf="!isLoading && filteredInstruments.length; else noInstruments">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Exchange</th>
                <th>Type</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let instrument of filteredInstruments">
                <td>{{ instrument.symbol }}</td>
                <td>{{ instrument.exchange }}</td>
                <td>{{ getTypeLabel(instrument.type) }}</td>
                <td>{{ instrument.isActive ? 'Yes' : 'No' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noInstruments>
          <app-empty-state title="No instruments available." message="No matching instruments were returned by the lookup." />
        </ng-template>
      </div>
    </section>
  `,
  styles: [
    '.instruments-page { display:grid; gap:1rem; }',
    '.panel { background:rgba(17,28,46,.75); border:1px solid rgba(148,163,184,.2); border-radius:20px; padding:1rem; }',
    '.toolbar { margin-bottom:1rem; }',
    '.filters { display:flex; gap:1rem; flex-wrap:wrap; }',
    'label { display:grid; gap:0.5rem; color:#dfeafc; }',
    'select, input { min-width:160px; border:1px solid rgba(148,163,184,.25); background:#0b1220; color:#f8fafc; border-radius:12px; padding:0.6rem 0.75rem; }',
    '.table-wrap { overflow-x:auto; }',
    'table { width:100%; min-width:560px; border-collapse:collapse; }',
    'th, td { padding:0.8rem 0.75rem; border-bottom:1px solid rgba(148,163,184,.14); color:#e2e8f0; }',
    'th { text-transform:uppercase; color:#9fb0c6; letter-spacing:0.08em; }'
  ]
})
export class InstrumentsComponent implements OnInit {
  instruments: Instrument[] = [];
  allInstruments: Instrument[] = [];
  typeControl = new FormControl('all');
  searchControl = new FormControl('');
  isLoading = true;

  constructor(private readonly instrumentService: InstrumentService) {}

  ngOnInit(): void {
    this.typeControl.valueChanges.subscribe(() => this.applyFilters());
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
    this.loadInstruments();
  }

  loadInstruments(): void {
    this.isLoading = true;
    this.instrumentService.getInstruments().subscribe({
      next: (response) => {
        this.allInstruments = response.data;
        this.instruments = response.data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const typeValue = this.typeControl.value ?? 'all';
    const search = (this.searchControl.value ?? '').trim().toLowerCase();

    this.instruments = this.allInstruments.filter((instrument) => {
      const matchesType = typeValue === 'all' || String(instrument.type) === typeValue;
      const matchesSearch = !search || instrument.symbol.toLowerCase().includes(search);
      return matchesType && matchesSearch;
    });
  }

  get filteredInstruments(): Instrument[] {
    return this.instruments;
  }

  getTypeLabel(type: InstrumentType): string {
    switch (type) {
      case InstrumentType.Equity: return 'Equity';
      case InstrumentType.Future: return 'Future';
      case InstrumentType.Option: return 'Option';
      default: return 'Unknown';
    }
  }
}
