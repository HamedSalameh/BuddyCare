import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RewardService } from '@core/rewards/reward.service';
import { AuthService } from '@core/auth/auth.service';
import { GARDEN_STAGES, GARDEN_THRESHOLDS, STICKERS } from '@core/models/reward.model';

@Component({
  selector: 'bc-garden',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="garden-page">

      <!-- Header -->
      <div class="garden-header">
        <h1 class="garden-title">{{ 'HOME.NAV_GARDEN' | translate }} 🌿</h1>
        <div class="garden-points">
          <span class="points-badge">⭐ {{ rewards.totalPoints() }}</span>
        </div>
      </div>

      <!-- Main garden visual -->
      <div class="garden-scene" [style.background-color]="currentStage().bgColor">
        <div class="garden-sky">🌤️</div>
        <div class="garden-plants">
          @for (plant of plants(); track $index) {
            <div class="garden-plant" [class.garden-plant--big]="$index === 0" [style.animation-delay]="($index * 0.15) + 's'">
              {{ plant }}
            </div>
          }
          @if (plants().length === 0) {
            <div class="garden-empty">🌱</div>
          }
        </div>
        <div class="garden-ground">🟫🟫🟫🟫🟫</div>
      </div>

      <!-- Stage label + progress -->
      <div class="garden-progress-area">
        <p class="garden-stage-label">{{ currentStage().label }}</p>
        <div class="garden-progress-track">
          <div class="garden-progress-fill" [style.width.%]="progressPercent()"></div>
        </div>
        <p class="garden-progress-text">
          {{ rewards.totalCheckIns() }} / {{ nextThreshold() }} check-ins
        </p>
      </div>

      <!-- Sticker collection -->
      <div class="sticker-section">
        <h2 class="sticker-title">{{ 'REWARDS.MY_STICKERS' | translate }}</h2>
        <div class="sticker-grid">
          @for (s of allStickers; track s.id) {
            <div
              class="sticker-chip"
              [class.sticker-chip--locked]="!isUnlocked(s.id)"
              [title]="s.milestone + ' check-ins'"
            >
              <span class="sticker-emoji">{{ isUnlocked(s.id) ? s.emoji : '🔒' }}</span>
              <span class="sticker-count">{{ s.milestone }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Streak -->
      <div class="streak-section">
        <span class="streak-fire">🔥</span>
        <span class="streak-count">{{ rewards.streak() }}</span>
        <span class="streak-label">{{ 'REWARDS.DAY_STREAK' | translate }}</span>
      </div>

    </div>
  `,
  styleUrls: ['./garden.component.scss'],
})
export class GardenComponent implements OnInit {
  readonly rewards = inject(RewardService);
  private readonly auth = inject(AuthService);

  readonly allStickers = STICKERS;

  readonly currentStage = computed(() =>
    GARDEN_STAGES[this.rewards.gardenStage()] ?? GARDEN_STAGES[0],
  );

  readonly plants = computed(() => {
    const level = this.rewards.gardenStage();
    const stageEmojis = ['🌱','🌿','🌼','🌸','🌺','🌻','🌷','🌳','🌴','🏡','🌈'];
    // Show all stages up to current, creating a lush garden
    return stageEmojis.slice(0, level + 1).reverse();
  });

  readonly nextThreshold = computed(() =>
    GARDEN_THRESHOLDS[Math.min(this.rewards.gardenStage() + 1, GARDEN_THRESHOLDS.length - 1)] ?? 80,
  );

  readonly progressPercent = computed(() => {
    const current = this.rewards.totalCheckIns();
    const from  = GARDEN_THRESHOLDS[this.rewards.gardenStage()] ?? 0;
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

  isUnlocked(id: string): boolean {
    return this.rewards.state()?.unlockedStickers.includes(id) ?? false;
  }
}


