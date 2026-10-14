import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IndicatorValue } from '../../core/models/technical-analysis.model';

@Component({
  selector: 'app-indicator-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="indicators" aria-label="Technical indicator values">
      <article class="indicator-card" *ngFor="let indicator of indicators">
        <span class="label">{{ indicator.label }}</span>
        <strong>{{ formatValue(indicator) }}</strong>
        <p>{{ indicator.description }}</p>
      </article>
      <div *ngIf="!indicators.length" class="no-indicators" role="status">
        Indicator values are unavailable or there is insufficient history.
      </div>
    </section>
  `,
  styles: [
    '.indicators { display:grid; grid-template-columns:repeat(auto-fit,minmax(155px,1fr)); gap:.75rem; }',
    '.indicator-card { min-width:0; border:1px solid var(--border); border-radius:14px; background:rgba(17,28,46,.72); padding:.9rem; }',
    '.label { color:var(--muted); font-size:.75rem; text-transform:uppercase; letter-spacing:.04em; }',
    'strong { display:block; color:#f8fafc; font-size:1.12rem; margin:.45rem 0; overflow-wrap:anywhere; }',
    'p { color:#94a3b8; font-size:.75rem; line-height:1.45; margin:0; }',
    '.no-indicators { grid-column:1/-1; color:var(--muted); padding:1rem; border:1px dashed var(--border); border-radius:12px; }'
  ]
})
export class IndicatorCardsComponent {
  @Input() indicators: IndicatorValue[] = [];

  formatValue(indicator: IndicatorValue): string {
    return indicator.value === null || !Number.isFinite(indicator.value)
      ? 'N/A'
      : `${indicator.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${indicator.unit ?? ''}`;
  }
}
