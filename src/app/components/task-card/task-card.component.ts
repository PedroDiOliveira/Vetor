import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { NgIconComponent } from '@ng-icons/core';
import { Task } from '../../models/task.model';
import { Member } from '../../models/member.model';
import { MembersService } from '../../services/members.service';
import { AssigneeChipComponent } from '../assignee-chip/assignee-chip.component';

export interface AssigneeDragData {
  kind: 'member';
  memberId: string;
  fromTaskId: string | null; // null = vinha do pool
}

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CdkDropList, CdkDrag, NgIconComponent, AssigneeChipComponent],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--accent]': 'accentColor()'
  }
})
export class TaskCardComponent {
  private readonly membersService = inject(MembersService);

  readonly task = input.required<Task>();
  readonly accentColor = input<string>('#6B7280');
  readonly connectedTo = input<string[]>([]);

  readonly clicked = output<Task>();
  readonly completed = output<Task>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly assigneeDropped = output<CdkDragDrop<any>>();

  readonly assignees = computed<Member[]>(() => {
    const members = this.membersService.members();
    return this.task()
      .assigneeIds.map((id) => members.find((m) => m.id === id))
      .filter((m): m is Member => !!m);
  });

  readonly dropListId = computed(() => `task-${this.task().id}`);

  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('[data-chip]') || target.closest('[data-action]')) return;
    this.clicked.emit(this.task());
  }

  onComplete(event: MouseEvent): void {
    event.stopPropagation();
    this.completed.emit(this.task());
  }

  buildDragData(memberId: string): AssigneeDragData {
    return { kind: 'member', memberId, fromTaskId: this.task().id };
  }
}
