import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { TasksService } from '../../services/tasks.service';
import { MembersService } from '../../services/members.service';

function startOf(unit: 'week' | 'month'): number {
  const d = new Date();
  if (unit === 'week') {
    const day = d.getDay();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  } else {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d.getTime();
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly tasksService = inject(TasksService);
  private readonly membersService = inject(MembersService);

  readonly ativas = computed(() => this.tasksService.active().length);

  readonly concluidasSemana = computed(() => {
    const t = startOf('week');
    return this.tasksService.done().filter((t2) => (t2.completedAt ?? 0) >= t).length;
  });

  readonly concluidasMes = computed(() => {
    const t = startOf('month');
    return this.tasksService.done().filter((t2) => (t2.completedAt ?? 0) >= t).length;
  });

  readonly podium = computed(() => {
    const t = startOf('week');
    const done = this.tasksService.done().filter((t2) => (t2.completedAt ?? 0) >= t);
    const count: Record<string, number> = {};
    for (const task of done) {
      for (const id of task.assigneeIds) {
        count[id] = (count[id] ?? 0) + 1;
      }
    }
    return Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, n], i) => {
        const member = this.membersService.byId(id);
        return member ? { rank: i + 1, name: member.name, avatar: member.avatar, count: n } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  });
}
