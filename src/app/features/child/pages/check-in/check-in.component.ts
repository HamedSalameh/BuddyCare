import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CheckInFlowService, TOTAL_STEPS } from '@core/symptom-engine/check-in-flow.service';
import { AuthService } from '@core/auth/auth.service';
import { CheckInRepository } from '@core/firestore/check-in.repository';
import { RewardService } from '@core/rewards/reward.service';
import {
  BcButtonComponent,
  BcChoiceChipComponent,
  BcMascotComponent,
  BcBodyDiagramComponent,
} from '@shared/components';
import { PainLevel } from '@core/models/check-in.model';

@Component({
  selector: 'bc-check-in',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    BcButtonComponent,
    BcChoiceChipComponent,
    BcMascotComponent,
    BcBodyDiagramComponent,
  ],
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss'],
})
export class CheckInComponent {
  readonly flow      = inject(CheckInFlowService);
  private readonly auth      = inject(AuthService);
  private readonly repo      = inject(CheckInRepository);
  private readonly rewardSvc = inject(RewardService);
  private readonly router    = inject(Router);

  readonly totalSteps = TOTAL_STEPS;

  readonly mascotMoods = computed(() => {
    const step = this.flow.step();
    if (step >= 4)    return 'happy' as const;
    return 'curious' as const;
  });

  readonly stepQuestionKey = computed(() => {
    const keys = [
      'CHECK_IN.STEP_BODY_AREA',
      'CHECK_IN.STEP_PAIN_LEVEL',
      'CHECK_IN.STEP_FEEL_TYPE',
      'CHECK_IN.STEP_ONSET',
      'CHECK_IN.STEP_ACTIVITY',
    ];
    return keys[this.flow.step() - 1] ?? '';
  });

  goBack(): void {
    if (this.flow.step() === 1) {
      this.router.navigate(['/child/home']);
    } else {
      this.flow.prev();
    }
  }

  async finish(): Promise<void> {
    const family  = this.auth.family();
    const child   = this.auth.activeChild();
    if (!family || !child) { this.router.navigate(['/child/home']); return; }

    const checkIn = this.flow.buildCheckIn(family.id, child.id);
    try {
      await this.repo.createCheckIn(checkIn);
    } catch {
      // Queued for offline sync
    }

    // Grant rewards (never-punish: always grants locally, syncs later)
    await this.rewardSvc.grantCheckInReward(family.id, child.id);

    this.flow.done.set(true);
  }

  celebrate(): void {
    this.rewardSvc.clearNewStickers();
    this.flow.reset();
    this.router.navigate(['/child/home']);
  }

  asPainLevel(n: number): PainLevel { return n as PainLevel; }
}

