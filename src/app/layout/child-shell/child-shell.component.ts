import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BcOfflineBannerComponent } from '@shared/components';

interface ChildNavItem {
  labelKey: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'bc-child-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, BcOfflineBannerComponent],
  template: `
    <div class="child-shell" style="height:100dvh">
      <!-- Offline banner -->
      <bc-offline-banner />

      <!-- Main scrollable content -->
      <main role="main">
        <router-outlet />
      </main>

      <!-- Bottom navigation bar -->
      <nav
        class="child-bottom-nav"
        role="navigation"
        aria-label="Child navigation"
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
  styleUrls: ['./child-shell.component.scss'],
})
export class ChildShellComponent {
  readonly navItems: ChildNavItem[] = [
    { labelKey: 'HOME.NAV_HOME',     icon: 'home',             route: '/child/home' },
    { labelKey: 'HOME.NAV_HISTORY',  icon: 'history',          route: '/child/history' },
    { labelKey: 'HOME.NAV_GARDEN',   icon: 'park',             route: '/child/garden' },
    { labelKey: 'HOME.NAV_AQUARIUM', icon: 'water',            route: '/child/aquarium' },
    { labelKey: 'HOME.NAV_PARENT',   icon: 'supervisor_account', route: '/parent/dashboard' },
  ];
}

