import { ChangeDetectionStrategy, Component, computed, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { Member } from '../../models/member.model';
import { getColumn } from '../../config/columns';

@Component({
  selector: 'app-member-modal',
  standalone: true,
  imports: [FormsModule, NgIconComponent],
  templateUrl: './member-modal.component.html',
  styleUrl: './member-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberModalComponent {
  readonly member = input.required<Member>();
  readonly close = output<void>();
  readonly save = output<string>();
  readonly remove = output<string>();

  readonly description = signal('');
  readonly columnLabel = computed(() => getColumn(this.member().column).name);
  readonly accent = computed(() => getColumn(this.member().column).color);
  readonly icon = computed(() => getColumn(this.member().column).icon);

  constructor() {
    effect(() => {
      this.description.set(this.member().description ?? '');
    }, { allowSignalWrites: true });
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }

  onSave(): void {
    this.save.emit(this.description().trim());
  }

  onRemove(): void {
    if (confirm(`Remover ${this.member().name} do board?`)) {
      this.remove.emit(this.member().id);
    }
  }
}
