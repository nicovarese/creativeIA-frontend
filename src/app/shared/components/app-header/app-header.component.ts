import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type HeaderTab = 'studio' | 'presets' | 'history' | 'brand';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .topbar {
      color:#e5e7eb;
      border-bottom:1px solid #243046;
      background:rgba(6,10,16,.8);
      backdrop-filter:blur(10px);
      font-family:'Segoe UI Variable', 'Space Grotesk', 'Manrope', sans-serif;
    }
    .topbar strong { color:#f9fafb; font-weight:700; letter-spacing:.2px; }
    .nav a { padding:8px 10px; border-radius:10px; color:#cbd5e1; text-decoration:none; transition:all .16s ease; }
    .nav a:hover { background:#162133; color:#fff; }
    .nav .active { background:#1e2d44; color:#fff; border:1px solid #2d4060; }
    .select {
      min-width:180px;
      background:#0c1220; color:#e5e7eb; border:1px solid #2e415f; border-radius:10px; padding:8px 10px;
    }
    .chip {
      font-size:12px;
      padding:7px 10px;
      border-radius:10px;
      background:linear-gradient(180deg, #3273ff 0%, #1d4ed8 100%);
      border:1px solid #1d4ed8;
      color:#f8fbff;
      font-weight:600;
      cursor:pointer;
      transition:filter .16s ease;
    }
    .chip:hover { filter:brightness(1.05); }
    .user-btn { display:flex; align-items:center; gap:8px; background:transparent; border:0; color:#cbd5e1; cursor:pointer; padding:5px 8px; border-radius:10px; }
    .user-btn:hover { background:#172133; }
    .menu { position:absolute; right:0; top:calc(100% + 8px); min-width:180px; background:#0f1725; border:1px solid #2e415f; border-radius:10px; box-shadow:0 14px 30px rgba(0,0,0,.35); overflow:hidden; z-index:30; }
    .menu button { width:100%; text-align:left; background:transparent; border:0; color:#e5e7eb; padding:10px 12px; cursor:pointer; }
    .menu button:hover { background:#1b2230; }
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


        <div style="position:relative;">
          <button class="user-btn" type="button" (click)="toggleMenu($event)">
            <img [src]="userAvatarUrl" alt="user" style="width:28px; height:28px; border-radius:50%" />
            <span style="font-size:13px; color:#cbd5e1;">{{ userName }}</span>
          </button>
          <div class="menu" *ngIf="menuOpen">
            <button type="button" (click)="onProfile()">Mi perfil</button>
            <button type="button" (click)="onSettings()">Configuraciones</button>
            <button type="button" (click)="onLogout()">Cerrar sesión</button>
          </div>
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
  @Output() profile = new EventEmitter<void>();
  @Output() settings = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  menuOpen = false;

  constructor(private host: ElementRef<HTMLElement>) {}

  onTab(e: Event, t: HeaderTab) {
    e.preventDefault();
    if (t !== this.activeTab) this.tabChange.emit(t);
  }

  toggleMenu(e: Event) {
    e.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  onProfile() {
    this.menuOpen = false;
    this.profile.emit();
  }

  onSettings() {
    this.menuOpen = false;
    this.settings.emit();
  }

  onLogout() {
    this.menuOpen = false;
    this.logout.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.menuOpen) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.menuOpen = false;
    }
  }
}
