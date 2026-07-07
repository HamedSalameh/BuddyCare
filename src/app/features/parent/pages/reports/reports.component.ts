import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/auth/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { CheckIn, PAIN_EMOJI, PainLevel } from '@core/models/check-in.model';
import { BODY_LOCATIONS, FEEL_TYPES } from '@core/symptom-engine/symptom-config';

type Range = 7 | 14 | 30;

interface BarStat { label: string; value: number; percent: number; color: string; }

const LOC_COLORS  = ['#7C4DFF', '#FF6B9D', '#FF9800', '#00BCD4', '#66BB6A'];
const TRIG_COLORS = ['#FF9800', '#7C4DFF', '#00BCD4', '#66BB6A', '#FF6B9D'];
const TRIG_EMOJI: Record<string, string> = {
  eating: '🍽️', playing: '⚽', school: '🏫', sleeping: '😴',
  bathroom: '🚽', traveling: '🚗', nothing: '💭',
};

@Component({
  selector: 'bc-parent-reports',
  standalone: true,
  imports: [TranslatePipe, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rp-page">

      <!-- Header -->
      <div class="rp-header">
        <h1 class="rp-title">{{ 'REPORTS.TITLE' | translate }}</h1>
        <button class="rp-export-btn" (click)="exportPdf()" [disabled]="exporting()">
          <span class="material-symbols-rounded" dir="ltr">picture_as_pdf</span>
          {{ (exporting() ? 'REPORTS.EXPORTING' : 'REPORTS.EXPORT_PDF') | translate }}
        </button>
      </div>

      <!-- Range tabs -->
      <div class="rp-tabs">
        @for (r of ranges; track r) {
          <button class="rp-tab" [class.rp-tab--active]="selectedRange() === r" (click)="selectedRange.set(r)">
            {{ 'REPORTS.RANGE_' + r | translate }}
          </button>
        }
      </div>

      <!-- Printable region -->
      <div #reportEl class="rp-body">

        @if (loading()) {
          <div class="rp-empty"><span class="material-symbols-rounded" dir="ltr" style="font-size:2rem;color:#C4B5FD">hourglass_top</span></div>
        } @else if (filtered().length === 0) {
          <div class="rp-empty">
            <span style="font-size:3rem">📭</span>
            <p>{{ 'REPORTS.NO_DATA' | translate }}</p>
          </div>
        } @else {

          <!-- Summary cards -->
          <div class="rp-stat-grid">
            <div class="rp-stat-card">
              <span class="rp-stat-value">{{ summary().total }}</span>
              <span class="rp-stat-label">{{ 'REPORTS.TOTAL_CHECKINS' | translate }}</span>
            </div>
            <div class="rp-stat-card">
              <span class="rp-stat-value">{{ summary().avgPain | number:'1.1-1' }}</span>
              <span class="rp-stat-label">{{ 'REPORTS.AVG_PAIN' | translate }}</span>
            </div>
            <div class="rp-stat-card">
              <span class="rp-stat-value">{{ painEmoji(summary().worstPain) }}</span>
              <span class="rp-stat-label">{{ 'REPORTS.WORST_PAIN' | translate }}</span>
            </div>
            <div class="rp-stat-card rp-stat-card--warn">
              <span class="rp-stat-value">{{ summary().emergencies }}</span>
              <span class="rp-stat-label">{{ 'REPORTS.EMERGENCIES' | translate }}</span>
            </div>
          </div>

          <!-- Pain trend -->
          <div class="rp-section">
            <h2 class="rp-section-title">{{ 'REPORTS.PAIN_TREND' | translate }}</h2>
            <div class="rp-chart">
              @for (d of trend(); track d.label) {
                <div class="rp-chart-col">
                  <div class="rp-chart-bar-wrap">
                    <div class="rp-chart-bar" [style.height.%]="barH(d.avgPain)" [style.background]="barColor(d.avgPain)"></div>
                  </div>
                  <span class="rp-chart-label">{{ d.label }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Top locations -->
          @if (topLocations().length) {
            <div class="rp-section">
              <h2 class="rp-section-title">{{ 'REPORTS.TOP_LOCATIONS' | translate }}</h2>
              @for (s of topLocations(); track s.label) {
                <div class="rp-bar-row">
                  <span class="rp-bar-name">{{ s.label }}</span>
                  <div class="rp-bar-track">
                    <div class="rp-bar-fill" [style.width.%]="s.percent" [style.background]="s.color"></div>
                  </div>
                  <span class="rp-bar-pct">{{ s.percent }}%</span>
                </div>
              }
            </div>
          }

          <!-- Top triggers -->
          @if (topTriggers().length) {
            <div class="rp-section">
              <h2 class="rp-section-title">{{ 'REPORTS.TOP_TRIGGERS' | translate }}</h2>
              @for (s of topTriggers(); track s.label) {
                <div class="rp-bar-row">
                  <span class="rp-bar-name">{{ s.emoji }} {{ s.label }}</span>
                  <div class="rp-bar-track">
                    <div class="rp-bar-fill" [style.width.%]="s.percent" [style.background]="s.color"></div>
                  </div>
                  <span class="rp-bar-pct">{{ s.percent }}%</span>
                </div>
              }
            </div>
          }

          <!-- Recent check-ins -->
          <div class="rp-section">
            <h2 class="rp-section-title">{{ 'REPORTS.RECENT_CHECKINS' | translate }}</h2>
            @for (ci of recent(); track ci.id) {
              <div class="rp-ci-row">
                <span class="rp-ci-emoji">{{ painEmoji(ci.painLevel) }}</span>
                <div class="rp-ci-meta">
                  <span class="rp-ci-locs">{{ ci.bodyLocations.map(id => locationLabel(id)).join(', ') }}</span>
                  <span class="rp-ci-date">{{ ciDate(ci) | date:'MMM d, y · h:mm a' }}</span>
                </div>
                @if (ci.emergencyFlag) {
                  <span class="rp-ci-alert material-symbols-rounded" dir="ltr">warning</span>
                }
              </div>
            }
          </div>

        }
      </div>
    </div>
  `,
  styles: [`
    .rp-page { padding: 1.25rem; min-height: 100vh; background: #F8F6FF; }

    .rp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .rp-title  { font-size: 1rem; font-weight: 800; color: #1A1A2E; margin: 0; }

    .rp-export-btn {
      display: flex; align-items: center; gap: 0.35rem;
      padding: 0.45rem 0.9rem; border-radius: 2rem; border: none; cursor: pointer;
      background: #7C4DFF; color: #fff; font-size: 0.75rem; font-weight: 700;
      &:disabled { opacity: 0.6; cursor: not-allowed; }
      .material-symbols-rounded { font-size: 1.1rem; }
    }

    .rp-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .rp-tab {
      flex: 1; padding: 0.5rem 0; border-radius: 2rem; border: 1.5px solid #E9E3FF;
      background: #fff; color: #7C4DFF; font-size: 0.8rem; font-weight: 700; cursor: pointer;
      &.rp-tab--active { background: #7C4DFF; color: #fff; border-color: #7C4DFF; }
    }

    .rp-body { display: flex; flex-direction: column; gap: 1rem; }

    .rp-empty { display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      padding: 3rem 1rem; color: #9CA3AF; font-size: 0.875rem; font-weight: 600; }

    .rp-stat-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;
    }
    .rp-stat-card {
      background: #fff; border-radius: 1rem; padding: 1rem;
      box-shadow: 0 2px 8px rgba(124,77,255,0.06);
      display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
    }
    .rp-stat-card--warn .rp-stat-value { color: #FF6B9D; }
    .rp-stat-value { font-size: 1.5rem; font-weight: 900; color: #7C4DFF; }
    .rp-stat-label { font-size: 0.7rem; font-weight: 600; color: #9CA3AF; text-align: center; }

    .rp-section { background: #fff; border-radius: 1rem; padding: 1rem;
      box-shadow: 0 2px 8px rgba(124,77,255,0.06); }
    .rp-section-title { font-size: 0.8rem; font-weight: 800; color: #1A1A2E; margin: 0 0 0.75rem; }

    .rp-chart { display: flex; gap: 0.35rem; align-items: flex-end; height: 80px; }
    .rp-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; height: 100%; }
    .rp-chart-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .rp-chart-bar { width: 100%; border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.3s ease; }
    .rp-chart-label { font-size: 0.6rem; font-weight: 700; color: #9CA3AF; }

    .rp-bar-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;
      &:last-child { margin-bottom: 0; } }
    .rp-bar-name { font-size: 0.7rem; font-weight: 700; color: #374151; width: 5.5rem; flex-shrink: 0; }
    .rp-bar-track { flex: 1; height: 8px; background: #F3F0FF; border-radius: 4px; overflow: hidden; }
    .rp-bar-fill  { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
    .rp-bar-pct   { font-size: 0.65rem; font-weight: 700; color: #7C4DFF; width: 2.5rem; text-align: end; }

    .rp-ci-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0;
      border-bottom: 1px solid #F3F0FF; &:last-child { border-bottom: none; } }
    .rp-ci-emoji { font-size: 1.5rem; }
    .rp-ci-meta  { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
    .rp-ci-locs  { font-size: 0.75rem; font-weight: 700; color: #374151; }
    .rp-ci-date  { font-size: 0.65rem; color: #9CA3AF; }
    .rp-ci-alert { color: #FF6B9D; font-size: 1.1rem; }
  `],
})
export class ReportsComponent implements OnInit {
  @ViewChild('reportEl') reportEl!: ElementRef<HTMLDivElement>;

  private readonly auth      = inject(AuthService);
  private readonly translate = inject(TranslateService);
  readonly dash = inject(DashboardService);

  readonly ranges: Range[] = [7, 14, 30];
  readonly selectedRange = signal<Range>(7);
  readonly exporting = signal(false);
  readonly loading = this.dash.loading;

  // ─── Filtered check-ins for selected range ────────────────────────────────

  readonly filtered = computed<CheckIn[]>(() => this.dash.lastNDays(this.selectedRange()));

  // ─── Summary ──────────────────────────────────────────────────────────────

  readonly summary = computed(() => {
    const list = this.filtered();
    if (!list.length) return { total: 0, avgPain: 0, worstPain: 0 as PainLevel, emergencies: 0 };
    const pains = list.map(c => c.painLevel as number);
    return {
      total:       list.length,
      avgPain:     pains.reduce((a, b) => a + b, 0) / pains.length,
      worstPain:   Math.max(...pains) as PainLevel,
      emergencies: list.filter(c => c.emergencyFlag).length,
    };
  });

  // ─── Pain trend (one bar per day) ─────────────────────────────────────────

  readonly trend = computed(() => {
    const days    = this.selectedRange();
    const today   = new Date();
    const result: { label: string; avgPain: number }[] = [];
    const shortDay = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    for (let i = days - 1; i >= 0; i--) {
      const d   = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const day = this.filtered().filter(c => {
        const ts = c.timestamp?.toDate ? c.timestamp.toDate() : new Date(c.timestamp);
        return ts.toISOString().slice(0, 10) === iso;
      });
      const p = day.map(c => c.painLevel as number);
      result.push({
        label:   days <= 7 ? shortDay[d.getDay()] : String(d.getDate()),
        avgPain: p.length ? p.reduce((a, b) => a + b, 0) / p.length : 0,
      });
    }
    return result;
  });

  // ─── Bar stats ────────────────────────────────────────────────────────────

  readonly topLocations = computed<BarStat[]>(() => {
    const map = new Map<string, number>();
    this.filtered().forEach(c => c.bodyLocations.forEach(l => map.set(l, (map.get(l) ?? 0) + 1)));
    const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, count], i) => ({
      label:   this.locationLabel(id),
      value:   count,
      percent: Math.round((count / total) * 100),
      color:   LOC_COLORS[i % LOC_COLORS.length],
    }));
  });

  readonly topTriggers = computed<(BarStat & { emoji: string })[]>(() => {
    const map = new Map<string, number>();
    this.filtered().forEach(c => c.activities.forEach(a => map.set(a, (map.get(a) ?? 0) + 1)));
    const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, count], i) => ({
      label:   this.activityLabel(id),
      emoji:   TRIG_EMOJI[id] ?? '❓',
      value:   count,
      percent: Math.round((count / total) * 100),
      color:   TRIG_COLORS[i % TRIG_COLORS.length],
    }));
  });

  readonly recent = computed<CheckIn[]>(() =>
    [...this.filtered()].sort((a, b) => {
      const ta = a.timestamp?.seconds ?? 0;
      const tb = b.timestamp?.seconds ?? 0;
      return tb - ta;
    }).slice(0, 15),
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    const family = this.auth.family();
    const child  = this.auth.activeChild();
    if (family && child && !this.dash.checkIns().length) {
      await this.dash.loadForChild(family.id, child);
    }
  }

  // ─── Chart helpers ────────────────────────────────────────────────────────

  barH(value: number): number {
    const max = Math.max(4, ...this.trend().map(d => d.avgPain));
    return max > 0 ? Math.round((value / max) * 100) : 0;
  }

  barColor(avg: number): string {
    if (avg >= 3.5) return '#FF6B9D';
    if (avg >= 2.5) return '#FF9800';
    if (avg >= 1.5) return '#FFC107';
    return '#7C4DFF';
  }

  painEmoji(level: PainLevel | number): string {
    return PAIN_EMOJI[level as PainLevel] ?? '😊';
  }

  ciDate(ci: CheckIn): Date {
    return ci.timestamp?.toDate ? ci.timestamp.toDate() : new Date(ci.timestamp);
  }

  /** Translated location label for use in template and CSV. */
  locationLabel(id: string): string {
    const loc = BODY_LOCATIONS.find(l => l.id === id);
    return loc ? this.translate.instant(loc.labelKey)
               : id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  /** Translated activity/trigger label. */
  activityLabel(id: string): string {
    const feel = FEEL_TYPES.find(f => f.id === id);
    return feel ? this.translate.instant(feel.labelKey)
                : id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  // ─── PDF export ───────────────────────────────────────────────────────────

  async exportPdf(): Promise<void> {
    if (this.exporting() || !this.reportEl) return;
    this.exporting.set(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(this.reportEl.nativeElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F8F6FF',
      });
      const imgData   = canvas.toDataURL('image/png');
      const pdf       = new jsPDF('p', 'mm', 'a4');
      const pageW     = pdf.internal.pageSize.getWidth();
      const pageH     = pdf.internal.pageSize.getHeight();
      const imgH      = (canvas.height * pageW) / canvas.width;
      let   yOffset   = 0;
      while (yOffset < imgH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -yOffset, pageW, imgH);
        yOffset += pageH;
      }
      const child = this.auth.activeChild();
      const name  = child?.name ?? 'child';
      const date  = new Date().toISOString().slice(0, 10);
      pdf.save(`BuddyCare-${name}-${date}.pdf`);
    } finally {
      this.exporting.set(false);
    }
  }
}


