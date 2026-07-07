import { Injectable, OnDestroy, inject } from '@angular/core';
import { LoggerService } from '@core/logging/logger.service';

export type PendingOpType = 'create' | 'update' | 'delete';
export type PendingOpStatus = 'pending' | 'processing' | 'failed';

export interface PendingOp {
  id: string;             // client-generated UUID
  type:       PendingOpType;
  collection: string;     // Firestore collection path
  docId:      string;     // document id
  data?:      unknown;    // payload for create/update
  attempts:   number;
  status:     PendingOpStatus;
  createdAt:  number;     // Date.now()
  lastAttempt?: number;
}

const DB_NAME    = 'buddycare-offline';
const STORE_NAME = 'pending-ops';
const DB_VERSION = 1;

/**
 * IndexedDB-backed queue for offline write operations.
 * Operations are queued when the device is offline and replayed on reconnect.
 */
@Injectable({ providedIn: 'root' })
export class PendingOpQueueService implements OnDestroy {
  private readonly logger = inject(LoggerService);
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase>;

  constructor() {
    this.initPromise = this.openDb();
  }

  ngOnDestroy(): void {
    this.db?.close();
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  async enqueue(op: Omit<PendingOp, 'id' | 'attempts' | 'status' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const full: PendingOp = {
      ...op,
      id,
      attempts:  0,
      status:    'pending',
      createdAt: Date.now(),
    };
    await this.put(full);
    this.logger.debug('[Queue] Enqueued', id, op.collection, op.type);
    return id;
  }

  async dequeue(id: string): Promise<void> {
    await this.delete(id);
    this.logger.debug('[Queue] Dequeued', id);
  }

  async getPending(): Promise<PendingOp[]> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.index('by-status').getAll(IDBKeyRange.only('pending'));
      req.onsuccess = () => resolve(
        (req.result as PendingOp[]).sort((a, b) => a.createdAt - b.createdAt),
      );
      req.onerror = () => reject(req.error);
    });
  }

  async markFailed(id: string): Promise<void> {
    const db = await this.initPromise;
    const existing = await this.getOne(id);
    if (!existing) return;
    await this.put({
      ...existing,
      status:      'failed',
      attempts:    existing.attempts + 1,
      lastAttempt: Date.now(),
    });
  }

  async incrementAttempt(id: string): Promise<void> {
    const db = await this.initPromise;
    const existing = await this.getOne(id);
    if (!existing) return;
    await this.put({
      ...existing,
      attempts:    existing.attempts + 1,
      lastAttempt: Date.now(),
    });
  }

  async getPendingCount(): Promise<number> {
    const pending = await this.getPending();
    return pending.length;
  }

  async clearAll(): Promise<void> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.clear();
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db    = (e.target as IDBOpenDBRequest).result;
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-status', 'status', { unique: false });
        store.createIndex('by-collection', 'collection', { unique: false });
      };

      req.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      req.onerror = (e) => {
        this.logger.error('[Queue] Failed to open IndexedDB', (e.target as IDBOpenDBRequest).error);
        reject((e.target as IDBOpenDBRequest).error);
      };
    });
  }

  private async put(op: PendingOp): Promise<void> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.put(op);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  }

  private async delete(id: string): Promise<void> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  }

  private async getOne(id: string): Promise<PendingOp | undefined> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.get(id);
      req.onsuccess = () => resolve(req.result as PendingOp | undefined);
      req.onerror   = () => reject(req.error);
    });
  }
}
