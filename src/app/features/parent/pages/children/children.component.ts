import {
  Component, inject, signal, computed, ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/auth/auth.service';
import { CheckInRepository } from '@core/firestore/check-in.repository';
import { Child } from '@core/models/user.model';
import { CheckIn, PAIN_EMOJI } from '@core/models/check-in.model';
import { BcAvatarComponent, AVATAR_OPTIONS } from '@shared/components';

const AVATAR_IDS = Object.keys(AVATAR_OPTIONS).map(Number);

@Component({
  selector: 'bc-parent-children',
  standalone: true,
  imports: [TranslatePipe, FormsModule, DatePipe, BcAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ch-page">
      <h1 class="ch-title">{{ 'DASHBOARD.NAV_CHILDREN' | translate }}</h1>

      <!-- Child list -->
      <div class="ch-list">
        @for (child of auth.children(); track child.id) {

          <!-- Main card -->
          <div class="ch-card" [class.ch-card--active]="auth.activeChild()?.id === child.id">
            <div class="ch-card-row" (click)="toggleExpand(child.id)">
              <bc-avatar [avatarId]="child.avatarId" [name]="child.name" size="lg" />
              <div class="ch-card-info">
                <span class="ch-name">{{ child.name }}</span>
                @if (auth.activeChild()?.id === child.id) {
                  <span class="ch-badge">{{ 'CHILDREN.ACTIVE' | translate }}</span>
                }
              </div>
              <span class="ch-chevron material-symbols-rounded" dir="ltr"
                [style.transform]="expandedId() === child.id ? 'rotate(180deg)' : 'rotate(0deg)'">
                expand_more
              </span>
            </div>

            <!-- Action row -->
            @if (expandedId() === child.id && editingId() !== child.id) {
              <div class="ch-actions">
                <button class="ch-action-btn" (click)="startEdit(child)">
                  <span class="material-symbols-rounded" dir="ltr">edit</span>
                  {{ 'CHILDREN.EDIT' | translate }}
                </button>
                <button class="ch-action-btn" (click)="auth.setActiveChild(child)">
                  <span class="material-symbols-rounded" dir="ltr">swap_horiz</span>
                  {{ 'CHILDREN.SWITCH_CHILD' | translate }}
                </button>
                <button class="ch-action-btn" [disabled]="busy()"
                  (click)="exportData(child)">
                  <span class="material-symbols-rounded" dir="ltr">download</span>
                  {{ (busy() && busyChildId() === child.id ? 'CHILDREN.EXPORTING' : 'CHILDREN.EXPORT') | translate }}
                </button>
                <button class="ch-action-btn ch-action-btn--warn"
                  (click)="confirmClearId.set(child.id)">
                  <span class="material-symbols-rounded" dir="ltr">delete_sweep</span>
                  {{ 'CHILDREN.CLEAR_DATA' | translate }}
                </button>
                <button class="ch-action-btn ch-action-btn--danger"
                  (click)="confirmRemoveId.set(child.id)">
                  <span class="material-symbols-rounded" dir="ltr">person_remove</span>
                  {{ 'CHILDREN.REMOVE' | translate }}
                </button>
              </div>
            }

            <!-- Edit form -->
            @if (editingId() === child.id) {
              <div class="ch-edit-form">
                <input
                  class="ch-input"
                  type="text"
                  [(ngModel)]="editName"
                  [placeholder]="'CHILDREN.NAME_PLACEHOLDER' | translate"
                  maxlength="40"
                />
                <p class="ch-section-label">{{ 'CHILDREN.SELECT_AVATAR' | translate }}</p>
                <div class="ch-avatar-grid">
                  @for (id of avatarIds; track id) {
                    <button class="ch-avatar-opt"
                      [class.ch-avatar-opt--selected]="editAvatarId() === id"
                      (click)="editAvatarId.set(id)">
                      {{ avatarEmoji(id) }}
                    </button>
                  }
                </div>
                <div class="ch-edit-btns">
                  <button class="ch-btn ch-btn--ghost" (click)="cancelEdit()">
                    {{ 'CHILDREN.CANCEL' | translate }}
                  </button>
                  <button class="ch-btn ch-btn--primary" [disabled]="busy() || !editName.trim()"
                    (click)="saveEdit(child)">
                    {{ 'CHILDREN.SAVE' | translate }}
                  </button>
                </div>
              </div>
            }

            <!-- Confirm clear data -->
            @if (confirmClearId() === child.id) {
              <div class="ch-confirm ch-confirm--warn">
                <p class="ch-confirm-msg">
                  {{ 'CHILDREN.CLEAR_CONFIRM' | translate: { name: child.name } }}
                </p>
                @if (lastMessage()) {
                  <p class="ch-confirm-result">{{ lastMessage() }}</p>
                }
                <div class="ch-edit-btns">
                  <button class="ch-btn ch-btn--ghost" (click)="confirmClearId.set(null)">
                    {{ 'CHILDREN.CANCEL' | translate }}
                  </button>
                  <button class="ch-btn ch-btn--warn" [disabled]="busy()"
                    (click)="clearData(child)">
                    {{ 'CHILDREN.CLEAR_DATA' | translate }}
                  </button>
                </div>
              </div>
            }

            <!-- Confirm remove child -->
            @if (confirmRemoveId() === child.id) {
              <div class="ch-confirm ch-confirm--danger">
                <p class="ch-confirm-msg">
                  {{ 'CHILDREN.REMOVE_CONFIRM' | translate: { name: child.name } }}
                </p>
                <div class="ch-edit-btns">
                  <button class="ch-btn ch-btn--ghost" (click)="confirmRemoveId.set(null)">
                    {{ 'CHILDREN.CANCEL' | translate }}
                  </button>
                  <button class="ch-btn ch-btn--danger" [disabled]="busy()"
                    (click)="removeChild(child)">
                    {{ 'CHILDREN.REMOVE' | translate }}
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Add child -->
      @if (!showAddForm()) {
        <button class="ch-add-btn" (click)="showAddForm.set(true)">
          + {{ 'CHILDREN.ADD_CHILD' | translate }}
        </button>
      } @else {
        <div class="ch-card">
          <p class="ch-name" style="margin-bottom:0.75rem">{{ 'CHILDREN.ADD_TITLE' | translate }}</p>
          <div class="ch-edit-form">
            <input
              class="ch-input"
              type="text"
              [(ngModel)]="addName"
              [placeholder]="'CHILDREN.NAME_PLACEHOLDER' | translate"
              maxlength="40"
            />
            <p class="ch-section-label">{{ 'CHILDREN.SELECT_AVATAR' | translate }}</p>
            <div class="ch-avatar-grid">
              @for (id of avatarIds; track id) {
                <button class="ch-avatar-opt"
                  [class.ch-avatar-opt--selected]="addAvatarId() === id"
                  (click)="addAvatarId.set(id)">
                  {{ avatarEmoji(id) }}
                </button>
              }
            </div>
            <div class="ch-edit-btns">
              <button class="ch-btn ch-btn--ghost" (click)="showAddForm.set(false)">
                {{ 'CHILDREN.CANCEL' | translate }}
              </button>
              <button class="ch-btn ch-btn--primary" [disabled]="busy() || !addName.trim()"
                (click)="addChild()">
                {{ 'CHILDREN.ADD_CHILD' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .ch-page  { padding: 1.25rem; min-height: 100%; background: #F8F6FF; }
    .ch-title { font-size: 1rem; font-weight: 800; color: #1A1A2E; margin: 0 0 1rem; }
    .ch-list  { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }

    .ch-card {
      background: #fff; border-radius: 1rem;
      box-shadow: 0 2px 8px rgba(124,77,255,0.06); overflow: hidden;
      border: 1.5px solid transparent;
      &--active { border-color: rgba(124,77,255,0.2); }
    }
    .ch-card-row {
      display: flex; align-items: center; gap: 0.875rem;
      padding: 0.875rem 1rem; cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .ch-card-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
    .ch-name  { font-size: 0.9rem; font-weight: 800; color: #1A1A2E; }
    .ch-badge {
      display: inline-block; font-size: 0.62rem; font-weight: 800;
      color: #7C4DFF; background: #EDE7FF; border-radius: 999px;
      padding: 0.1rem 0.5rem; width: fit-content;
    }
    .ch-chevron { font-size: 1.25rem; color: #9CA3AF; transition: transform 0.2s ease; }

    .ch-actions {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 0.5rem; padding: 0 0.875rem 0.875rem;
    }
    .ch-action-btn {
      display: flex; align-items: center; gap: 0.35rem; justify-content: center;
      padding: 0.5rem 0.5rem; border-radius: 0.625rem; border: 1.5px solid #E9E3FF;
      background: #F8F6FF; color: #7C4DFF; font-size: 0.7rem; font-weight: 700;
      cursor: pointer; -webkit-tap-highlight-color: transparent;
      .material-symbols-rounded { font-size: 1rem; }
      &--warn  { color: #FF9800; border-color: rgba(255,152,0,0.25); background: #FFF8F0; }
      &--danger{ color: #EF5350; border-color: rgba(239,83,80,0.25); background: #FFF5F5; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .ch-edit-form { padding: 0 0.875rem 0.875rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .ch-input {
      width: 100%; padding: 0.65rem 0.875rem; border-radius: 0.75rem;
      border: 1.5px solid #E9E3FF; font-size: 0.875rem; font-family: inherit;
      color: #1A1A2E; outline: none;
      &:focus { border-color: #7C4DFF; }
    }
    .ch-section-label { font-size: 0.7rem; font-weight: 800; color: #9CA3AF; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .ch-avatar-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; }
    .ch-avatar-opt {
      aspect-ratio: 1; border-radius: 0.625rem; border: 1.5px solid #E9E3FF;
      background: #F8F6FF; font-size: 1.5rem; cursor: pointer; display: flex;
      align-items: center; justify-content: center;
      -webkit-tap-highlight-color: transparent;
      &--selected { border-color: #7C4DFF; background: #EDE7FF; }
    }
    .ch-edit-btns { display: flex; gap: 0.5rem; }
    .ch-btn {
      flex: 1; padding: 0.65rem; border-radius: 2rem; border: none;
      font-size: 0.8rem; font-weight: 800; cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      &--primary { background: #7C4DFF; color: #fff; }
      &--ghost   { background: #F3F0FF; color: #7C4DFF; }
      &--warn    { background: #FF9800; color: #fff; }
      &--danger  { background: #EF5350; color: #fff; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .ch-confirm {
      padding: 0.75rem 0.875rem 0.875rem; border-top: 1px solid #F3F0FF;
      display: flex; flex-direction: column; gap: 0.625rem;
      &--warn   { background: #FFFBF0; }
      &--danger { background: #FFF5F5; }
    }
    .ch-confirm-msg    { font-size: 0.8rem; font-weight: 700; color: #374151; margin: 0; line-height: 1.5; }
    .ch-confirm-result { font-size: 0.75rem; font-weight: 700; color: #7C4DFF; margin: 0; }

    .ch-add-btn {
      width: 100%; padding: 0.875rem; border-radius: 1rem;
      border: 2px dashed rgba(124,77,255,0.3); background: transparent;
      color: #7C4DFF; font-weight: 800; font-size: 0.875rem; cursor: pointer;
      font-family: inherit; -webkit-tap-highlight-color: transparent;
    }
  `],
})
export class ChildrenComponent {
  private readonly checkInRepo = inject(CheckInRepository);
  private readonly translate   = inject(TranslateService);
  readonly auth = inject(AuthService);

  readonly avatarIds = AVATAR_IDS;

  // ─── UI state ─────────────────────────────────────────────────────────────
  readonly expandedId     = signal<string | null>(null);
  readonly editingId      = signal<string | null>(null);
  readonly confirmClearId = signal<string | null>(null);
  readonly confirmRemoveId = signal<string | null>(null);
  readonly showAddForm    = signal(false);
  readonly busy           = signal(false);
  readonly busyChildId    = signal<string | null>(null);
  readonly lastMessage    = signal('');

  // edit form
  editName    = '';
  readonly editAvatarId = signal(1);
  // add form
  addName     = '';
  readonly addAvatarId  = signal(1);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  avatarEmoji(id: number): string {
    return (AVATAR_OPTIONS as any)[id]?.emoji ?? '🐱';
  }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
    this.confirmClearId.set(null);
    this.confirmRemoveId.set(null);
    this.editingId.set(null);
    this.lastMessage.set('');
  }

  // ─── Edit ─────────────────────────────────────────────────────────────────
  startEdit(child: Child): void {
    this.editName = child.name;
    this.editAvatarId.set(child.avatarId);
    this.editingId.set(child.id);
  }

  cancelEdit(): void { this.editingId.set(null); }

  async saveEdit(child: Child): Promise<void> {
    if (!this.editName.trim() || this.busy()) return;
    this.busy.set(true);
    try {
      await this.auth.updateChild(child.familyId, child.id, {
        name:     this.editName.trim(),
        avatarId: this.editAvatarId(),
      });
      this.editingId.set(null);
    } finally {
      this.busy.set(false);
    }
  }

  // ─── Clear data ───────────────────────────────────────────────────────────
  async clearData(child: Child): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.busyChildId.set(child.id);
    try {
      const count = await this.checkInRepo.deleteAllForChild(child.familyId, child.id);
      this.lastMessage.set(
        this.translate.instant('CHILDREN.CLEAR_DONE', { count }),
      );
      this.confirmClearId.set(null);
    } finally {
      this.busy.set(false);
      this.busyChildId.set(null);
    }
  }

  // ─── Remove child ─────────────────────────────────────────────────────────
  async removeChild(child: Child): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.auth.removeChild(child.familyId, child.id);
      this.confirmRemoveId.set(null);
      this.expandedId.set(null);
    } finally {
      this.busy.set(false);
    }
  }

  // ─── Export CSV ───────────────────────────────────────────────────────────
  async exportData(child: Child): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.busyChildId.set(child.id);
    try {
      const checkIns = await this.checkInRepo.listAllForExport(child.familyId, child.id);
      const csv = this.buildCsv(child.name, checkIns);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `BuddyCare-${child.name}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      this.busy.set(false);
      this.busyChildId.set(null);
    }
  }

  private buildCsv(childName: string, checkIns: CheckIn[]): string {
    const header = [
      'Date', 'Time', 'Pain (0-4)', 'Pain Emoji',
      'Body Locations', 'Feel Types', 'Onset',
      'Activities', 'Mood', 'Emergency',
    ].join(',');

    const rows = checkIns.map(ci => {
      const ts   = ci.timestamp?.toDate ? ci.timestamp.toDate() : new Date(ci.timestamp);
      const date = ts.toLocaleDateString('en-GB');
      const time = ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const csv  = (v: string) => `"${v.replace(/"/g, '""')}"`;
      return [
        date,
        time,
        ci.painLevel,
        PAIN_EMOJI[ci.painLevel] ?? '',
        csv(ci.bodyLocations.join(' | ')),
        csv(ci.symptoms.map(s => s.typeId).join(' | ')),
        csv(ci.onset ?? ''),
        csv(ci.activities.join(' | ')),
        csv(ci.mood ?? ''),
        ci.emergencyFlag ? 'Yes' : 'No',
      ].join(',');
    });

    return [`BuddyCare Health Report — ${childName}`, header, ...rows].join('\r\n');
  }

  // ─── Add child ────────────────────────────────────────────────────────────
  async addChild(): Promise<void> {
    const family = this.auth.family();
    if (!family || !this.addName.trim() || this.busy()) return;
    this.busy.set(true);
    try {
      await this.auth.addChild(family.id, this.addName.trim(), this.addAvatarId());
      this.addName = '';
      this.addAvatarId.set(1);
      this.showAddForm.set(false);
    } finally {
      this.busy.set(false);
    }
  }
}


