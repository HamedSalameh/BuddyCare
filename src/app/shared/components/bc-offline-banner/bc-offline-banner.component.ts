import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NetworkStatusService } from '@core/offline/network-status.service';

@Component({
  selector: 'bc-offline-banner',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (network.showOfflineBanner()) {
      <div
        class="bc-offline-banner flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white"
        role="status"
        aria-live="polite"
      >
        <span class="material-symbols-rounded text-base" aria-hidden="true" dir="ltr">wifi_off</span>
        <span>{{ 'COMMON.OFFLINE_BANNER' | translate }}</span>
        @if (network.pendingCount() > 0) {
          <span class="ms-auto text-xs opacity-80">
            {{ network.pendingCount() }} pending
          </span>
        }
      </div>
    }
  `,
  styleUrls: ['./bc-offline-banner.component.scss'],
})
export class BcOfflineBannerComponent {
  readonly network = inject(NetworkStatusService);
}
