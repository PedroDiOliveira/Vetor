import { Injectable, inject, signal } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { Member } from '../models/member.model';
import { DEFAULT_COLUMN } from '../config/columns';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly firebase = inject(FirebaseService);
  private readonly col = collection(this.firebase.db, 'members');

  readonly members = signal<Member[]>([]);
  readonly loading = signal(true);
  private subscribed = false;

  start(): void {
    if (this.subscribed) return;
    this.subscribed = true;
    const q = query(this.col, orderBy('createdAt', 'asc'));
    onSnapshot(
      q,
      (snap) => {
        const items: Member[] = snap.docs.map((d) => {
          const data = d.data() as Omit<Member, 'id'>;
          return { id: d.id, ...data };
        });
        this.members.set(items);
        this.loading.set(false);
      },
      (err) => {
        console.error('[Vetor] Erro ao escutar membros:', err);
        this.loading.set(false);
      }
    );
  }

  async add(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) return;
    await addDoc(this.col, {
      name: trimmed,
      column: DEFAULT_COLUMN,
      description: '',
      avatar: trimmed.charAt(0).toUpperCase(),
      createdAt: Date.now()
    });
  }

  async updateColumn(id: string, column: string): Promise<void> {
    this.optimistic(id, { column });
    await updateDoc(doc(this.col, id), { column });
  }

  async updateDescription(id: string, description: string): Promise<void> {
    this.optimistic(id, { description });
    await updateDoc(doc(this.col, id), { description });
  }

  async remove(id: string): Promise<void> {
    this.members.update((list) => list.filter((m) => m.id !== id));
    await deleteDoc(doc(this.col, id));
  }

  private optimistic(id: string, patch: Partial<Member>): void {
    this.members.update((list) =>
      list.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }
}
