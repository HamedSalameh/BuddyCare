import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { BcBadgeColor } from '../bc-badge/bc-badge.component';

@Component({
  selector: 'bc-stat-card',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bc-stat-card rounded-card bg-white shadow-card p-4 flex flex-col gap-1">
      <span class="text-xs font-semibold text-ink-muted uppercase tracking-wide">{{ label() }}</span>
      <div class="flex items-end gap-2">
        <span class="text-2xl font-black text-ink leading-none">{{ value() }}</span>
        @if (unit()) {
          <span class="text-sm font-semibold text-ink-secondary mb-0.5">{{ unit() }}</span>
        }
      </div>
      @if (subtitle()) {
        <span class="text-xs text-ink-muted">{{ subtitle() }}</span>
      }
    </div>
  `,
  styles: [`
    .bc-stat-card {
      transition: box-shadow 200ms ease;
      &:hover { box-shadow: 0 8px 24px rgba(124, 77, 255, 0.12); }
    }
  `],
})
export class BcStatCardComponent {
  readonly label    = input.required<string>();
  readonly value    = input.required<string | number>();
  readonly unit     = input('');
  readonly subtitle = input('');
  readonly color    = input<BcBadgeColor>('purple');
}
