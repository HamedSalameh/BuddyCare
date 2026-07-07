import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@core/auth/auth.service';
import { BcButtonComponent, AVATAR_OPTIONS } from '@shared/components';
import { BcProgressBarComponent } from '@shared/components';

@Component({
  selector: 'bc-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, BcButtonComponent, BcProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="onboarding-page">

      <!-- Progress (full width, not trimmed) -->
      <div class="onboarding-progress">
        <bc-progress-bar [current]="step()" [total]="2" />
      </div>

      <!-- Step 1: Family name -->
      @if (step() === 1) {
        <div class="onboarding-step">
          <div class="onboarding-step__header">
            <h1 class="onboarding-h1">{{ 'ONBOARDING.WELCOME_TITLE' | translate }}</h1>
            <p class="onboarding-sub">{{ 'ONBOARDING.WELCOME_SUB' | translate }}</p>
          </div>

          <form [formGroup]="familyForm" (ngSubmit)="nextStep()" class="onboarding-form" novalidate>
            <div class="onboarding-field">
              <label class="field-label" for="familyName">{{ 'ONBOARDING.FAMILY_NAME_LABEL' | translate }}</label>
              <input id="familyName" type="text" formControlName="familyName"
                     class="bc-input" [placeholder]="'ONBOARDING.FAMILY_NAME_PLACEHOLDER' | translate" />
            </div>
            <bc-button type="submit" variant="primary" size="lg" [fullWidth]="true" [loading]="loading()">
              {{ 'ONBOARDING.CONTINUE' | translate }}
            </bc-button>
          </form>
        </div>
      }

      <!-- Step 2: First child profile -->
      @if (step() === 2) {
        <div class="onboarding-step">
          <div class="onboarding-step__header">
            <h1 class="onboarding-h1">{{ 'ONBOARDING.ADD_CHILD_TITLE' | translate }}</h1>
            <p class="onboarding-sub">{{ 'ONBOARDING.ADD_CHILD_SUB' | translate }}</p>
          </div>

          <form [formGroup]="childForm" (ngSubmit)="onSubmit()" class="onboarding-form" novalidate>
            <!-- Avatar picker -->
            <div>
              <p class="field-label" style="margin-bottom:0.75rem">{{ 'CHILDREN.SELECT_AVATAR' | translate }}</p>
              <div class="avatar-grid">
                @for (entry of avatarEntries; track entry.id) {
                  <button
                    type="button"
                    class="avatar-pick-btn"
                    [class.selected]="selectedAvatar() === entry.id"
                    [style.background-color]="entry.bg"
                    [attr.aria-pressed]="selectedAvatar() === entry.id"
                    [attr.aria-label]="'Avatar ' + entry.id"
                    (click)="selectedAvatar.set(entry.id)"
                  >{{ entry.emoji }}</button>
                }
              </div>
            </div>

            <div class="onboarding-field">
              <label class="field-label" for="childName">
                {{ 'CHILDREN.CHILD_NAME' | translate }}
              </label>
              <input id="childName" type="text" formControlName="name"
                     class="bc-input" [placeholder]="'ONBOARDING.CHILD_PLACEHOLDER' | translate" autocomplete="off" />
            </div>

            <div class="onboarding-footer-btns">
              <bc-button variant="ghost" size="md" [fullWidth]="true" (clicked)="step.set(1)">
                {{ 'ONBOARDING.BACK' | translate }}
              </bc-button>
              <bc-button type="submit" variant="primary" size="md" [fullWidth]="true" [loading]="loading()">
                {{ 'ONBOARDING.GET_STARTED' | translate }}
              </bc-button>
            </div>
          </form>
        </div>
      }

      @if (errorMsg()) {
        <p class="onboarding-error" role="alert">{{ errorMsg() }}</p>
      }
    </div>
  `,
  styles: [`
    .onboarding-page {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: 2rem 1.5rem 1.5rem;
      gap: 1.25rem;
      background: linear-gradient(160deg, #EDE7FF 0%, #F8F7FF 55%, #E8F5E9 100%);
    }
    .onboarding-progress { width: 100%; }
    .onboarding-step {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
    }
    .onboarding-step__header { display: flex; flex-direction: column; gap: 0.375rem; }
    .onboarding-h1 { font-size: 1.375rem; font-weight: 800; color: #1A1A2E; margin: 0; }
    .onboarding-sub { font-size: 0.875rem; color: #6B7280; margin: 0; }
    .onboarding-form { display: flex; flex-direction: column; gap: 1rem; }
    .onboarding-field { display: flex; flex-direction: column; gap: 0.375rem; }
    .field-label { font-size: 0.8125rem; font-weight: 700; color: #6B7280; }
    .onboarding-footer-btns { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
    .onboarding-error { font-size: 0.8125rem; color: #EF5350; font-weight: 600; text-align: center; margin: 0; }
    .avatar-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.625rem;
    }
    .avatar-pick-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      aspect-ratio: 1;
      border-radius: 50%;
      font-size: 1.5rem;
      border: 2px solid rgba(124,77,255,0.15);
      cursor: pointer;
      transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
      &.selected {
        border-color: #7C4DFF;
        box-shadow: 0 0 0 3px rgba(124,77,255,0.2);
        transform: scale(1.1);
      }
      &:hover:not(.selected) { border-color: rgba(124,77,255,0.4); }
    }
  `],
})
export class OnboardingComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly step         = signal(1);
  readonly loading      = signal(false);
  readonly errorMsg     = signal('');
  readonly selectedAvatar = signal(1);

  readonly avatarEntries = Object.entries(AVATAR_OPTIONS).map(
    ([id, v]) => ({ id: Number(id), emoji: (v as any).emoji as string, bg: (v as any).bg as string }),
  );

  readonly familyForm = this.fb.group({
    familyName: ['', [Validators.required, Validators.minLength(2)]],
  });

  readonly childForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  nextStep(): void {
    this.familyForm.markAllAsTouched();
    if (this.familyForm.invalid) return;
    this.step.set(2);
  }

  async onSubmit(): Promise<void> {
    this.childForm.markAllAsTouched();
    if (this.childForm.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorMsg.set('');

    try {
      const parentName = this.auth.parent()?.displayName ?? 'Parent';
      const familyId = await this.auth.createFamily(
        this.familyForm.value.familyName!,
        parentName,
      );
      await this.auth.addChild(familyId, this.childForm.value.name!, this.selectedAvatar());
      this.router.navigate(['/child/home']);
    } catch (err: any) {
      // Show the actual Firebase error code to help debug
      const code = err?.code ?? err?.message ?? 'unknown';
      this.errorMsg.set(`Error: ${code}`);
    } finally {
      this.loading.set(false);
    }
  }
}
