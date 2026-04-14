import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { NgIconComponent } from '@ng-icons/core';
import { BoardColumn } from '../../config/columns';
import { Task } from '../../models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CdkDropList, CdkDrag, NgIconComponent, TaskCardComponent],
  templateUrl: './column.component.html',
  styleUrl: './column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--accent]': 'column().color' }
})
export class ColumnComponent {
  readonly column = input.required<BoardColumn>();
  readonly tasks = input.required<Task[]>();
  readonly connectedAreaIds = input<string[]>([]);
  readonly connectedTaskIds = input<string[]>([]);

  readonly taskDropped = output<CdkDragDrop<Task[]>>();
  readonly assigneeDropped = output<CdkDragDrop<unknown>>();
  readonly taskClicked = output<Task>();
  readonly taskCompleted = output<Task>();

  readonly areaDropId = computed(() => `area-${this.column().id}`);
  readonly count = computed(() => this.tasks().length);

  trackById(_: number, t: Task): string { return t.id; }
}
