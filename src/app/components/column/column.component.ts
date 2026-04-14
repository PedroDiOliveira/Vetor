import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { NgIconComponent } from '@ng-icons/core';
import { BoardColumn } from '../../config/columns';
import { Member } from '../../models/member.model';
import { MemberCardComponent } from '../member-card/member-card.component';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CdkDropList, CdkDrag, NgIconComponent, MemberCardComponent],
  templateUrl: './column.component.html',
  styleUrl: './column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--accent]': 'column().color'
  }
})
export class ColumnComponent {
  readonly column = input.required<BoardColumn>();
  readonly members = input.required<Member[]>();
  readonly connectedTo = input<string[]>([]);

  readonly dropped = output<CdkDragDrop<Member[]>>();
  readonly memberClicked = output<Member>();

  readonly count = computed(() => this.members().length);

  trackById(_: number, m: Member): string { return m.id; }
}
