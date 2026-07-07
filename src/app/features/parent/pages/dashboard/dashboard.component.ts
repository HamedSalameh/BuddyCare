import { Component, inject, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { AuthService } from '@core/auth/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { BcAvatarComponent } from '@shared/components';
import { PAIN_EMOJI } from '@core/models/check-in.model';

@Component({
  selector: 'bc-dashboard',
  standalone: true,
  imports: [TranslatePipe, RouterLink, TitleCasePipe, BcAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  readonly auth   = inject(AuthService);
  readonly dash   = inject(DashboardService);
  readonly PAIN_EMOJI = PAIN_EMOJI;

  readonly activeChild = computed(() => this.auth.activeChild());

  async ngOnInit(): Promise<void> {
    const family = this.auth.family();
    const child  = this.auth.activeChild();
    if (family && child) {
      await this.dash.loadForChild(family.id, child);
    }
  }

  /** Max pain value across the 7-day trend — used to scale the chart */
  readonly chartMax = computed(() =>
    Math.max(4, ...this.dash.painTrend7Days().map(d => d.maxPain)),
  );

  barHeight(value: number): number {
    const max = this.chartMax();
    return max > 0 ? Math.round((value / max) * 80) : 0;
  }

  painEmoji(level: number): string {
    return PAIN_EMOJI[level as 0|1|2|3|4] ?? '😊';
  }
}


