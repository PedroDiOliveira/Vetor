import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { COLUMNS, BoardColumn } from '../../config/columns';

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  imports: [FormsModule, NgIconComponent],
  templateUrl: './add-task-modal.component.html',
  styleUrl: './add-task-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTaskModalComponent {
  readonly confirm = output<{ title: string; area: string }>();
  readonly close = output<void>();

  readonly title = signal('');
  readonly selectedArea = signal('desenvolvimento');
  readonly columns: BoardColumn[] = COLUMNS;

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }

  onSubmit(): void {
    const trimmed = this.title().trim();
    if (!trimmed) return;
    this.confirm.emit({ title: trimmed, area: this.selectedArea() });
    this.title.set('');
    this.selectedArea.set('desenvolvimento');
  }
}
