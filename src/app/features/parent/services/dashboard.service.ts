import { Injectable, inject, signal, computed } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CheckInRepository } from '@core/firestore/check-in.repository';
import { CheckIn, PainLevel, PAIN_EMOJI } from '@core/models/check-in.model';
import { Child } from '@core/models/user.model';
import { LoggerService } from '@core/logging/logger.service';
import { BODY_LOCATIONS, FEEL_TYPES } from '@core/symptom-engine/symptom-config';

export interface DayStat {
  date:     string;   // YYYY-MM-DD
  label:    string;   // Mon, Tue…
  avgPain:  number;
  maxPain:  number;
  count:    number;
}

export interface LocationStat  { id: string; label: string; percent: number; color: string; }
export interface TriggerStat   { id: string; label: string; emoji: string; percent: number; color: string; }
export interface CheckInSummary {
  totalThisWeek: number;
  avgPain:       number;
  worstPain:     number;
  worstEmoji:    string;
}

const DAY_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const LOC_COLORS  = ['#7C4DFF','#FF6B9D','#FF9800','#00BCD4','#66BB6A'];
const TRIG_COLORS = ['#FF9800','#7C4DFF','#00BCD4','#66BB6A','#FF6B9D'];

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly repo      = inject(CheckInRepository);
  private readonly logger    = inject(LoggerService);
  private readonly translate = inject(TranslateService);

  private readonly _checkIns  = signal<CheckIn[]>([]);
  private readonly _loading   = signal(false);

  readonly loading  = this._loading.asReadonly();
  readonly checkIns = this._checkIns.asReadonly();

  // ─── Derived stats ────────────────────────────────────────────────────────

  readonly weeklySummary = computed<CheckInSummary>(() => {
    const list = this.lastNDays(7);
    if (!list.length) return { totalThisWeek: 0, avgPain: 0, worstPain: 0, worstEmoji: '😊' };
    const pains = list.map(c => c.painLevel as number);
    const avg   = pains.reduce((a, b) => a + b, 0) / pains.length;
    const worst = Math.max(...pains) as PainLevel;
    return {
      totalThisWeek: list.length,
      avgPain:       Math.round(avg * 10) / 10,
      worstPain:     worst,
      worstEmoji:    PAIN_EMOJI[worst] ?? '😊',
    };
  });

  readonly painTrend7Days = computed<DayStat[]>(() => {
    const today  = new Date();
    const result: DayStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const d     = new Date(today);
      d.setDate(d.getDate() - i);
      const iso   = d.toISOString().slice(0, 10);
      const label = DAY_LABELS[d.getDay()];
      const day   = this._checkIns().filter(c => {
        const ts = c.timestamp?.toDate ? c.timestamp.toDate() : new Date(c.timestamp);
        return ts.toISOString().slice(0, 10) === iso;
      });
      const pains = day.map(c => c.painLevel as number);
      result.push({
        date:    iso,
        label,
        avgPain: pains.length ? pains.reduce((a, b) => a + b, 0) / pains.length : 0,
        maxPain: pains.length ? Math.max(...pains) : 0,
        count:   pains.length,
      });
    }
    return result;
  });

  readonly topLocations = computed<LocationStat[]>(() => {
    const map = new Map<string, number>();
    const list = this.lastNDays(30);
    list.forEach(c => c.bodyLocations.forEach(l => map.set(l, (map.get(l) ?? 0) + 1)));
    const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count], i) => ({
        id,
        label:   this.formatLabel(id),
        percent: Math.round((count / total) * 100),
        color:   LOC_COLORS[i % LOC_COLORS.length],
      }));
  });

  readonly topTriggers = computed<TriggerStat[]>(() => {
    const map = new Map<string, number>();
    const list = this.lastNDays(30);
    list.forEach(c => c.activities.forEach(a => map.set(a, (map.get(a) ?? 0) + 1)));
    const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
    const trigEmojis: Record<string, string> = {
      eating: '🍽️', playing: '⚽', school: '🏫', sleeping: '😴',
      bathroom: '🚽', traveling: '🚗', nothing: '💭',
    };
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count], i) => ({
        id,
        label:   this.formatLabel(id),
        emoji:   trigEmojis[id] ?? '❓',
        percent: Math.round((count / total) * 100),
        color:   TRIG_COLORS[i % TRIG_COLORS.length],
      }));
  });

  readonly recentCheckIns = computed<CheckIn[]>(() =>
    [...this._checkIns()].sort((a, b) => {
      const ta = a.timestamp?.seconds ?? 0;
      const tb = b.timestamp?.seconds ?? 0;
      return tb - ta;
    }).slice(0, 20),
  );

  // ─── Data loading ──────────────────────────────────────────────────────────

  async loadForChild(familyId: string, child: Child): Promise<void> {
    this._loading.set(true);
    try {
      const checkIns = await this.repo.listForChild(familyId, child.id, 100);
      this._checkIns.set(checkIns);
    } catch (err) {
      this.logger.error('[DashboardService] loadForChild error', err);
    } finally {
      this._loading.set(false);
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  lastNDays(n: number): CheckIn[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - n);
    return this._checkIns().filter(c => {
      const ts = c.timestamp?.toDate ? c.timestamp.toDate() : new Date(c.timestamp);
      return ts >= cutoff;
    });
  }

  private formatLabel(id: string): string {
    // Use the registered i18n label key if the id matches a known location or feel type
    const loc  = BODY_LOCATIONS.find(l => l.id === id);
    if (loc)  return this.translate.instant(loc.labelKey);
    const feel = FEEL_TYPES.find(f => f.id === id);
    if (feel) return this.translate.instant(feel.labelKey);
    // Fallback: humanise the snake_case id
    return id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
