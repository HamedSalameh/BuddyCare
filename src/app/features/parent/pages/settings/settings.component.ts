import { Component, inject, signal, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SlicePipe } from '@angular/common';
import { AuthService } from '@core/auth/auth.service';
import { CheckInRepository } from '@core/firestore/check-in.repository';
import { BcLangSwitcherComponent } from '@shared/components';

interface BackupFile {
  version:    string;
  appName:    string;
  exportDate: string;
  familyName: string;
  checkIns:   unknown[];
}

@Component({
  selector: 'bc-parent-settings',
  standalone: true,
  imports: [TranslatePipe, SlicePipe, BcLangSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding:1.25rem;display:flex;flex-direction:column;gap:1rem">
      <h1 style="font-size:1rem;font-weight:800;color:#1A1A2E;margin:0">{{ 'SETTINGS.TITLE' | translate }}</h1>

      <!-- Language -->
      <div style="background:#fff;border-radius:1rem;box-shadow:0 2px 8px rgba(124,77,255,0.06);overflow:hidden">
        <div style="display:flex;align-items:center;gap:0.75rem;padding:1rem">
          <span style="font-size:1.25rem">🌐</span>
          <span style="font-size:0.875rem;font-weight:600;color:#1A1A2E;flex:1">{{ 'SETTINGS.LANGUAGE' | translate }}</span>
          <bc-lang-switcher />
        </div>
      </div>

      <!-- Backup & Restore -->
      <div style="background:#fff;border-radius:1rem;box-shadow:0 2px 8px rgba(124,77,255,0.06);overflow:hidden">
        <div style="padding:0.75rem 1rem;font-size:0.7rem;font-weight:800;color:#9CA3AF;letter-spacing:0.05em;text-transform:uppercase;border-bottom:1px solid rgba(124,77,255,0.06)">
          Backup & Restore
        </div>
        <button (click)="exportBackup()" [disabled]="busy()"
          style="width:100%;display:flex;align-items:center;gap:0.75rem;padding:1rem;background:none;border:none;border-bottom:1px solid rgba(124,77,255,0.06);cursor:pointer;text-align:start">
          <span style="font-size:1.25rem">💾</span>
          <div style="flex:1">
            <div style="font-size:0.875rem;font-weight:700;color:#1A1A2E">Export backup</div>
            <div style="font-size:0.75rem;color:#9CA3AF">Download all data as JSON</div>
          </div>
        </button>
        <button (click)="fileInput.click()" [disabled]="busy()"
          style="width:100%;display:flex;align-items:center;gap:0.75rem;padding:1rem;background:none;border:none;cursor:pointer;text-align:start">
          <span style="font-size:1.25rem">📥</span>
          <div style="flex:1">
            <div style="font-size:0.875rem;font-weight:700;color:#1A1A2E">Import backup</div>
            <div style="font-size:0.75rem;color:#9CA3AF">Restore from a JSON backup file</div>
          </div>
        </button>
        <input #fileInput type="file" accept=".json" style="display:none" (change)="onFileSelected($event)" />
        @if (pendingImport()) {
          <div style="padding:0.875rem 1rem;background:#F0FDF4;border-top:1px solid rgba(102,187,106,0.2)">
            <p style="font-size:0.8rem;font-weight:700;color:#374151;margin:0 0 0.625rem">
              Found {{ pendingImport()!.checkIns.length }} check-ins from &quot;{{ pendingImport()!.familyName }}&quot; ({{ pendingImport()!.exportDate | slice:0:10 }}). Import?
            </p>
            <div style="display:flex;gap:0.5rem">
              <button (click)="cancelImport()" style="flex:1;padding:0.5rem;border-radius:2rem;border:none;background:#E5E7EB;font-size:0.8rem;font-weight:700;cursor:pointer;color:#374151">Cancel</button>
              <button (click)="confirmImport()" [disabled]="busy()" style="flex:1;padding:0.5rem;border-radius:2rem;border:none;background:#66BB6A;color:#fff;font-size:0.8rem;font-weight:700;cursor:pointer">Import</button>
            </div>
          </div>
        }
        @if (statusMsg()) {
          <div style="padding:0.75rem 1rem;font-size:0.8rem;font-weight:700;color:#7C4DFF;border-top:1px solid rgba(124,77,255,0.06)">{{ statusMsg() }}</div>
        }
      </div>

      <!-- Account -->
      <div style="background:#fff;border-radius:1rem;box-shadow:0 2px 8px rgba(124,77,255,0.06);overflow:hidden">
        <div style="padding:0.75rem 1rem;font-size:0.7rem;font-weight:800;color:#9CA3AF;letter-spacing:0.05em;text-transform:uppercase;border-bottom:1px solid rgba(124,77,255,0.06)">
          Account
        </div>
        <button (click)="signOut()"
          style="width:100%;display:flex;align-items:center;gap:0.75rem;padding:1rem;background:none;border:none;cursor:pointer;text-align:start">
          <span style="font-size:1.25rem">🚪</span>
          <span style="font-size:0.875rem;font-weight:700;color:#EF5350;flex:1">{{ 'SETTINGS.SIGN_OUT' | translate }}</span>
        </button>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly auth        = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly checkInRepo = inject(CheckInRepository);

  readonly busy          = signal(false);
  readonly statusMsg     = signal('');
  readonly pendingImport = signal<BackupFile | null>(null);

  async exportBackup(): Promise<void> {
    const family = this.auth.family();
    if (!family || this.busy()) return;
    this.busy.set(true);
    this.statusMsg.set('');
    try {
      const checkIns = await this.checkInRepo.listAllForFamily(family.id);
      const payload: BackupFile = { version: '1', appName: 'BuddyCare', exportDate: new Date().toISOString(), familyName: family.name, checkIns };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `BuddyCare-backup-${family.name}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.statusMsg.set(`Exported ${checkIns.length} check-ins.`);
    } catch { this.statusMsg.set('Export failed. Please try again.'); }
    finally  { this.busy.set(false); }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    (event.target as HTMLInputElement).value = '';
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as BackupFile;
        if (data.appName !== 'BuddyCare' || !Array.isArray(data.checkIns)) { this.statusMsg.set('Invalid backup file.'); return; }
        this.pendingImport.set(data);
        this.statusMsg.set('');
      } catch { this.statusMsg.set('Could not read file. Make sure it is a valid BuddyCare JSON backup.'); }
    };
    reader.readAsText(file);
  }

  cancelImport(): void { this.pendingImport.set(null); this.statusMsg.set(''); }

  async confirmImport(): Promise<void> {
    const backup = this.pendingImport();
    const family = this.auth.family();
    if (!backup || !family || this.busy()) return;
    this.busy.set(true);
    try {
      const count = await this.checkInRepo.importCheckIns(family.id, backup.checkIns as any);
      this.pendingImport.set(null);
      this.statusMsg.set(`Imported ${count} check-ins successfully.`);
    } catch { this.statusMsg.set('Import failed. Please try again.'); }
    finally  { this.busy.set(false); }
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigate(['/auth/sign-in']);
  }
}
