import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { NgClass } from '@angular/common';

export type BcCardVariant = 'default' | 'soft' | 'outlined' | 'elevated';
export type BcCardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'bc-card',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="hostClasses()" class="bc-card rounded-card bg-white overflow-hidden">
      <ng-content />
    </div>
  `,
  styleUrls: ['./bc-card.component.scss'],
})
export class BcCardComponent {
  readonly variant = input<BcCardVariant>('default');
  readonly padding = input<BcCardPadding>('md');
  readonly interactive = input(false);

  readonly hostClasses = computed(() => ({
    'bc-card--default':     this.variant() === 'default',
    'bc-card--soft':        this.variant() === 'soft',
    'bc-card--outlined':    this.variant() === 'outlined',
    'bc-card--elevated':    this.variant() === 'elevated',
    'bc-card--interactive': this.interactive(),
    'bc-card--p-none': this.padding() === 'none',
    'bc-card--p-sm':   this.padding() === 'sm',
    'bc-card--p-md':   this.padding() === 'md',
    'bc-card--p-lg':   this.padding() === 'lg',
  }));
}
