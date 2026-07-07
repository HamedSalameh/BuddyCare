import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass } from '@angular/common';

export type BcChipSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'bc-choice-chip',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Host fills its grid cell so all chips in a row are equal height
  host: { style: 'display: block; width: 100%; height: 100%;' },
  template: `
    <button
      type="button"
      role="radio"
      [attr.aria-checked]="selected()"
      [attr.aria-label]="label()"
      [disabled]="disabled()"
      [ngClass]="hostClasses()"
      class="bc-chip relative flex flex-col items-center justify-center gap-1.5 rounded-card border-2 transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-purple focus-visible:ring-offset-2 active:scale-95 min-h-touch min-w-touch"
      (click)="!disabled() && chipSelected.emit(value())"
    >
      <!-- Emoji or icon slot -->
      @if (emoji()) {
        <span class="bc-chip__emoji" aria-hidden="true">{{ emoji() }}</span>
      } @else if (icon()) {
        <span
          class="material-symbols-rounded bc-chip__icon"
          aria-hidden="true"
          dir="ltr"
        >{{ icon() }}</span>
      }

      <!-- Label -->
      @if (label()) {
        <span class="bc-chip__label font-semibold leading-tight text-center">{{ label() }}</span>
      }

      <!-- Selected checkmark -->
      @if (selected()) {
        <span
          class="bc-chip__check absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-purple flex items-center justify-center"
          aria-hidden="true"
        >
          <span class="material-symbols-rounded text-white" style="font-size:11px;font-variation-settings:'FILL' 1">check</span>
        </span>
      }
    </button>
  `,
  styleUrls: ['./bc-choice-chip.component.scss'],
})
export class BcChoiceChipComponent {
  readonly value    = input.required<string>();
  readonly label    = input('');
  readonly emoji    = input('');
  readonly icon     = input('');
  readonly selected = input(false);
  readonly disabled = input(false);
  readonly size     = input<BcChipSize>('md');
  readonly color    = input<string>('');   // optional pastel background override

  readonly chipSelected = output<string>();

  readonly hostClasses = computed(() => ({
    'bc-chip--sm':       this.size() === 'sm',
    'bc-chip--md':       this.size() === 'md',
    'bc-chip--lg':       this.size() === 'lg',
    'bc-chip--selected': this.selected(),
    'bc-chip--disabled': this.disabled(),
  }));

  readonly emojiSizeClass = computed(() => ({
    'sm': 'text-2xl',
    'md': 'text-3xl',
    'lg': 'text-4xl',
  }[this.size()] ?? 'text-3xl'));

  readonly iconSizeClass = computed(() => ({
    'sm': 'text-2xl',
    'md': 'text-3xl',
    'lg': 'text-4xl',
  }[this.size()] ?? 'text-3xl'));
}
