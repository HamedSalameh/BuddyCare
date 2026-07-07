import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';

export type BcBadgeColor =
  | 'purple' | 'pink' | 'teal' | 'orange' | 'green' | 'red' | 'yellow' | 'neutral';

@Component({
  selector: 'bc-badge',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bc-badge inline-flex flex-col items-center justify-center rounded-card px-3 py-2 min-w-[64px]"
      [ngClass]="colorClasses()"
    >
      <span class="bc-badge__value text-xl font-black leading-none">{{ value() }}</span>
      @if (label()) {
        <span class="bc-badge__label text-xs font-semibold mt-0.5 opacity-80 leading-tight text-center">
          {{ label() }}
        </span>
      }
      @if (icon()) {
        <span class="material-symbols-rounded text-lg mt-0.5" aria-hidden="true"
              style="font-variation-settings:'FILL' 1">{{ icon() }}</span>
      }
    </div>
  `,
  styleUrls: ['./bc-badge.component.scss'],
})
export class BcBadgeComponent {
  readonly value = input.required<string | number>();
  readonly label = input('');
  readonly icon  = input('');
  readonly color = input<BcBadgeColor>('purple');

  readonly colorClasses = computed(() => {
    const map: Record<BcBadgeColor, string> = {
      purple:  'bg-brand-purple-light text-brand-purple',
      pink:    'bg-brand-pink-light text-brand-pink',
      teal:    'bg-brand-teal-light text-brand-teal',
      orange:  'bg-brand-orange-light text-brand-orange',
      green:   'bg-brand-green-light text-brand-green',
      red:     'bg-brand-red-light text-brand-red',
      yellow:  'bg-brand-yellow-light text-brand-yellow',
      neutral: 'bg-surface-muted text-ink-secondary',
    };
    return map[this.color()];
  });
}
