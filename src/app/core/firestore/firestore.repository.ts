import { inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  QueryConstraint,
  DocumentReference,
  CollectionReference,
  serverTimestamp,
  Timestamp,
  DocumentData,
  WithFieldValue,
  UpdateData,
  Unsubscribe,
  FirestoreError,
} from 'firebase/firestore';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FIREBASE_FIRESTORE } from '../firebase/firebase.providers';
import { LoggerService } from '../logging/logger.service';

export interface WithId {
  id: string;
}

export interface WithTimestamps {
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

/**
 * Generic typed Firestore repository.
 * Extend this for feature-specific repos to get full typing + offline support.
 */
export abstract class FirestoreRepository<T extends WithId> {
  protected readonly db     = inject(FIREBASE_FIRESTORE) as Firestore;
  protected readonly logger = inject(LoggerService);

  protected abstract collectionPath(familyId: string): string;

  // ─── Single document ops ──────────────────────────────────────────────────

  async getById(familyId: string, id: string): Promise<T | null> {
    try {
      const snap = await getDoc(this.docRef(familyId, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as T;
    } catch (err) {
      this.logger.error(`[${this.constructor.name}] getById failed`, err);
      throw err;
    }
  }

  async save(familyId: string, id: string, data: Record<string, unknown>): Promise<void> {
    try {
      const ref = this.docRef(familyId, id);
      await setDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      this.logger.error(`[${this.constructor.name}] save failed`, err);
      throw err;
    }
  }

  async create(familyId: string, data: Record<string, unknown>): Promise<string> {
    try {
      const ref = await addDoc(this.colRef(familyId), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    } catch (err) {
      this.logger.error(`[${this.constructor.name}] create failed`, err);
      throw err;
    }
  }

  async update(familyId: string, id: string, patch: UpdateData<T>): Promise<void> {
    try {
      await updateDoc(this.docRef(familyId, id), {
        ...patch,
        updatedAt: serverTimestamp(),
      } as any);
    } catch (err) {
      this.logger.error(`[${this.constructor.name}] update failed`, err);
      throw err;
    }
  }

  async delete(familyId: string, id: string): Promise<void> {
    try {
      await deleteDoc(this.docRef(familyId, id));
    } catch (err) {
      this.logger.error(`[${this.constructor.name}] delete failed`, err);
      throw err;
    }
  }

  // ─── Query ────────────────────────────────────────────────────────────────

  async list(familyId: string, ...constraints: QueryConstraint[]): Promise<T[]> {
    try {
      const snap = await getDocs(query(this.colRef(familyId), ...constraints));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as T);
    } catch (err) {
      this.logger.error(`[${this.constructor.name}] list failed`, err);
      throw err;
    }
  }

  // ─── Real-time ────────────────────────────────────────────────────────────

  /**
   * Returns an Observable that emits a document whenever it changes.
   * Uses Firestore's offline cache — works offline with eventual consistency.
   */
  watch$(familyId: string, id: string): Observable<T | null> {
    return new Observable<T | null>(observer => {
      const unsub = onSnapshot(
        this.docRef(familyId, id),
        snap => observer.next(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null),
        err  => observer.error(err),
      );
      return () => unsub();
    });
  }

  /**
   * Returns an Observable that emits the collection whenever it changes.
   */
  watchList$(familyId: string, ...constraints: QueryConstraint[]): Observable<T[]> {
    return new Observable<T[]>(observer => {
      const unsub = onSnapshot(
        query(this.colRef(familyId), ...constraints),
        snap => observer.next(snap.docs.map(d => ({ id: d.id, ...d.data() }) as T)),
        err  => observer.error(err),
      );
      return () => unsub();
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  protected docRef(familyId: string, id: string): DocumentReference<DocumentData> {
    return doc(this.db, this.collectionPath(familyId), id);
  }

  protected colRef(familyId: string): CollectionReference<DocumentData> {
    return collection(this.db, this.collectionPath(familyId));
  }
}
