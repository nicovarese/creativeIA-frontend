import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 IMPORTANTE

@Component({
  selector: 'image-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 AGREGA FormsModule
  styles: [`
    .backdrop { position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:50; }
    .modal { width:min(1100px, 94vw); background:#0f1317; border:1px solid #2a2f36; border-radius:12px; color:#e5e7eb; overflow:hidden; }
    .header { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px 14px; border-bottom:1px solid #2a2f36; }
    .title { font-weight:700; }
    .controls { display:flex; align-items:center; gap:8px; }
    .select, .input { background:#0b0f13; color:#e5e7eb; border:1px solid #2a2f36; border-radius:8px; padding:8px 10px; }
    .select { min-width:180px; }
    .input  { min-width:260px; }
    .grid { padding:12px; display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:10px; }
    .card { background:#111316; border:1px solid #2a2f36; border-radius:8px; overflow:hidden; cursor:pointer; }
    .card img { width:100%; height:180px; object-fit:cover; display:block; }
    .footer { display:flex; justify-content:flex-end; gap:8px; padding:10px 12px; border-top:1px solid #2a2f36; }
    .btn { border:1px solid #2a2f36; border-radius:8px; padding:8px 12px; background:#1a1f24; color:#e5e7eb; }
    .btn:hover { background:#232931; }
    .empty { opacity:.7; padding:40px 16px; text-align:center; }
  `],
  template: `
  <div class="backdrop" *ngIf="open" (click)="close.emit()">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="header">
        <div class="title">Elegir imagen de proyectos</div>
        <div class="controls">
          <select class="select" [(ngModel)]="selectedProject">
            <option *ngFor="let p of projects" [value]="p">{{ p }}</option>
          </select>
          <input class="input" type="text" [(ngModel)]="search" placeholder="Buscar… (nombre, seed, etiquetas)">
          <button class="btn" (click)="close.emit()">Cerrar</button>
        </div>
      </div>

      <ng-container *ngIf="visibleImages.length > 0; else noResults">
        <div class="grid">
          <div class="card" *ngFor="let url of visibleImages" (click)="select(url)">
            <img [src]="url" [alt]="url">
          </div>
        </div>
      </ng-container>

      <ng-template #noResults>
        <div class="empty">No hay imágenes para “{{ selectedProject }}” con “{{ search || '…' }}”.</div>
      </ng-template>

      <div class="footer">
        <button class="btn" (click)="close.emit()">Cancelar</button>
      </div>
    </div>
  </div>
  `
})
export class ImagePickerModalComponent implements OnChanges {
  @Input() open = false;
  @Input() projects: string[] = [];
  @Input() imagesByProject: Record<string, string[]> = {};
  @Input() initialProject?: string;

  @Output() selectImage = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  selectedProject = '';
  search = '';

  ngOnChanges(_: SimpleChanges): void {
    if (!this.selectedProject) {
      this.selectedProject = this.initialProject && this.projects.includes(this.initialProject)
        ? this.initialProject
        : (this.projects[0] ?? '');
    }
  }

  get visibleImages(): string[] {
    const imgs = this.imagesByProject[this.selectedProject] ?? [];
    if (!this.search.trim()) return imgs;
    const q = this.search.trim().toLowerCase();
    return imgs.filter(u => u.toLowerCase().includes(q));
  }

  select(u: string) { this.selectImage.emit(u); }
}
