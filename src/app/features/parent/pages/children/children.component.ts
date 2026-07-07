import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@core/auth/auth.service';
import { BcAvatarComponent } from '@shared/components';

@Component({
  selector: 'bc-parent-children',
  standalone: true,
  imports: [TranslatePipe, BcAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding:1.25rem">
      <h1 style="font-size:1rem;font-weight:800;color:#1A1A2E;margin:0 0 1.5rem">{{ 'DASHBOARD.NAV_CHILDREN' | translate }}</h1>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        @for (child of auth.children(); track child.id) {
          <div style="background:#fff;border-radius:1rem;padding:1rem;box-shadow:0 2px 8px rgba(124,77,255,0.06);display:flex;align-items:center;gap:0.875rem">
            <bc-avatar [avatarId]="child.avatarId" [name]="child.name" size="lg" />
            <div style="flex:1">
              <p style="font-size:1rem;font-weight:800;color:#1A1A2E;margin:0">{{ child.name }}</p>
              <p style="font-size:0.75rem;color:#9CA3AF;margin:0">{{ 'CHILDREN.CHILD_AGE' | translate }}</p>
            </div>
            <div style="width:10px;height:10px;border-radius:50%;background:{{ auth.activeChild()?.id === child.id ? '#7C4DFF' : '#E5E7EB' }}"></div>
          </div>
        }
      </div>
      <div style="margin-top:1rem">
        <button style="width:100%;padding:0.875rem;border-radius:1rem;border:2px dashed rgba(124,77,255,0.3);background:transparent;color:#7C4DFF;font-weight:700;font-size:0.875rem;cursor:pointer">
          + {{ 'CHILDREN.ADD_CHILD' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class ChildrenComponent {
  readonly auth = inject(AuthService);
}

