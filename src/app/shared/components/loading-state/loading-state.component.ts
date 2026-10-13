import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    <div class="loading-state" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <span>{{ message }}</span>
    </div>
  `,
  styles: [
    '.loading-state { display:flex; align-items:center; justify-content:center; gap:0.75rem; min-height:160px; color:#cbd5e1; }',
    '.spinner { width:18px; height:18px; border:2px solid rgba(148,163,184,0.3); border-top-color:#5eead4; border-radius:50%; animation:spin 0.8s linear infinite; }',
    '@keyframes spin { to { transform: rotate(360deg); }}'
  ]
})
export class LoadingStateComponent {
  @Input() message = 'Loading...';
}
