import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-add-member-modal',
  standalone: true,
  imports: [FormsModule, NgIconComponent],
  templateUrl: './add-member-modal.component.html',
  styleUrl: './add-member-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMemberModalComponent {
  readonly confirm = output<string>();
  readonly close = output<void>();

  readonly name = signal('');

  @ViewChild('input') inputRef!: ElementRef<HTMLInputElement>;

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }

  onSubmit(): void {
    const trimmed = this.name().trim();
    if (!trimmed) return;
    this.confirm.emit(trimmed);
    this.name.set('');
  }
}
