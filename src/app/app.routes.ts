import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'signals', loadComponent: () => import('./features/signals/signals.component').then((m) => m.SignalsComponent) },
      { path: 'signals/:id', loadComponent: () => import('./features/signals/signal-detail.component').then((m) => m.SignalDetailComponent) },
      { path: 'paper-trades', loadComponent: () => import('./features/paper-trades/paper-trades.component').then((m) => m.PaperTradesComponent) },
      { path: 'instruments', loadComponent: () => import('./features/instruments/instruments.component').then((m) => m.InstrumentsComponent) },
      { path: 'strategies', loadComponent: () => import('./features/strategies/strategies.component').then((m) => m.StrategiesComponent) },
      { path: 'performance', loadComponent: () => import('./features/performance/performance.component').then((m) => m.PerformanceComponent) },
      { path: 'risk-settings', loadComponent: () => import('./features/risk-settings/risk-settings.component').then((m) => m.RiskSettingsComponent) }
    ]
  }
];
