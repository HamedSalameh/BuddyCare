import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass } from '@angular/common';

export type BcButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type BcButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'bc-button',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-busy]="loading() || null"
      [ngClass]="hostClasses()"
      class="bc-button inline-flex items-center justify-center gap-2 font-bold rounded-pill transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-purple focus-visible:ring-offset-2 active:scale-95"
      (click)="!disabled() && !loading() && clicked.emit($event)"
    >
      @if (loading()) {
        <span class="bc-spinner" aria-hidden="true"></span>
      } @else if (iconLeft()) {
        <span class="material-symbols-rounded" aria-hidden="true" dir="ltr">{{ iconLeft() }}</span>
      }

      <ng-content />

      @if (iconRight() && !loading()) {
        <span class="material-symbols-rounded" aria-hidden="true" dir="ltr">{{ iconRight() }}</span>
      }
    </button>
  `,
  styleUrls: ['./bc-button.component.scss'],
})
export class BcButtonComponent {
  readonly variant = input<BcButtonVariant>('primary');
  readonly size     = input<BcButtonSize>('md');
  readonly type     = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading  = input(false);
  readonly iconLeft  = input<string>('');
  readonly iconRight = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly fullWidth = input(false);
  readonly square    = input(false);  // true = rectangular (0.75rem radius), false = pill

  readonly clicked = output<MouseEvent>();

  readonly hostClasses = computed(() => ({
    // Variants
    'bc-btn--primary':   this.variant() === 'primary',
    'bc-btn--secondary': this.variant() === 'secondary',
    'bc-btn--ghost':     this.variant() === 'ghost',
    'bc-btn--danger':    this.variant() === 'danger',
    // Sizes
    'bc-btn--sm': this.size() === 'sm',
    'bc-btn--md': this.size() === 'md',
    'bc-btn--lg': this.size() === 'lg',
    // State
    'bc-btn--loading':   this.loading(),
    'bc-btn--disabled':  this.disabled(),
    // Layout — using SCSS classes instead of unreliable Tailwind
    'bc-btn--full':   this.fullWidth(),
    'bc-btn--square': this.square(),
    'w-full': this.fullWidth(),  // keep for backward compat
  }));
}
