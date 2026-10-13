import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastContainerComponent } from '../../shared/components/toast/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, ToastContainerComponent],
  template: `
    <div class="page-shell">
      <app-toast-container />
      <app-header />
      <div class="workspace">
        <app-sidebar />
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    '.page-shell { min-height:100vh; display:flex; flex-direction:column; }',
    '.workspace { display:flex; flex:1; min-height:0; }',
    'app-sidebar { width:240px; flex-shrink:0; }',
    '.content { flex:1; padding:1.25rem; overflow:auto; }',
    '@media (max-width: 768px) { .workspace { display:block; } app-sidebar { width:100%; } .content { padding:1rem; } }'
  ]
})
export class MainLayoutComponent {}
