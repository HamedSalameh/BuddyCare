import { Component, inject, OnInit, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '@core/auth/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { CheckIn } from '@core/models/check-in.model';
import { PAIN_EMOJI } from '@core/models/check-in.model';
import { BODY_LOCATIONS } from '@core/symptom-engine/symptom-config';

@Component({
  selector: 'bc-parent-history',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="history-page">

      <!-- Header -->
      <div class="history-header">
        <h1 class="history-title">{{ 'DASHBOARD.NAV_HISTORY' | translate }}</h1>
      </div>

      @if (dash.loading()) {
        <div class="history-loading">
          <p>{{ 'DASHBOARD.LOADING' | translate }}</p>
        </div>
      } @else if (dash.recentCheckIns().length === 0) {
        <div class="history-empty">
          <span style="font-size:3rem">📋</span>
          <p>No check-ins recorded yet.</p>
        </div>
      } @else {
        <!-- Timeline -->
        <div class="timeline">
          @for (group of groupedCheckIns(); track group.date) {
            <div class="timeline-group">
              <div class="timeline-date-label">{{ group.date }}</div>
              @for (ci of group.items; track ci.id) {
                <div class="timeline-item">
                  <div class="timeline-dot" [style.background]="painColor(ci.painLevel)"></div>
                  <div class="timeline-card">
                    <div class="tcard-top">
                      <span class="tcard-emoji">{{ PAIN_EMOJI[ci.painLevel] }}</span>
                      <div class="tcard-info">
                        <span class="tcard-locations">{{ formatLocations(ci.bodyLocations) }}</span>
                        <span class="tcard-time">{{ getTime(ci.timestamp) }}</span>
                      </div>
                      <span class="tcard-pain" [style.color]="painColor(ci.painLevel)">
                        {{ ci.painLevel }}/4
                      </span>
                    </div>
                    @if (ci.symptoms.length > 0) {
                      <div class="tcard-symptoms">
                        @for (s of ci.symptoms; track s.typeId) {
                          <span class="symptom-tag">{{ s.typeId }}</span>
                        }
                      </div>
                    }
                    <div class="tcard-meta">
                      @if (ci.activities.length > 0) {
                        <span class="meta-tag">🎯 {{ ci.activities[0] }}</span>
                      }
                      @if (ci.mood) {
                        <span class="meta-tag">{{ moodEmoji(ci.mood) }} {{ ci.mood }}</span>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./history.component.scss'],
})
export class ParentHistoryComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  readonly dash = inject(DashboardService);
  readonly auth = inject(AuthService);
  readonly PAIN_EMOJI = PAIN_EMOJI;

  async ngOnInit(): Promise<void> {
    const family = this.auth.family();
    const child  = this.auth.activeChild();
    if (family && child) {
      await this.dash.loadForChild(family.id, child);
    }
  }

  readonly groupedCheckIns = computed(() => {
    const map = new Map<string, CheckIn[]>();
    for (const ci of this.dash.recentCheckIns()) {
      const ts  = ci.timestamp?.toDate ? ci.timestamp.toDate() : new Date(ci.timestamp);
      const key = ts.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ci);
    }
    return [...map.entries()].map(([date, items]) => ({ date, items }));
  });

  formatLocations(locs: string[]): string {
    return locs.map(id => {
      const loc = BODY_LOCATIONS.find(l => l.id === id);
      return loc ? this.translate.instant(loc.labelKey) : id.replace(/_/g, ' ');
    }).join(', ') || 'Unknown area';
  }

  getTime(timestamp: any): string {
    const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  painColor(level: number): string {
    return ['#66BB6A','#FFCA28','#FF9800','#FF6B9D','#EF5350'][level] ?? '#9CA3AF';
  }

  moodEmoji(mood: string): string {
    const map: Record<string,string> = { happy:'😊', sad:'😢', angry:'😠', scared:'😨', tired:'😴', excited:'🤩' };
    return map[mood] ?? '😶';
  }
}

