import { Injectable } from '@angular/core';
import { where, orderBy } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FirestoreRepository } from '@core/firestore/firestore.repository';
import { Child } from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class ChildRepository extends FirestoreRepository<Child> {
  protected override collectionPath(familyId: string): string {
    return `families/${familyId}/children`;
  }

  getChild(familyId: string, childId: string): Promise<Child | null> {
    return this.getById(familyId, childId);
  }

  listChildren(familyId: string): Promise<Child[]> {
    return this.list(familyId, where('isActive', '==', true), orderBy('createdAt', 'asc'));
  }

  watchChildren$(familyId: string): Observable<Child[]> {
    return this.watchList$(familyId, where('isActive', '==', true), orderBy('createdAt', 'asc'));
  }

  async deactivateChild(familyId: string, childId: string): Promise<void> {
    return this.update(familyId, childId, { isActive: false } as any);
  }
}
