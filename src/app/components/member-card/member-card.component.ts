import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { Member } from '../../models/member.model';
import { getColumn } from '../../config/columns';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './member-card.component.html',
  styleUrl: './member-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--accent]': 'accent()'
  }
})
export class MemberCardComponent {
  readonly member = input.required<Member>();
  readonly clicked = output<Member>();

  readonly accent = computed(() => getColumn(this.member().column).color);

  onClick(): void {
    this.clicked.emit(this.member());
  }
}
