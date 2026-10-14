import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav>
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/signals" routerLinkActive="active">Signals</a>
        <a routerLink="/paper-trades" routerLinkActive="active">Paper Trades</a>
        <a routerLink="/instruments" routerLinkActive="active">Instruments</a>
        <a routerLink="/strategies" routerLinkActive="active">Strategies</a>
        <a routerLink="/technical-analysis" routerLinkActive="active">Technical Analysis</a>
        <a routerLink="/performance" routerLinkActive="active">Performance</a>
        <a routerLink="/risk-settings" routerLinkActive="active">Risk Settings</a>
      </nav>
    </aside>
  `,
  styles: [
    '.sidebar { background:rgba(15,23,42,0.72); border-right:1px solid rgba(148,163,184,0.2); height:100%; }',
    'nav { display:flex; flex-direction:column; gap:0.5rem; padding:1rem; }',
    'a { padding:0.8rem 0.9rem; border-radius:12px; color:#dfeafc; transition:0.2s; }',
    'a:hover, a.active { background:rgba(94,234,212,0.12); color:#f8fafc; }'
  ]
})
export class SidebarComponent {}
