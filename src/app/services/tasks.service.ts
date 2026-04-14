import { Injectable, computed, inject, signal } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { MAX_ASSIGNEES, Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly firebase = inject(FirebaseService);
  private readonly col = collection(this.firebase.db, 'tasks');

  readonly tasks = signal<Task[]>([]);
  readonly active = computed(() => this.tasks().filter((t) => !t.completedAt));
  readonly done = computed(() => this.tasks().filter((t) => !!t.completedAt));
  readonly firestoreError = signal<string | null>(null);

  private subscribed = false;

  start(): void {
    if (this.subscribed) return;
    this.subscribed = true;
    const q = query(this.col, orderBy('createdAt', 'asc'));
    onSnapshot(
      q,
      (snap) => {
        this.firestoreError.set(null);
        const items: Task[] = snap.docs.map((d) => {
          const data = d.data() as Partial<Task>;
          return {
            id: d.id,
            title: data.title ?? '',
            area: data.area ?? 'desenvolvimento',
            assigneeIds: Array.isArray(data.assigneeIds) ? data.assigneeIds : [],
            createdAt: data.createdAt ?? 0,
            completedAt: data.completedAt ?? null
          };
        });
        this.tasks.set(items);
      },
      (err) => {
        console.error('[Vetor] Firestore erro:', err);
        this.firestoreError.set(err.message ?? 'Erro ao conectar ao Firestore.');
      }
    );
  }

  async add(title: string, area: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      await addDoc(this.col, {
        title: trimmed,
        area,
        assigneeIds: [],
        createdAt: Date.now(),
        completedAt: null
      });
    } catch (err: unknown) {
      this.handleWriteError('add task', err);
    }
  }

  async updateTitle(id: string, title: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) return;
    this.patch(id, { title: trimmed });
    try {
      await updateDoc(doc(this.col, id), { title: trimmed });
    } catch (err: unknown) {
      this.handleWriteError('updateTitle', err);
    }
  }

  async updateArea(id: string, area: string): Promise<void> {
    this.patch(id, { area });
    try {
      await updateDoc(doc(this.col, id), { area });
    } catch (err: unknown) {
      this.handleWriteError('updateArea', err);
    }
  }

  async addAssignee(taskId: string, memberId: string): Promise<boolean> {
    const task = this.tasks().find((t) => t.id === taskId);
    if (!task) return false;
    if (task.assigneeIds.includes(memberId)) return true;
    if (task.assigneeIds.length >= MAX_ASSIGNEES) return false;
    const next = [...task.assigneeIds, memberId];
    this.patch(taskId, { assigneeIds: next });
    try {
      await updateDoc(doc(this.col, taskId), { assigneeIds: next });
    } catch (err: unknown) {
      this.handleWriteError('addAssignee', err);
    }
    return true;
  }

  async removeAssignee(taskId: string, memberId: string): Promise<void> {
    const task = this.tasks().find((t) => t.id === taskId);
    if (!task) return;
    const next = task.assigneeIds.filter((id) => id !== memberId);
    this.patch(taskId, { assigneeIds: next });
    try {
      await updateDoc(doc(this.col, taskId), { assigneeIds: next });
    } catch (err: unknown) {
      this.handleWriteError('removeAssignee', err);
    }
  }

  async complete(id: string): Promise<void> {
    const ts = Date.now();
    this.patch(id, { completedAt: ts });
    try {
      await updateDoc(doc(this.col, id), { completedAt: ts });
    } catch (err: unknown) {
      this.handleWriteError('complete', err);
    }
  }

  async reopen(id: string): Promise<void> {
    this.patch(id, { completedAt: null });
    try {
      await updateDoc(doc(this.col, id), { completedAt: null });
    } catch (err: unknown) {
      this.handleWriteError('reopen', err);
    }
  }

  async remove(id: string): Promise<void> {
    this.tasks.update((list) => list.filter((t) => t.id !== id));
    try {
      await deleteDoc(doc(this.col, id));
    } catch (err: unknown) {
      this.handleWriteError('remove', err);
    }
  }

  async purgeAssignee(memberId: string): Promise<void> {
    const affected = this.tasks().filter((t) => t.assigneeIds.includes(memberId));
    if (!affected.length) return;
    this.tasks.update((list) =>
      list.map((t) =>
        t.assigneeIds.includes(memberId)
          ? { ...t, assigneeIds: t.assigneeIds.filter((id) => id !== memberId) }
          : t
      )
    );
    try {
      const batch = writeBatch(this.firebase.db);
      for (const t of affected) {
        const next = t.assigneeIds.filter((id) => id !== memberId);
        batch.update(doc(this.col, t.id), { assigneeIds: next });
      }
      await batch.commit();
    } catch (err: unknown) {
      this.handleWriteError('purgeAssignee', err);
    }
  }

  private patch(id: string, changes: Partial<Task>): void {
    this.tasks.update((list) =>
      list.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );
  }

  private handleWriteError(op: string, err: unknown): void {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Vetor] Firestore erro em ${op}:`, msg);
    this.firestoreError.set(`Erro ao salvar (${op}): ${msg}`);
  }
}
