import {
  Injectable,
  inject,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '../firebase/firebase.providers';
import { AuthState, AuthStatus, Child, Family, Parent } from '../models/user.model';
import { Subject } from 'rxjs';
import { LoggerService } from '../logging/logger.service';

/** Lightweight user→family lookup stored at users/{uid} */
interface UserRecord {
  familyId: string;
  role: 'admin' | 'member';
}

/** Per-user localStorage key — keyed by uid to survive sign-out and support multiple accounts on the same device */
const lsFamilyKey = (uid: string) => `bc_family_id_${uid}`;
/** Legacy key — kept only for one-time migration */
const LS_FAMILY_KEY_LEGACY = 'bc_family_id';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private readonly auth      = inject(FIREBASE_AUTH) as Auth;
  private readonly db        = inject(FIREBASE_FIRESTORE) as Firestore;
  private readonly logger    = inject(LoggerService);

  // ─── Private writable signals ───────────────────────────────────────────────
  private readonly _status      = signal<AuthStatus>('loading');
  private readonly _parent      = signal<Parent | null>(null);
  private readonly _family      = signal<Family | null>(null);
  private readonly _activeChild = signal<Child | null>(null);
  private readonly _children    = signal<Child[]>([]);

  // ─── Public readonly signals ────────────────────────────────────────────────
  readonly status      = this._status.asReadonly();
  readonly parent      = this._parent.asReadonly();
  readonly family      = this._family.asReadonly();
  readonly activeChild = this._activeChild.asReadonly();
  readonly children    = this._children.asReadonly();

  readonly isAuthenticated = computed(() => this._status() === 'authenticated');
  readonly isLoading       = computed(() => this._status() === 'loading');
  readonly hasFamily       = computed(() => this._family() !== null);
  readonly hasChildren     = computed(() => this._children().length > 0);

  readonly authState = computed<AuthState>(() => ({
    status:      this._status(),
    parent:      this._parent(),
    family:      this._family(),
    activeChild: this._activeChild(),
    children:    this._children(),
  }));

  private unsubscribeAuth?: () => void;
  private unsubscribeChildren?: Unsubscribe;

  /** Emits once after every loadParentProfile() call completes (success or error). */
  private readonly _profileDone$ = new Subject<void>();
  readonly profileDone$ = this._profileDone$.asObservable();

  constructor() {
    this.unsubscribeAuth = onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this._status.set('loading');  // profile fetch in progress
        this.loadParentProfile(user);
      } else {
        this._status.set('unauthenticated');
        this._parent.set(null);
        this._family.set(null);
        this._activeChild.set(null);
        this._children.set([]);
        this.unsubscribeChildren?.();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAuth?.();
    this.unsubscribeChildren?.();
  }

  // ─── Sign-in / Sign-up ──────────────────────────────────────────────────────

  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (err) {
      this.logger.error('[AuthService] signInWithEmail error', err);
      throw err;
    }
  }

  async signUpWithEmail(
    email: string,
    password: string,
    displayName: string,
  ): Promise<UserCredential> {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(cred.user, { displayName });
      return cred;
    } catch (err) {
      this.logger.error('[AuthService] signUpWithEmail error', err);
      throw err;
    }
  }

  async signInWithGoogle(): Promise<UserCredential> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      return await signInWithPopup(this.auth, provider);
    } catch (err) {
      this.logger.error('[AuthService] signInWithGoogle error', err);
      throw err;
    }
  }

  async signInWithApple(): Promise<UserCredential> {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      return await signInWithPopup(this.auth, provider);
    } catch (err) {
      this.logger.error('[AuthService] signInWithApple error', err);
      throw err;
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  async signOut(): Promise<void> {
    // Do NOT clear the uid-keyed familyId — it must survive sign-out so the
    // same user can sign back in without losing their data.
    await signOut(this.auth);
  }

  // ─── Family / Child management ──────────────────────────────────────────────

  async createFamily(familyName: string, parentDisplayName: string): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const familyId = doc(collection(this.db, 'families')).id;

    const family: Omit<Family, 'id'> = {
      name:      familyName,
      locale:    'en',
      timezone:  Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };

    const parent: Omit<Parent, 'uid'> = {
      familyId,
      displayName: parentDisplayName || user.displayName || 'Parent',
      email:       user.email ?? '',
      photoURL:    user.photoURL ?? '',
      role:        'admin',
      createdAt:   serverTimestamp() as any,
      lastLoginAt: serverTimestamp() as any,
    };

    await setDoc(doc(this.db, 'families', familyId), family);
    await setDoc(doc(this.db, `families/${familyId}/parents`, user.uid), parent);

    // Cache familyId in localStorage keyed by uid
    localStorage.setItem(lsFamilyKey(user.uid), familyId);
    // Remove legacy unkeyed entry if present
    localStorage.removeItem(LS_FAMILY_KEY_LEGACY);

    // Best-effort: write users/{uid} lookup doc (may fail if rules not yet deployed)
    try {
      await setDoc(doc(this.db, 'users', user.uid), {
        familyId,
        role:      'admin',
        createdAt: serverTimestamp(),
      } satisfies UserRecord & Record<string, unknown>);
    } catch {
      this.logger.warn('[AuthService] users lookup write skipped — rules not deployed yet');
    }

    this._family.set({ id: familyId, ...family } as Family);
    this._parent.set({ uid: user.uid, ...parent } as Parent);

    this.logger.info('[AuthService] Family created', familyId);
    return familyId;
  }

  async addChild(
    familyId: string,
    name: string,
    avatarId: number,
    dateOfBirth?: string,
  ): Promise<string> {
    const childId = doc(collection(this.db, 'tmp')).id;
    const pastelColors = ['#EDE7FF', '#FFE4EF', '#E0F7FA', '#FFF3E0', '#E8F5E9'];
    const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];

    const child = {
      familyId,
      name,
      avatarId,
      color,
      dateOfBirth: dateOfBirth ?? null,
      isActive:    true,
      createdAt:   serverTimestamp(),
      updatedAt:   serverTimestamp(),
    };

    await setDoc(doc(this.db, `families/${familyId}/children`, childId), child);

    const newChild: Child = { id: childId, ...child } as any;
    this._children.update(c => [...c, newChild]);

    if (!this._activeChild()) {
      this._activeChild.set(newChild);
    }

    this.logger.info('[AuthService] Child added', childId);
    return childId;
  }

  async updateChild(
    familyId: string,
    childId: string,
    updates: { name?: string; avatarId?: number },
  ): Promise<void> {
    await updateDoc(doc(this.db, `families/${familyId}/children`, childId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    this._children.update(list =>
      list.map(c => c.id === childId ? { ...c, ...updates } : c),
    );
    if (this._activeChild()?.id === childId) {
      this._activeChild.update(c => c ? { ...c, ...updates } : c);
    }
    this.logger.info('[AuthService] Child updated', childId);
  }

  async removeChild(familyId: string, childId: string): Promise<void> {
    await updateDoc(doc(this.db, `families/${familyId}/children`, childId), {
      isActive:  false,
      updatedAt: serverTimestamp(),
    });
    this._children.update(list => list.filter(c => c.id !== childId));
    if (this._activeChild()?.id === childId) {
      const remaining = this._children();
      this._activeChild.set(remaining[0] ?? null);
    }
    this.logger.info('[AuthService] Child removed', childId);
  }

  setActiveChild(child: Child): void {
    this._activeChild.set(child);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async loadParentProfile(user: FirebaseUser): Promise<void> {
    try {
      // Step 1: Try uid-keyed localStorage cache first (fast, no Firestore read).
      // Also migrate the legacy unkeyed entry if present.
      let familyId = localStorage.getItem(lsFamilyKey(user.uid));
      if (!familyId) {
        const legacy = localStorage.getItem(LS_FAMILY_KEY_LEGACY);
        if (legacy) {
          familyId = legacy;
          localStorage.setItem(lsFamilyKey(user.uid), legacy);
          localStorage.removeItem(LS_FAMILY_KEY_LEGACY);
        }
      }

      // Step 2: If not in localStorage, try the users/{uid} Firestore lookup
      if (!familyId) {
        try {
          const userSnap = await getDoc(doc(this.db, 'users', user.uid));
          if (userSnap.exists()) {
            familyId = (userSnap.data() as UserRecord).familyId;
            // Back-fill uid-keyed localStorage cache
            if (familyId) localStorage.setItem(lsFamilyKey(user.uid), familyId);
          }
        } catch {
          // users/{uid} read failed (rules not deployed) — treat as new user
          this.logger.warn('[AuthService] users lookup unavailable — checking onboarding state');
        }
      }

      if (!familyId) {
        // No family found — user needs onboarding
        this.logger.info('[AuthService] No family record — needs onboarding');
        this._status.set('authenticated');
        return;
      }

      // Step 3: Read family + parent docs in parallel
      const [familySnap, parentSnap] = await Promise.all([
        getDoc(doc(this.db, 'families', familyId)),
        getDoc(doc(this.db, `families/${familyId}/parents`, user.uid)),
      ]);

      if (familySnap.exists()) {
        this._family.set({ id: familySnap.id, ...familySnap.data() } as Family);
      }
      if (parentSnap.exists()) {
        this._parent.set({ uid: user.uid, ...parentSnap.data() } as Parent);
      }

      // Step 4: Load children synchronously so hasChildren() is correct before
      // status is set — avoids the race with onboardingGuard.
      await this.loadChildrenOnce(familyId);
      // Then subscribe for real-time updates
      this.subscribeToChildren(familyId);
      this.logger.info('[AuthService] Profile loaded for family', familyId);
    } catch (err) {
      this.logger.error('[AuthService] loadParentProfile error', err);
    } finally {
      this._status.set('authenticated');
      this._profileDone$.next();
    }
  }

  private async loadChildrenOnce(familyId: string): Promise<void> {
    try {
      // Use getDocsFromServer to bypass IndexedDB cache and get fresh data —
      // prevents stale children list on Android after sign-in.
      const snap = await getDocsFromServer(query(
        collection(this.db, `families/${familyId}/children`),
        where('isActive', '==', true),
      ));
      const children = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Child);
      this._children.set(children);
      if (!this._activeChild() && children.length > 0) {
        this._activeChild.set(children[0]);
      }
    } catch (err) {
      this.logger.warn('[AuthService] loadChildrenOnce error', err);
    }
  }

  private subscribeToChildren(familyId: string): void {
    this.unsubscribeChildren?.();
    this.unsubscribeChildren = onSnapshot(
      query(
        collection(this.db, `families/${familyId}/children`),
        where('isActive', '==', true),
      ),
      (snap) => {
        const children = snap.docs.map(
          d => ({ id: d.id, ...d.data() }) as Child,
        );
        this._children.set(children);
        // Auto-select first child if none selected
        if (!this._activeChild() && children.length > 0) {
          this._activeChild.set(children[0]);
        }
      },
      (err) => this.logger.error('[AuthService] children subscription error', err),
    );
  }
}
