import { Component, inject, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RewardService } from '@core/rewards/reward.service';
import { AuthService } from '@core/auth/auth.service';
import { AQUARIUM_STAGES, AQUARIUM_THRESHOLDS } from '@core/models/reward.model';

@Component({
  selector: 'bc-aquarium',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="aquarium-page">

      <!-- Header -->
      <div class="aquarium-header">
        <h1 class="aquarium-title">{{ 'HOME.NAV_AQUARIUM' | translate }} 🌊</h1>
        <span class="fish-count">{{ rewards.totalCheckIns() }} check-ins</span>
      </div>

      <!-- Tank -->
      <div class="aquarium-tank" [style.background-color]="currentStage().waterColor">
        <!-- Bubbles -->
        <div class="bubble bubble--1">🫧</div>
        <div class="bubble bubble--2">🫧</div>
        <div class="bubble bubble--3">🫧</div>

        <!-- Water surface -->
        <div class="tank-surface">🌊🌊🌊🌊🌊</div>

        <!-- Fish swimming area -->
        <div class="tank-fish-area">
          @if (currentStage().fish.length === 0) {
            <p class="tank-empty">{{ 'REWARDS.NO_FISH_YET' | translate }}</p>
          } @else {
            @for (fish of currentStage().fish; track $index) {
              <span
                class="tank-fish"
                [class.tank-fish--flip]="$index % 2 === 1"
                [style.animation-delay]="($index * 0.7) + 's'"
              >{{ fish }}</span>
            }
          }
        </div>

        <!-- Sand bottom -->
        <div class="tank-sand">
          <span>🐚</span><span>🪨</span><span>🌿</span><span>🪸</span><span>🪨</span><span>🐚</span>
        </div>
      </div>

      <!-- Stage info -->
      <div class="tank-info">
        <p class="tank-stage-label">{{ currentStage().label }}</p>
        <div class="tank-progress-track">
          <div class="tank-progress-fill" [style.width.%]="progressPercent()"></div>
        </div>
        <p class="tank-progress-text">
          {{ 'REWARDS.NEXT_FISH' | translate: { count: rewards.totalCheckIns(), total: nextThreshold() } }}
        </p>
      </div>

      <!-- Pet happiness meter -->
      <div class="pet-section">
        <div class="pet-info">
          <span class="pet-emoji">🐼</span>
          <div class="pet-text">
            <p class="pet-name">{{ 'REWARDS.PET_NAME' | translate }}</p>
            <p class="pet-happiness-label">{{ 'REWARDS.PET_HAPPINESS' | translate }}</p>
          </div>
          <span class="pet-value">{{ rewards.petHappiness() }}%</span>
        </div>
        <div class="happiness-track">
          <div class="happiness-fill" [style.width.%]="rewards.petHappiness()"></div>
        </div>
      </div>

    </div>
  `,
  styleUrls: ['./aquarium.component.scss'],
})
export class AquariumComponent implements OnInit {
  readonly rewards = inject(RewardService);
  private readonly auth = inject(AuthService);

  readonly currentStage = computed(() =>
    AQUARIUM_STAGES[this.rewards.aquariumStage()] ?? AQUARIUM_STAGES[0],
  );

  readonly nextThreshold = computed(() =>
    AQUARIUM_THRESHOLDS[Math.min(this.rewards.aquariumStage() + 1, AQUARIUM_THRESHOLDS.length - 1)] ?? 85,
  );

  readonly progressPercent = computed(() => {
    const current = this.rewards.totalCheckIns();
    const from  = AQUARIUM_THRESHOLDS[this.rewards.aquariumStage()] ?? 0;
    const to    = this.nextThreshold();
    if (to === from) return 100;
    return Math.round(((current - from) / (to - from)) * 100);
  });

  async ngOnInit(): Promise<void> {
    const family = this.auth.family();
    const child  = this.auth.activeChild();
    if (family && child) {
      await this.rewards.loadForChild(family.id, child.id);
    }
  }
}


