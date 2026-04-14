import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { Task, MAX_ASSIGNEES } from '../../models/task.model';
import { Member } from '../../models/member.model';
import { COLUMNS, getColumn } from '../../config/columns';
import { MembersService } from '../../services/members.service';
import { AssigneeChipComponent } from '../assignee-chip/assignee-chip.component';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [FormsModule, NgIconComponent, AssigneeChipComponent],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModalComponent {
  private readonly membersService = inject(MembersService);

  readonly task = input.required<Task>();

  readonly close = output<void>();
  readonly save = output<{ title: string; area: string }>();
  readonly complete = output<string>();
  readonly reopen = output<string>();
  readonly remove = output<string>();
  readonly toggleAssignee = output<string>();

  readonly title = signal('');
  readonly area = signal<string>('disponivel');

  readonly columns = COLUMNS;
  readonly maxAssignees = MAX_ASSIGNEES;

  readonly areaMeta = computed(() => getColumn(this.area()));
  readonly members = this.membersService.members;

  readonly assignees = computed<Member[]>(() => {
    const all = this.members();
    return this.task()
      .assigneeIds.map((id) => all.find((m) => m.id === id))
      .filter((m): m is Member => !!m);
  });

  readonly availableMembers = computed<Member[]>(() => {
    const picked = new Set(this.task().assigneeIds);
    return this.members().filter((m) => !picked.has(m.id));
  });

  readonly isDone = computed(() => !!this.task().completedAt);
  readonly canAddMore = computed(() => this.task().assigneeIds.length < MAX_ASSIGNEES);

  constructor() {
    effect(() => {
      const t = this.task();
      this.title.set(t.title);
      this.area.set(t.area);
    }, { allowSignalWrites: true });
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }

  onSave(): void {
    this.save.emit({ title: this.title().trim(), area: this.area() });
  }

  onComplete(): void {
    this.complete.emit(this.task().id);
  }

  onReopen(): void {
    this.reopen.emit(this.task().id);
  }

  onRemove(): void {
    if (confirm(`Remover a tarefa "${this.task().title}"?`)) {
      this.remove.emit(this.task().id);
    }
  }

  onToggleAssignee(memberId: string): void {
    this.toggleAssignee.emit(memberId);
  }
}
