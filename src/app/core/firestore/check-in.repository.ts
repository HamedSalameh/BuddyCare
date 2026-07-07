import { Injectable } from '@angular/core';
import { where, orderBy, limit, query, doc, writeBatch, getDocsFromServer, Timestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FirestoreRepository } from '@core/firestore/firestore.repository';
import { CheckIn } from '@core/models/check-in.model';

@Injectable({ providedIn: 'root' })
export class CheckInRepository extends FirestoreRepository<CheckIn> {
  protected override collectionPath(familyId: string): string {
    // childId is embedded in the CheckIn itself; path is shared per family
    return `families/${familyId}/checkIns`;
  }

  getCheckIn(familyId: string, checkInId: string): Promise<CheckIn | null> {
    return this.getById(familyId, checkInId);
  }

  saveCheckIn(checkIn: CheckIn): Promise<void> {
    const { id, familyId, ...data } = checkIn;
    return this.save(familyId, id, data as any);
  }

  createCheckIn(checkIn: Omit<CheckIn, 'id'>): Promise<string> {
    return this.create(checkIn.familyId, checkIn as any);
  }

  async listForChild(
    familyId: string,
    childId: string,
    limitCount = 50,
  ): Promise<CheckIn[]> {
    // getDocsFromServer bypasses IndexedDB cache — prevents stale data on Android.
    // Single equality filter only to avoid composite index requirement.
    const q = query(
      this.colRef(familyId),
      where('childId', '==', childId),
      limit(200),
    );
    const snap = await getDocsFromServer(q);
    return snap.docs
      .map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) }) as unknown as CheckIn)
      .filter(c => c.syncState !== 'failed')
      .sort((a, b) => {
        const ta = a.timestamp?.seconds ?? a.timestamp?.toMillis?.() ?? 0;
        const tb = b.timestamp?.seconds ?? b.timestamp?.toMillis?.() ?? 0;
        return tb - ta;
      })
      .slice(0, limitCount);
  }

  listForDateRange(
    familyId: string,
    childId: string,
    from: Date,
    to: Date,
  ): Promise<CheckIn[]> {
    return this.list(
      familyId,
      where('childId', '==', childId),
      where('timestamp', '>=', Timestamp.fromDate(from)),
      where('timestamp', '<=', Timestamp.fromDate(to)),
      orderBy('timestamp', 'desc'),
    );
  }

  watchChildCheckIns$(familyId: string, childId: string, limitCount = 20): Observable<CheckIn[]> {
    return this.watchList$(
      familyId,
      where('childId', '==', childId),
      orderBy('timestamp', 'desc'),
      limit(limitCount),
    );
  }

  /**
   * Mark a pending check-in as synced after background sync completes.
   */
  markSynced(familyId: string, checkInId: string): Promise<void> {
    return this.update(familyId, checkInId, { syncState: 'synced' } as any);
  }

  /** Fetch ALL check-ins for a family (all children) — used for full backup. */
  async listAllForFamily(familyId: string): Promise<CheckIn[]> {
    const snap = await getDocsFromServer(this.colRef(familyId));
    return snap.docs
      .map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) }) as unknown as CheckIn)
      .sort((a, b) => (a.timestamp?.seconds ?? 0) - (b.timestamp?.seconds ?? 0));
  }

  /**
   * Batch-write check-ins using their original IDs (setDoc).
   * Idempotent: re-importing the same backup won't create duplicates.
   */
  async importCheckIns(familyId: string, checkIns: CheckIn[]): Promise<number> {
    for (let i = 0; i < checkIns.length; i += 500) {
      const batch = writeBatch(this.db);
      checkIns.slice(i, i + 500).forEach(ci => {
        const { id, ...data } = ci;
        batch.set(doc(this.colRef(familyId), id), { ...data, familyId });
      });
      await batch.commit();
    }
    return checkIns.length;
  }

  /** Delete every check-in for a child. Returns the number of deleted docs. */
  async deleteAllForChild(familyId: string, childId: string): Promise<number> {
    const q = query(this.colRef(familyId), where('childId', '==', childId));
    const snap = await getDocsFromServer(q);
    const docs = snap.docs;
    // Firestore batch limit is 500 writes
    for (let i = 0; i < docs.length; i += 500) {
      const batch = writeBatch(this.db);
      docs.slice(i, i + 500).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    return docs.length;
  }

  /** Fetch all check-ins for export (sorted oldest→newest). */
  async listAllForExport(familyId: string, childId: string): Promise<CheckIn[]> {
    const q = query(this.colRef(familyId), where('childId', '==', childId));
    const snap = await getDocsFromServer(q);
    return snap.docs
      .map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) }) as unknown as CheckIn)
      .sort((a, b) => (a.timestamp?.seconds ?? 0) - (b.timestamp?.seconds ?? 0));
  }
}
