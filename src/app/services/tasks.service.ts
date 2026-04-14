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

  private subscribed = false;

  start(): void {
    if (this.subscribed) return;
    this.subscribed = true;
    const q = query(this.col, orderBy('createdAt', 'asc'));
    onSnapshot(
      q,
      (snap) => {
        const items: Task[] = snap.docs.map((d) => {
          const data = d.data() as Partial<Task>;
          return {
            id: d.id,
            title: data.title ?? '',
            area: data.area ?? 'disponivel',
            assigneeIds: Array.isArray(data.assigneeIds) ? data.assigneeIds : [],
            createdAt: data.createdAt ?? 0,
            completedAt: data.completedAt ?? null
          };
        });
        this.tasks.set(items);
      },
      (err) => console.error('[Vetor] Erro ao escutar tarefas:', err)
    );
  }

  async add(title: string, area: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) return;
    await addDoc(this.col, {
      title: trimmed,
      area,
      assigneeIds: [],
      createdAt: Date.now(),
      completedAt: null
    });
  }

  async updateTitle(id: string, title: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) return;
    this.patch(id, { title: trimmed });
    await updateDoc(doc(this.col, id), { title: trimmed });
  }

  async updateArea(id: string, area: string): Promise<void> {
    this.patch(id, { area });
    await updateDoc(doc(this.col, id), { area });
  }

  async addAssignee(taskId: string, memberId: string): Promise<boolean> {
    const task = this.tasks().find((t) => t.id === taskId);
    if (!task) return false;
    if (task.assigneeIds.includes(memberId)) return true;
    if (task.assigneeIds.length >= MAX_ASSIGNEES) return false;
    const next = [...task.assigneeIds, memberId];
    this.patch(taskId, { assigneeIds: next });
    await updateDoc(doc(this.col, taskId), { assigneeIds: next });
    return true;
  }

  async removeAssignee(taskId: string, memberId: string): Promise<void> {
    const task = this.tasks().find((t) => t.id === taskId);
    if (!task) return;
    const next = task.assigneeIds.filter((id) => id !== memberId);
    this.patch(taskId, { assigneeIds: next });
    await updateDoc(doc(this.col, taskId), { assigneeIds: next });
  }

  async moveAssignee(fromTaskId: string, toTaskId: string, memberId: string): Promise<boolean> {
    if (fromTaskId === toTaskId) return true;
    const to = this.tasks().find((t) => t.id === toTaskId);
    if (!to) return false;
    if (to.assigneeIds.includes(memberId)) {
      await this.removeAssignee(fromTaskId, memberId);
      return true;
    }
    if (to.assigneeIds.length >= MAX_ASSIGNEES) return false;

    this.tasks.update((list) =>
      list.map((t) => {
        if (t.id === fromTaskId) return { ...t, assigneeIds: t.assigneeIds.filter((id) => id !== memberId) };
        if (t.id === toTaskId) return { ...t, assigneeIds: [...t.assigneeIds, memberId] };
        return t;
      })
    );

    const batch = writeBatch(this.firebase.db);
    const fromDoc = doc(this.col, fromTaskId);
    const toDoc = doc(this.col, toTaskId);
    const from = this.tasks().find((t) => t.id === fromTaskId)!;
    batch.update(fromDoc, { assigneeIds: from.assigneeIds });
    batch.update(toDoc, { assigneeIds: this.tasks().find((t) => t.id === toTaskId)!.assigneeIds });
    await batch.commit();
    return true;
  }

  async complete(id: string): Promise<void> {
    const ts = Date.now();
    this.patch(id, { completedAt: ts });
    await updateDoc(doc(this.col, id), { completedAt: ts });
  }

  async reopen(id: string): Promise<void> {
    this.patch(id, { completedAt: null });
    await updateDoc(doc(this.col, id), { completedAt: null });
  }

  async remove(id: string): Promise<void> {
    this.tasks.update((list) => list.filter((t) => t.id !== id));
    await deleteDoc(doc(this.col, id));
  }

  async purgeAssignee(memberId: string): Promise<void> {
    const affected = this.tasks().filter((t) => t.assigneeIds.includes(memberId));
    if (!affected.length) return;
    const batch = writeBatch(this.firebase.db);
    for (const t of affected) {
      const next = t.assigneeIds.filter((id) => id !== memberId);
      batch.update(doc(this.col, t.id), { assigneeIds: next });
    }
    this.tasks.update((list) =>
      list.map((t) =>
        t.assigneeIds.includes(memberId)
          ? { ...t, assigneeIds: t.assigneeIds.filter((id) => id !== memberId) }
          : t
      )
    );
    await batch.commit();
  }

  private patch(id: string, changes: Partial<Task>): void {
    this.tasks.update((list) =>
      list.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );
  }
}
