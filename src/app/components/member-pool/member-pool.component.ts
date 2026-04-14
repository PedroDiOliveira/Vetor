import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { NgIconComponent } from '@ng-icons/core';
import { Member } from '../../models/member.model';
import { MembersService } from '../../services/members.service';
import { TasksService } from '../../services/tasks.service';
import { AssigneeChipComponent } from '../assignee-chip/assignee-chip.component';
import { AssigneeDragData } from '../task-card/task-card.component';

export const POOL_DROP_ID = 'pool';

@Component({
  selector: 'app-member-pool',
  standalone: true,
  imports: [CdkDropList, CdkDrag, NgIconComponent, AssigneeChipComponent],
  templateUrl: './member-pool.component.html',
  styleUrl: './member-pool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberPoolComponent {
  private readonly membersService = inject(MembersService);
  private readonly tasksService = inject(TasksService);

  readonly connectedTo = input<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly assigneeDropped = output<CdkDragDrop<any>>();
  readonly addMember = output<void>();
  readonly removeMember = output<Member>();

  readonly poolId = POOL_DROP_ID;

  readonly members = computed<Member[]>(() => this.membersService.members());

  readonly busyIds = computed<Set<string>>(() => {
    const ids = new Set<string>();
    for (const t of this.tasksService.active()) {
      for (const id of t.assigneeIds) ids.add(id);
    }
    return ids;
  });

  buildDragData(memberId: string): AssigneeDragData {
    return { kind: 'member', memberId, fromTaskId: null };
  }

  onRemove(event: MouseEvent, member: Member): void {
    event.stopPropagation();
    if (confirm(`Remover ${member.name}?`)) this.removeMember.emit(member);
  }
}
