import { Injectable, inject, signal } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { Member } from '../models/member.model';

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
          const data = d.data() as Partial<Member>;
          return {
            id: d.id,
            name: data.name ?? '',
            avatar: data.avatar ?? '?',
            createdAt: data.createdAt ?? 0
          };
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
      avatar: trimmed.charAt(0).toUpperCase(),
      createdAt: Date.now()
    });
  }

  async remove(id: string): Promise<void> {
    this.members.update((list) => list.filter((m) => m.id !== id));
    await deleteDoc(doc(this.col, id));
  }

  byId(id: string): Member | undefined {
    return this.members().find((m) => m.id === id);
  }
}
