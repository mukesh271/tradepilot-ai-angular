import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-signal-score',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="signal-score" [attr.data-level]="level">
      <div class="value">{{ score }} / 100</div>
      <div class="meta">
        <span class="pill">{{ label }}</span>
        <div class="track"><span class="fill" [style.width.%]="score"></span></div>
      </div>
    </div>
  `,
  styles: [
    '.signal-score { display:flex; flex-direction:column; gap:0.5rem; min-width:160px; }',
    '.value { font-weight:700; color:#f8fafc; }',
    '.meta { display:grid; gap:0.45rem; }',
    '.pill { display:inline-flex; align-self:flex-start; border-radius:999px; padding:0.2rem 0.6rem; font-size:0.72rem; background:rgba(94,234,212,.15); color:#8ef1dc; }',
    '.track { width:100%; height:8px; border-radius:999px; background:rgba(148,163,184,.2); overflow:hidden; }',
    '.fill { display:block; height:100%; background:linear-gradient(90deg,#22c55e,#5eead4,#fbbf24,#f87171); border-radius:999px; }'
  ]
})
export class SignalScoreComponent {
  @Input() score = 0;

  get label(): string {
    if (this.score >= 90) return 'Strong';
    if (this.score >= 75) return 'Good';
    if (this.score >= 60) return 'Weak';
    return 'Avoid';
  }

  get level(): string {
    if (this.score >= 90) return 'strong';
    if (this.score >= 75) return 'good';
    if (this.score >= 60) return 'weak';
    return 'avoid';
  }
}
