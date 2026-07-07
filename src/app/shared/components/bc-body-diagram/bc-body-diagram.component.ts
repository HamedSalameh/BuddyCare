import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { BodyLocation } from '@core/symptom-engine/symptom-config';

export interface DiagramPoint extends BodyLocation {
  // Touch-dot center on the figure (% of image width / height)
  dotX: number;
  dotY: number;
  // Floating label badge anchor (% of image)
  labelX: number;
  labelY: number;
  // Which side the badge arrow points FROM
  arrowSide: 'left' | 'right' | 'top' | 'bottom';
  color: string;
}

// Calibrated for the portrait Figure.jpg (~9:16)
// dotX / dotY = center of the anatomical area on the girl
// labelX / labelY = top-left of the floating badge
const DIAGRAM_POINTS: Record<string, Omit<DiagramPoint, keyof BodyLocation>> = {
  upper_belly:         { dotX: 50, dotY: 52, labelX: 62, labelY: 42, arrowSide: 'bottom', color: '#FF9800' },
  lower_belly:         { dotX: 50, dotY: 63, labelX: 62, labelY: 68, arrowSide: 'left',   color: '#7C4DFF' },
  left_side:           { dotX: 64, dotY: 57, labelX: 70, labelY: 52, arrowSide: 'left',   color: '#00BCD4' },
  right_side:          { dotX: 36, dotY: 57, labelX:  2, labelY: 52, arrowSide: 'right',  color: '#FF6B9D' },
  around_belly_button: { dotX: 50, dotY: 58, labelX:  2, labelY: 64, arrowSide: 'right',  color: '#66BB6A' },
};

@Component({
  selector: 'bc-body-diagram',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="body-diagram"
      role="group"
      [attr.aria-label]="'CHECK_IN.STEP_BODY_AREA' | translate"
    >
      <!-- Figure image -->
      <img
        src="assets/Figure.jpg"
        alt=""
        aria-hidden="true"
        class="body-diagram__img"
      />

      <!-- Pain-point dots (on the body) -->
      @for (pt of points(); track pt.id) {
        <button
          type="button"
          class="bd-dot"
          [class.bd-dot--selected]="isSelected(pt.id)"
          [style.left.%]="pt.dotX"
          [style.top.%]="pt.dotY"
          [style.--dot-color]="pt.color"
          (click)="toggle(pt.id)"
          role="checkbox"
          [attr.aria-checked]="isSelected(pt.id)"
          [attr.aria-label]="pt.labelKey | translate"
        >
          <span class="bd-dot__ring"></span>
          <span class="bd-dot__core">
            @if (isSelected(pt.id)) { <span class="bd-dot__check">✓</span> }
          </span>
        </button>

        <!-- Floating label badge -->
        <button
          type="button"
          class="bd-badge"
          [class.bd-badge--selected]="isSelected(pt.id)"
          [class.bd-badge--arrow-left]="pt.arrowSide === 'left'"
          [class.bd-badge--arrow-right]="pt.arrowSide === 'right'"
          [class.bd-badge--arrow-bottom]="pt.arrowSide === 'bottom'"
          [style.left.%]="pt.labelX"
          [style.top.%]="pt.labelY"
          [style.--badge-color]="pt.color"
          (click)="toggle(pt.id)"
          aria-hidden="true"
          tabindex="-1"
        >
          {{ pt.labelKey | translate }}
        </button>
      }
    </div>
  `,
  styleUrls: ['./bc-body-diagram.component.scss'],
})
export class BcBodyDiagramComponent {
  readonly locations        = input.required<BodyLocation[]>();
  readonly selected         = input<string[]>([]);
  readonly locationToggled  = output<string>();

  readonly points = computed<DiagramPoint[]>(() =>
    this.locations().map(loc => ({
      ...loc,
      ...(DIAGRAM_POINTS[loc.id] ?? {
        dotX: 50, dotY: 50,
        labelX: 65, labelY: 48,
        arrowSide: 'left' as const,
        color: '#7C4DFF',
      }),
    })),
  );

  isSelected(id: string): boolean {
    return this.selected().includes(id);
  }

  toggle(id: string): void {
    this.locationToggled.emit(id);
  }
}
