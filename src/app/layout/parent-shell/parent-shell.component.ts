import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

interface ParentNavItem {
  labelKey: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'bc-parent-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, MatIconModule],
  template: `
    <div class="parent-shell-wrapper" style="height:100dvh">
      <!-- Main scrollable content -->
      <main role="main">
        <router-outlet />
      </main>

      <!-- Bottom navigation bar (matches reference image right panel) -->
      <nav
        class="parent-bottom-nav"
        role="navigation"
        aria-label="Parent navigation"
      >
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            class="nav-item"
            [attr.aria-label]="item.labelKey | translate"
          >
            <span class="material-symbols-rounded" aria-hidden="true" dir="ltr">{{ item.icon }}</span>
            <span class="nav-label">{{ item.labelKey | translate }}</span>
          </a>
        }
      </nav>
    </div>
  `,
  styleUrls: ['./parent-shell.component.scss'],
})
export class ParentShellComponent {
  readonly navItems: ParentNavItem[] = [
    { labelKey: 'DASHBOARD.NAV_DASHBOARD', icon: 'dashboard',    route: '/parent/dashboard' },
    { labelKey: 'DASHBOARD.NAV_HISTORY',   icon: 'history',      route: '/parent/history' },
    { labelKey: 'DASHBOARD.NAV_REPORTS',   icon: 'bar_chart',    route: '/parent/reports' },
    { labelKey: 'DASHBOARD.NAV_CHILDREN',  icon: 'child_care',   route: '/parent/children' },
    { labelKey: 'DASHBOARD.NAV_SETTINGS',  icon: 'settings',     route: '/parent/settings' },
    { labelKey: 'DASHBOARD.NAV_KID_VIEW',  icon: 'face',         route: '/child/home' },
  ];
}
