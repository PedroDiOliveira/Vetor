import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgIconComponent } from '@ng-icons/core';
import { COLUMNS } from '../../config/columns';
import { Member } from '../../models/member.model';
import { MembersService } from '../../services/members.service';
import { AuthService } from '../../services/auth.service';
import { ColumnComponent } from '../column/column.component';
import { MemberModalComponent } from '../member-modal/member-modal.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NgIconComponent, ColumnComponent, MemberModalComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent implements OnInit {
  private readonly membersService = inject(MembersService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly columns = COLUMNS;
  readonly columnIds = COLUMNS.map((c) => c.id);
  readonly members = this.membersService.members;
  readonly loading = this.membersService.loading;

  readonly grouped = computed(() => {
    const groups: Record<string, Member[]> = {};
    for (const c of COLUMNS) groups[c.id] = [];
    for (const m of this.members()) {
      const list = groups[m.column] ?? groups['disponivel'];
      list.push(m);
    }
    return groups;
  });

  readonly selected = signal<Member | null>(null);

  ngOnInit(): void {
    this.membersService.start();
  }

  membersOf(id: string): Member[] {
    return this.grouped()[id] ?? [];
  }

  onDropped(targetId: string, event: CdkDragDrop<Member[]>): void {
    const member = event.item.data as Member;
    if (member.column === targetId) return;
    this.membersService.updateColumn(member.id, targetId);
  }

  onMemberClick(member: Member): void {
    this.selected.set(member);
  }

  closeModal(): void {
    this.selected.set(null);
  }

  saveDescription(description: string): void {
    const m = this.selected();
    if (!m) return;
    this.membersService.updateDescription(m.id, description);
    this.selected.set(null);
  }

  removeMember(id: string): void {
    this.membersService.remove(id);
    this.selected.set(null);
  }

  addMember(): void {
    const name = prompt('Nome do novo membro:')?.trim();
    if (!name) return;
    this.membersService.add(name);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
