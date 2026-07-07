import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';

export type BcAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Pre-defined avatar options (avatarId maps to an emoji + color pair)
const AVATAR_MAP: Record<number, { emoji: string; bg: string }> = {
  1:  { emoji: '🐱', bg: '#FFE4EF' },
  2:  { emoji: '🐶', bg: '#E0F7FA' },
  3:  { emoji: '🐼', bg: '#EDE7FF' },
  4:  { emoji: '🦊', bg: '#FFF3E0' },
  5:  { emoji: '🐨', bg: '#E8F5E9' },
  6:  { emoji: '🐸', bg: '#E8F5E9' },
  7:  { emoji: '🦁', bg: '#FFF3E0' },
  8:  { emoji: '🐰', bg: '#FFE4EF' },
  9:  { emoji: '🐻', bg: '#FFF3E0' },
  10: { emoji: '🦋', bg: '#EDE7FF' },
};

export const AVATAR_OPTIONS = AVATAR_MAP;

@Component({
  selector: 'bc-avatar',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bc-avatar rounded-full flex items-center justify-center overflow-hidden select-none flex-shrink-0"
      [ngClass]="sizeClass()"
      [style.background-color]="avatarData().bg"
      [attr.aria-label]="name() || 'Avatar'"
      role="img"
    >
      @if (avatarId() && avatarId() > 0) {
        <span [class]="emojiClass()" aria-hidden="true">{{ avatarData().emoji }}</span>
      } @else if (name()) {
        <span class="font-black text-ink" [class]="initialsClass()">
          {{ initials() }}
        </span>
      } @else {
        <span class="material-symbols-rounded text-ink-secondary" aria-hidden="true"
              style="font-variation-settings:'FILL' 1">person</span>
      }
    </div>
  `,
  styleUrls: ['./bc-avatar.component.scss'],
})
export class BcAvatarComponent {
  readonly avatarId = input(0);
  readonly name     = input('');
  readonly size     = input<BcAvatarSize>('md');

  readonly avatarData = computed(() => AVATAR_MAP[this.avatarId()] ?? { emoji: '👤', bg: '#EDE7FF' });

  readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (parts[0]?.[0] ?? '?').toUpperCase();
  });

  readonly sizeClass = computed(() => ({
    'xs': 'w-6 h-6',
    'sm': 'w-8 h-8',
    'md': 'w-10 h-10',
    'lg': 'w-14 h-14',
    'xl': 'w-20 h-20',
  }[this.size()] ?? 'w-10 h-10'));

  readonly emojiClass = computed(() => ({
    'xs': 'text-xs',
    'sm': 'text-sm',
    'md': 'text-xl',
    'lg': 'text-3xl',
    'xl': 'text-4xl',
  }[this.size()] ?? 'text-xl'));

  readonly initialsClass = computed(() => ({
    'xs': 'text-xs',
    'sm': 'text-xs',
    'md': 'text-sm',
    'lg': 'text-lg',
    'xl': 'text-2xl',
  }[this.size()] ?? 'text-sm'));
}
