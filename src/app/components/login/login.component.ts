import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly password = signal('');
  readonly error = signal(false);
  readonly submitting = signal(false);

  onSubmit(): void {
    if (!this.password()) return;
    this.submitting.set(true);
    const ok = this.auth.login(this.password());
    if (ok) {
      this.router.navigate(['/board']);
    } else {
      this.error.set(true);
      this.submitting.set(false);
      setTimeout(() => this.error.set(false), 2000);
    }
  }

  onInput(value: string): void {
    this.password.set(value);
    if (this.error()) this.error.set(false);
  }
}
