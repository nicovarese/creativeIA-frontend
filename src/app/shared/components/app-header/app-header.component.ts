import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type HeaderTab = 'studio' | 'presets' | 'history' | 'brand';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .topbar { color:#e5e7eb; border-bottom:1px solid #2a2f36; background:#0b0e12; }
    .topbar strong { color:#f9fafb; font-weight:700; }
    .nav a { padding:8px 10px; border-radius:8px; color:#cbd5e1; text-decoration:none; }
    .nav a:hover { background:#1a1f24; color:#fff; }
    .nav .active { background:#1f2937; color:#fff; border:1px solid #2a2f36; }
    .select {
      min-width:180px;
      background:#0f1317; color:#e5e7eb; border:1px solid #2a2f36; border-radius:8px; padding:8px 10px;
    }
    .chip { font-size:12px; padding:2px 6px; border-radius:6px; background:#0b1220; border:1px solid #2a2f36; }
  `],
  template: `
  <header class="topbar">
    <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 16px;">
      <!-- Izquierda: Logo + nombre -->
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:26px; height:26px; border-radius:6px; background:#2563eb;"></div>
        <strong>AI Studio</strong>
      </div>

      <!-- Centro: Tabs -->
      <nav class="nav" style="display:flex; gap:6px;">
        <a href="#" [class.active]="activeTab==='studio'" (click)="onTab($event,'studio')">Studio</a>
        <a href="#" [class.active]="activeTab==='presets'" (click)="onTab($event,'presets')">Mis presets</a>
        <a href="#" [class.active]="activeTab==='history'" (click)="onTab($event,'history')">Historial</a>
        <a href="#" [class.active]="activeTab==='brand'" (click)="onTab($event,'brand')">Brand Studio</a>
      </nav>

      <div style="display:flex; align-items:center; gap:10px;">
        <select class="select" [ngModel]="project" (ngModelChange)="projectChange.emit($event)">
          <option *ngFor="let p of projects" [value]="p">{{ p }}</option>
        </select>
        <button class="chip" type="button" (click)="createProject.emit()">Nuevo proyecto</button>


        <div style="display:flex; align-items:center; gap:8px;">
          <img [src]="userAvatarUrl" alt="user" style="width:28px; height:28px; border-radius:50%" />
          <span style="font-size:13px; color:#cbd5e1;">{{ userName }}</span>
        </div>
      </div>
    </div>
  </header>
  `
})
export class AppHeaderComponent {
  /** pestaña activa */
  @Input() activeTab: HeaderTab = 'studio';
  /** lista de proyectos */
  @Input() projects: string[] = [];
  /** proyecto seleccionado */
  @Input() project = '';
  /** nombre y avatar del usuario */
  @Input() userName = 'Usuario';
  @Input() userAvatarUrl = 'https://i.pravatar.cc/28';

  /** eventos */
  @Output() tabChange = new EventEmitter<HeaderTab>();
  @Output() projectChange = new EventEmitter<string>();
  @Output() createProject = new EventEmitter<void>();

  onTab(e: Event, t: HeaderTab) {
    e.preventDefault();
    if (t !== this.activeTab) this.tabChange.emit(t);
  }
}
