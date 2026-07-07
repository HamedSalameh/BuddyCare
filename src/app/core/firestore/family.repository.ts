import { Injectable } from '@angular/core';
import { where, orderBy, limit, QueryConstraint } from 'firebase/firestore';
import { FirestoreRepository } from '@core/firestore/firestore.repository';
import { Family } from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class FamilyRepository extends FirestoreRepository<Family> {
  protected override collectionPath(_familyId: string): string {
    return 'families';
  }

  // Family doc is at families/{familyId} directly
  getFamily(familyId: string): Promise<Family | null> {
    return this.getById(familyId, familyId);
  }

  saveFamily(family: Family): Promise<void> {
    const { id, ...data } = family;
    return this.save(familyId(id), id, data as any);
  }
}

// Helper to normalise call sites
function familyId(id: string) { return id; }
