import { Injectable } from '@angular/core';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';
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
    // Single equality filter only — avoids composite index requirement.
    // Sorting and filtering are done client-side.
    const all = await this.list(
      familyId,
      where('childId', '==', childId),
      limit(200),
    );
    return all
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
}
