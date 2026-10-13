import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="(notifications | async)?.length; else none">
      <div class="toast" *ngFor="let notification of (notifications | async) ?? []" [class]="'toast--' + notification.type">
        <span>{{ notification.message }}</span>
      </div>
    </div>
    <ng-template #none></ng-template>
  `,
  styles: [
    '.toast-container { position:fixed; right:1rem; top:1rem; z-index:1000; display:flex; flex-direction:column; gap:0.75rem; max-width:320px; width:100%; }',
    '.toast { padding:0.8rem 1rem; border-radius:12px; border:1px solid rgba(148,163,184,0.3); background:rgba(17,24,39,0.95); box-shadow:0 12px 30px rgba(15,23,42,.28); color:#e2e8f0; }',
    '.toast--success { border-color: rgba(34,197,94,.45); color:#bbf7d0; }',
    '.toast--error { border-color: rgba(248,113,113,.45); color:#fecaca; }',
    '.toast--warning { border-color: rgba(251,191,36,.45); color:#fef3c7; }',
    '.toast--info { border-color: rgba(94,234,212,.45); color:#ccfbf1; }'
  ]
})
export class ToastContainerComponent {
  private readonly notificationsService = inject(NotificationService);
  readonly notifications = this.notificationsService.notifications$;
}
