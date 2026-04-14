import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Member } from '../../models/member.model';

@Component({
  selector: 'app-assignee-chip',
  standalone: true,
  templateUrl: './assignee-chip.component.html',
  styleUrl: './assignee-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--accent]': 'accent()',
    '[attr.title]': 'member().name'
  }
})
export class AssigneeChipComponent {
  readonly member = input.required<Member>();
  readonly accentColor = input<string>('#6B7280');
  readonly size = input<'sm' | 'md'>('md');

  readonly accent = computed(() => this.accentColor());
}
