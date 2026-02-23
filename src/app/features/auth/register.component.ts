import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .wrap { max-width: 420px; margin: 60px auto; padding: 16px; }
    .panel { background:#111316; color:#e5e7eb; border:1px solid #2a2f36; border-radius:8px; padding:16px; }
    .field { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
    .input { width:100%; box-sizing:border-box; background:#0f1317; color:#e5e7eb;
      border:1px solid #2a2f36; border-radius:8px; padding:8px 10px; }
    .btn { border:1px solid #2a2f36; border-radius:8px; padding:8px 12px; background:#1a1f24; color:#e5e7eb; }
    .btn.primary { background:#2563eb; border-color:#2563eb; }
    .row { display:flex; justify-content:space-between; align-items:center; gap:8px; }
    .error { color:#f87171; margin-top:8px; }
  `],
  template: `
    <div class="wrap">
      <div class="panel">
        <h2>Registro</h2>
        <div class="field">
          <label>Email</label>
          <input class="input" [(ngModel)]="email" type="email" autocomplete="email">
        </div>
        <div class="field">
          <label>Password</label>
          <input class="input" [(ngModel)]="password" type="password" autocomplete="new-password">
        </div>
        <div class="row">
          <button class="btn primary" (click)="submit()" [disabled]="loading">Crear cuenta</button>
          <a class="btn" routerLink="/login">Ya tengo cuenta</a>
        </div>
        <div class="error" *ngIf="error">{{ error }}</div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    this.loading = true;
    this.auth.register({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/studio'),
      error: (e) => {
        this.error = e?.error?.message || e?.message || 'Error de registro';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}
