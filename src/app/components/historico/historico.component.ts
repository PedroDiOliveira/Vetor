import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { TasksService } from '../../services/tasks.service';
import { MembersService } from '../../services/members.service';
import { getColumn } from '../../config/columns';
import { Task } from '../../models/task.model';
import { Member } from '../../models/member.model';

interface HistoricoEntry {
  task: Task;
  area: ReturnType<typeof getColumn>;
  assignees: Member[];
  completedAt: number;
  dateLabel: string;
}

function formatDate(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 2) return 'agora mesmo';
  if (mins < 60) return `há ${mins} min`;
  if (hours < 24) return `há ${hours}h`;
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;

  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(ts));
}

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoricoComponent implements OnInit {
  private readonly tasksService = inject(TasksService);
  private readonly membersService = inject(MembersService);
  private readonly router = inject(Router);

  readonly entries = computed<HistoricoEntry[]>(() => {
    const members = this.membersService.members();
    return [...this.tasksService.done()]
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
      .map((task) => ({
        task,
        area: getColumn(task.area),
        assignees: task.assigneeIds
          .map((id) => members.find((m) => m.id === id))
          .filter((m): m is Member => !!m),
        completedAt: task.completedAt ?? 0,
        dateLabel: formatDate(task.completedAt ?? 0)
      }));
  });

  ngOnInit(): void {
    this.tasksService.start();
    this.membersService.start();
  }

  goBack(): void {
    this.router.navigate(['/board']);
  }
}
