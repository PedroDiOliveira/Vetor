import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgIconComponent } from '@ng-icons/core';
import { COLUMNS } from '../../config/columns';
import { Task } from '../../models/task.model';
import { Member } from '../../models/member.model';
import { MembersService } from '../../services/members.service';
import { TasksService } from '../../services/tasks.service';
import { AuthService } from '../../services/auth.service';
import { ColumnComponent } from '../column/column.component';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { MemberPoolComponent, POOL_DROP_ID } from '../member-pool/member-pool.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AddTaskModalComponent } from '../add-task-modal/add-task-modal.component';
import { AddMemberModalComponent } from '../add-member-modal/add-member-modal.component';
import { AssigneeDragData } from '../task-card/task-card.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NgIconComponent, RouterLink, ColumnComponent, TaskModalComponent, MemberPoolComponent, DashboardComponent, AddTaskModalComponent, AddMemberModalComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent implements OnInit {
  private readonly membersService = inject(MembersService);
  private readonly tasksService = inject(TasksService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly columns = COLUMNS;
  readonly areaIds = COLUMNS.map((c) => `area-${c.id}`);
  readonly members = this.membersService.members;
  readonly tasks = this.tasksService.tasks;

  readonly taskIds = computed(() =>
    this.tasksService.active().map((t) => `task-${t.id}`)
  );
  readonly poolAndTaskIds = computed(() => [POOL_DROP_ID, ...this.taskIds()]);

  readonly grouped = computed(() => {
    const groups: Record<string, Task[]> = {};
    for (const c of COLUMNS) groups[c.id] = [];
    for (const t of this.tasksService.active()) {
      const area = groups[t.area] ? t.area : 'disponivel';
      groups[area].push(t);
    }
    return groups;
  });

  readonly selectedTask = signal<Task | null>(null);
  readonly showAddTask = signal(false);
  readonly showAddMember = signal(false);
  readonly firestoreError = this.tasksService.firestoreError;

  ngOnInit(): void {
    this.membersService.start();
    this.tasksService.start();
  }

  tasksOf(areaId: string): Task[] {
    return this.grouped()[areaId] ?? [];
  }

  // ── Task drag entre áreas ─────────────────────────────────────────
  onTaskDropped(targetAreaId: string, event: CdkDragDrop<Task[]>): void {
    const task = event.item.data as Task;
    if (!task || task.area === targetAreaId) return;
    this.tasksService.updateArea(task.id, targetAreaId);
  }

  // ── Assignee drag (pool ↔ task ↔ task) ───────────────────────────
  onAssigneeDropped(targetTaskId: string | null, event: CdkDragDrop<unknown>): void {
    const data = event.item.data as AssigneeDragData;
    if (!data || data.kind !== 'member') return;

    const { memberId, fromTaskId } = data;

    if (!targetTaskId) {
      // Drop no pool → remove da tarefa de origem
      if (fromTaskId) this.tasksService.removeAssignee(fromTaskId, memberId);
      return;
    }

    if (fromTaskId === targetTaskId) return;

    if (fromTaskId) {
      this.tasksService.moveAssignee(fromTaskId, targetTaskId, memberId);
    } else {
      this.tasksService.addAssignee(targetTaskId, memberId);
    }
  }

  // ── Modal ─────────────────────────────────────────────────────────
  openTask(task: Task): void { this.selectedTask.set(task); }
  closeModal(): void { this.selectedTask.set(null); }

  saveTask(update: { title: string; area: string }): void {
    const t = this.selectedTask();
    if (!t) return;
    if (update.title && update.title !== t.title) {
      this.tasksService.updateTitle(t.id, update.title);
    }
    if (update.area !== t.area) {
      this.tasksService.updateArea(t.id, update.area);
    }
    this.selectedTask.set(null);
  }

  toggleAssignee(memberId: string): void {
    const t = this.selectedTask();
    if (!t) return;
    if (t.assigneeIds.includes(memberId)) {
      this.tasksService.removeAssignee(t.id, memberId);
    } else {
      this.tasksService.addAssignee(t.id, memberId);
    }
    // Atualiza o sinal local para refletir mudança no modal
    const updated = this.tasks().find((tk) => tk.id === t.id);
    if (updated) this.selectedTask.set(updated);
  }

  completeTask(id: string): void {
    this.tasksService.complete(id);
    this.selectedTask.set(null);
  }

  reopenTask(id: string): void {
    this.tasksService.reopen(id);
    this.selectedTask.set(null);
  }

  removeTask(id: string): void {
    this.tasksService.remove(id);
    this.selectedTask.set(null);
  }

  // ── Header actions ────────────────────────────────────────────────
  addTask(): void { this.showAddTask.set(true); }
  addMember(): void { this.showAddMember.set(true); }

  confirmAddTask(data: { title: string; area: string }): void {
    this.tasksService.add(data.title, data.area);
    this.showAddTask.set(false);
  }

  confirmAddMember(name: string): void {
    this.membersService.add(name);
    this.showAddMember.set(false);
  }

  async removeMember(member: Member): Promise<void> {
    await this.tasksService.purgeAssignee(member.id);
    await this.membersService.remove(member.id);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
