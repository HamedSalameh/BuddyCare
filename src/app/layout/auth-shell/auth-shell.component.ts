import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'bc-auth-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-shell-outer">
      <div class="auth-shell-inner">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .auth-shell-outer {
      min-height: 100dvh;
      background: linear-gradient(135deg, #EDE7FF 0%, #F8F7FF 50%, #E0F7FA 100%);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 0;
    }
    .auth-shell-inner {
      width: 100%;
      max-width: 430px;
      min-height: 100dvh;
      background: linear-gradient(135deg, #EDE7FF 0%, #F8F7FF 50%, #E0F7FA 100%);
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 0 60px rgba(124, 77, 255, 0.08);
    }
    @media (min-width: 430px) {
      .auth-shell-outer { align-items: center; padding: 2rem 0; }
      .auth-shell-inner { min-height: auto; border-radius: 1.5rem; overflow: hidden; }
    }
  `],
})
export class AuthShellComponent {}
