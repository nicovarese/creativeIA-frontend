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
    :host { display:block; min-height:100vh; background:
      radial-gradient(1200px 500px at 5% -10%, #1e3a8a 0%, transparent 55%),
      radial-gradient(900px 500px at 95% 110%, #14532d 0%, transparent 50%),
      linear-gradient(180deg, #05080f 0%, #070b13 100%);
      color:#e5e7eb; font-family:'Segoe UI Variable', 'Space Grotesk', 'Manrope', sans-serif; }
    .wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:28px 16px; }
    .panel { width:100%; max-width:420px; background:rgba(12,18,30,.85); border:1px solid #243046;
      border-radius:14px; padding:22px; box-shadow:0 22px 50px rgba(0,0,0,.45); backdrop-filter: blur(8px); }
    .title { margin:0 0 4px; font-size:28px; letter-spacing:.2px; color:#f8fafc; }
    .subtitle { margin:0 0 18px; color:#9fb0ca; font-size:14px; }
    .field { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
    .label { color:#c8d4ea; font-size:13px; }
    .input { width:100%; box-sizing:border-box; background:#0c1220; color:#e5e7eb;
      border:1px solid #293851; border-radius:10px; padding:10px 12px; outline:none; }
    .input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.2); }
    .row { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:4px; }
    .btn { border:1px solid #30405c; border-radius:10px; padding:10px 14px; background:#111a2c; color:#e5e7eb; cursor:pointer; }
    .btn.primary { background:#2563eb; border-color:#2563eb; font-weight:600; }
    .btn:disabled { opacity:.6; cursor:not-allowed; }
    .link { color:#bfdbfe; text-decoration:none; font-size:13px; }
    .error { color:#fecaca; margin-top:12px; background:#3f1d20; border:1px solid #7f1d1d; border-radius:8px; padding:8px 10px; font-size:13px; }
  `],
  template: `
    <div class="wrap">
      <div class="panel">
        <h2 class="title">Crear cuenta</h2>
        <p class="subtitle">Registrate para empezar a usar Studio con tus proyectos.</p>
        <div class="field">
          <label class="label">Email</label>
          <input class="input" [(ngModel)]="email" type="email" autocomplete="email">
        </div>
        <div class="field">
          <label class="label">Password</label>
          <input class="input" [(ngModel)]="password" type="password" autocomplete="new-password">
        </div>
        <div class="row">
          <button class="btn primary" (click)="submit()" [disabled]="loading">Crear cuenta</button>
          <a class="link" routerLink="/login">Ya tengo cuenta</a>
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
