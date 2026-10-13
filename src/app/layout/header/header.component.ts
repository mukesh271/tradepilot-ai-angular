import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="brand">TradePilot AI</div>
      <div class="status-badge"><span class="dot"></span> PAPER MODE</div>
    </header>
  `,
  styles: [
    '.topbar { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1rem 1.25rem; background:rgba(15, 23, 42, 0.8); border-bottom:1px solid rgba(148,163,184,0.2); }',
    '.brand { font-size:1.5rem; font-weight:700; color:#f8fafc; }',
    '.status-badge { display:inline-flex; align-items:center; gap:0.5rem; padding:0.5rem 0.8rem; background:rgba(248,113,113,0.12); border:1px solid rgba(248,113,113,0.3); color:#fecaca; border-radius:999px; font-size:0.75rem; letter-spacing:0.08em; }',
    '.dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:#f87171; box-shadow:0 0 10px rgba(248,113,113,0.8); }'
  ]
})
export class HeaderComponent {}
