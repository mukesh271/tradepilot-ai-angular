import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [
    '.empty-state { border:1px solid rgba(148,163,184,0.2); border-radius:16px; padding:2rem; text-align:center; background:rgba(17,28,46,.7); color:#cbd5e1; }',
    'h3 { margin:0 0 0.5rem; color:#f8fafc; }',
    'p { margin:0; color:#a7b5c9; }'
  ]
})
export class EmptyStateComponent {
  @Input() title = 'No data available.';
  @Input() message = 'Nothing to show right now.';
}
