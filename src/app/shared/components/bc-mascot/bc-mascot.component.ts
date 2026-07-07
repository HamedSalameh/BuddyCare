import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass } from '@angular/common';

export type MascotMood = 'happy' | 'excited' | 'curious' | 'celebrating' | 'thinking';
export type MascotSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'bc-mascot',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bc-mascot flex flex-col items-center"
      [ngClass]="wrapperClasses()"
      role="img"
      [attr.aria-label]="'BuddyCare mascot — ' + mood()"
    >
      <!-- Mascot illustration (SVG panda with cape) -->
      <div
        class="bc-mascot__figure"
        [ngClass]="figureClasses()"
        [class.animate-float]="animated()"
        aria-hidden="true"
      >
        <!-- Soft glow circle behind the panda so it reads on white backgrounds -->
        <div class="bc-mascot__glow"></div>
        <svg
          viewBox="0 0 200 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="w-full h-full"
          style="position:relative;z-index:1"
        >
          <!-- Cape / background circle -->
          <ellipse cx="100" cy="195" rx="62" ry="16" fill="rgba(124,77,255,0.12)" />

          <!-- Cape -->
          <path d="M60 120 C55 155 50 185 100 200 C150 185 145 155 140 120 L130 115 C115 145 85 145 70 115 Z"
                fill="#7C4DFF" opacity="0.9"/>
          <path d="M100 200 L100 140" stroke="#5C3DE0" stroke-width="1.5" opacity="0.4"/>

          <!-- Body -->
          <ellipse cx="100" cy="130" rx="38" ry="42" fill="#F5F5F5"/>

          <!-- Belly patch -->
          <ellipse cx="100" cy="138" rx="22" ry="26" fill="#FAFAFA" opacity="0.8"/>

          <!-- Heart on belly -->
          <path d="M96 133 C96 130 100 128 100 131 C100 128 104 130 104 133 C104 136 100 140 100 140 C100 140 96 136 96 133Z"
                fill="#FF6B9D" opacity="0.7"/>

          <!-- Left ear -->
          <circle cx="72" cy="72" r="16" fill="#2D2D2D"/>
          <circle cx="72" cy="72" r="10" fill="#3D3D3D"/>

          <!-- Right ear -->
          <circle cx="128" cy="72" r="16" fill="#2D2D2D"/>
          <circle cx="128" cy="72" r="10" fill="#3D3D3D"/>

          <!-- Head -->
          <circle cx="100" cy="90" r="46" fill="#F5F5F5"/>

          <!-- Left eye patch -->
          <ellipse cx="84" cy="88" rx="14" ry="13" fill="#2D2D2D"/>
          <!-- Right eye patch -->
          <ellipse cx="116" cy="88" rx="14" ry="13" fill="#2D2D2D"/>

          <!-- Eyes — changes with mood -->
          @if (mood() === 'celebrating' || mood() === 'excited') {
            <!-- Happy arc eyes -->
            <path d="M79 87 Q84 82 89 87" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M111 87 Q116 82 121 87" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          } @else {
            <!-- Normal round eyes -->
            <circle cx="84" cy="88" r="6" fill="white"/>
            <circle cx="116" cy="88" r="6" fill="white"/>
            <circle cx="85.5" cy="87" r="3.5" fill="#1A1A2E"/>
            <circle cx="117.5" cy="87" r="3.5" fill="#1A1A2E"/>
            <!-- Eye shine -->
            <circle cx="87" cy="85.5" r="1.5" fill="white"/>
            <circle cx="119" cy="85.5" r="1.5" fill="white"/>
          }

          <!-- Nose -->
          <ellipse cx="100" cy="98" rx="5" ry="3.5" fill="#2D2D2D"/>

          <!-- Mouth — changes with mood -->
          @if (mood() === 'thinking') {
            <path d="M92 106 Q100 105 108 108" stroke="#2D2D2D" stroke-width="2" stroke-linecap="round" fill="none"/>
          } @else {
            <path d="M90 106 Q100 114 110 106" stroke="#2D2D2D" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          }

          <!-- Cheek blush -->
          <ellipse cx="76" cy="100" rx="8" ry="5" fill="#FF6B9D" opacity="0.3"/>
          <ellipse cx="124" cy="100" rx="8" ry="5" fill="#FF6B9D" opacity="0.3"/>

          <!-- Left arm -->
          <path d="M64 125 C50 115 46 130 52 138 C56 143 64 140 68 135"
                fill="#F5F5F5" stroke="#E0E0E0" stroke-width="0.5"/>

          <!-- Right arm (waving) -->
          @if (mood() === 'celebrating' || mood() === 'excited') {
            <path d="M136 120 C152 108 158 122 154 132 C150 140 140 138 136 132"
                  fill="#F5F5F5" stroke="#E0E0E0" stroke-width="0.5"/>
            <!-- Star sparkle -->
            <path d="M158 100 L160 94 L162 100 L168 100 L163 104 L165 110 L160 106 L155 110 L157 104 L152 100 Z"
                  fill="#FFCA28"/>
          } @else {
            <path d="M136 125 C150 115 154 130 148 138 C144 143 136 140 132 135"
                  fill="#F5F5F5" stroke="#E0E0E0" stroke-width="0.5"/>
          }

          <!-- Cape collar -->
          <path d="M70 115 Q100 125 130 115 L128 108 Q100 118 72 108 Z"
                fill="#9B6DFF" opacity="0.8"/>
        </svg>
      </div>

      <!-- Speech bubble -->
      @if (message()) {
        <div
          class="bc-mascot__bubble"
          role="status"
          aria-live="polite"
        >
          <div class="bc-mascot__bubble-tail" aria-hidden="true"></div>
          <p class="bc-mascot__bubble-text">{{ message() }}</p>
        </div>
      }
    </div>
  `,
  styleUrls: ['./bc-mascot.component.scss'],
})
export class BcMascotComponent {
  readonly mood     = input<MascotMood>('happy');
  readonly message  = input('');
  readonly size     = input<MascotSize>('md');
  readonly animated = input(true);

  readonly wrapperClasses = computed(() => ({
    'bc-mascot--sm': this.size() === 'sm',
    'bc-mascot--md': this.size() === 'md',
    'bc-mascot--lg': this.size() === 'lg',
    'bc-mascot--xl': this.size() === 'xl',
  }));

  readonly figureClasses = computed(() => ({
    'bc-mascot__figure--sm': this.size() === 'sm',
    'bc-mascot__figure--md': this.size() === 'md',
    'bc-mascot__figure--lg': this.size() === 'lg',
    'bc-mascot__figure--xl': this.size() === 'xl',
  }));
}
