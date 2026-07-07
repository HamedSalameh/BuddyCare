import {
  Injectable,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FIREBASE_FIRESTORE } from '@core/firebase/firebase.providers';
import { PendingOpQueueService, PendingOp } from './pending-op-queue.service';
import { LoggerService } from '@core/logging/logger.service';

const MAX_ATTEMPTS  = 3;
const RETRY_DELAY_MS = 2000;

@Injectable({ providedIn: 'root' })
export class NetworkStatusService implements OnDestroy {
  private readonly db    = inject(FIREBASE_FIRESTORE) as Firestore;
  private readonly queue = inject(PendingOpQueueService);
  private readonly logger = inject(LoggerService);

  private readonly _isOnline   = signal(navigator.onLine);
  private readonly _isSyncing  = signal(false);
  private readonly _pendingCount = signal(0);

  readonly isOnline    = this._isOnline.asReadonly();
  readonly isSyncing   = this._isSyncing.asReadonly();
  readonly pendingCount = this._pendingCount.asReadonly();
  readonly showOfflineBanner = computed(() => !this._isOnline());

  private sub?: Subscription;

  constructor() {
    this.sub = merge(
      fromEvent(window, 'online'),
      fromEvent(window, 'offline'),
    )
      .pipe(debounceTime(300))
      .subscribe(() => {
        const online = navigator.onLine;
        this._isOnline.set(online);
        this.logger.info('[Network]', online ? 'online' : 'offline');
        if (online) {
          this.syncPendingOps();
        }
      });

    // Refresh count on startup
    this.refreshPendingCount();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ─── Sync ─────────────────────────────────────────────────────────────────

  async syncPendingOps(): Promise<void> {
    if (this._isSyncing()) return;
    const pending = await this.queue.getPending();
    if (!pending.length) return;

    this._isSyncing.set(true);
    this.logger.info(`[Network] Syncing ${pending.length} pending ops`);

    for (const op of pending) {
      if (!navigator.onLine) break;  // abort if we went offline mid-sync
      await this.replayOp(op);
    }

    this._isSyncing.set(false);
    await this.refreshPendingCount();
  }

  async refreshPendingCount(): Promise<void> {
    const count = await this.queue.getPendingCount();
    this._pendingCount.set(count);
  }

  // ─── Private replay ───────────────────────────────────────────────────────

  private async replayOp(op: PendingOp): Promise<void> {
    if (op.attempts >= MAX_ATTEMPTS) {
      await this.queue.markFailed(op.id);
      this.logger.warn('[Network] Op exceeded max attempts, marking failed', op.id);
      return;
    }

    try {
      await this.executeOp(op);
      await this.queue.dequeue(op.id);
      this.logger.debug('[Network] Op synced successfully', op.id);
    } catch (err) {
      await this.queue.incrementAttempt(op.id);
      this.logger.warn('[Network] Op failed, will retry', op.id, err);
      // Exponential back-off: wait longer after each failure
      await delay(RETRY_DELAY_MS * Math.pow(2, op.attempts));
    }
  }

  private async executeOp(op: PendingOp): Promise<void> {
    const ref = doc(this.db, op.collection, op.docId);
    switch (op.type) {
      case 'create':
      case 'update':
        await setDoc(ref, {
          ...(op.data as object),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        break;
      case 'delete':
        await deleteDoc(ref);
        break;
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
