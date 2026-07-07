import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'bc-progress-bar',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bc-progress-bar flex flex-col gap-2"
      role="progressbar"
      [attr.aria-valuenow]="current()"
      [attr.aria-valuemin]="1"
      [attr.aria-valuemax]="total()"
      [attr.aria-label]="'CHECK_IN.PROGRESS' | translate: { current: current(), total: total() }"
    >
      <!-- Step label -->
      <div class="flex items-center justify-between px-1">
        <span class="text-sm font-semibold text-ink-secondary">
          {{ 'CHECK_IN.PROGRESS' | translate: { current: current(), total: total() } }}
        </span>
      </div>

      <!-- Track -->
      <div class="bc-progress-track relative h-2 rounded-pill bg-surface-muted overflow-hidden">
        <div
          class="bc-progress-fill h-full rounded-pill transition-all duration-500 ease-out"
          [style.width.%]="progressPercent()"
        ></div>
      </div>

      <!-- Step dots -->
      <div class="flex items-center justify-between px-0.5" aria-hidden="true">
        @for (step of steps(); track step) {
          <div
            class="bc-step-dot rounded-full transition-all duration-300"
            [class.bc-step-dot--active]="step === current()"
            [class.bc-step-dot--done]="step < current()"
          ></div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./bc-progress-bar.component.scss'],
})
export class BcProgressBarComponent {
  readonly current = input.required<number>();
  readonly total   = input.required<number>();

  readonly progressPercent = computed(() =>
    Math.round(((this.current() - 1) / (this.total() - 1)) * 100),
  );

  readonly steps = computed(() =>
    Array.from({ length: this.total() }, (_, i) => i + 1),
  );
}
