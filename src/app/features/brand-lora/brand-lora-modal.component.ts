import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { BrandLoraDto, BrandLoraService } from '../../core/services/brand-lora.service';

@Component({
  selector: 'brand-lora-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .backdrop { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:80; }
    .modal {
      width:min(720px, calc(100vw - 24px)); max-height:90vh; overflow:auto;
      background:#0f1725; border:1px solid #2e415f; border-radius:14px;
      color:#e5e7eb; box-shadow:0 24px 50px rgba(0,0,0,.5);
    }
    .head { padding:16px 18px; border-bottom:1px solid #243046; display:flex; justify-content:space-between; align-items:center; }
    .title { font-weight:700; font-size:17px; }
    .body { padding:14px 18px; display:flex; flex-direction:column; gap:18px; }
    .section-title { font-size:13px; text-transform:uppercase; letter-spacing:.4px; color:#9fb0ca; margin-bottom:6px; }
    .input, .select, .prompt {
      width:100%; box-sizing:border-box; background:#0c1220; color:#e5e7eb;
      border:1px solid #293851; border-radius:10px; padding:10px 12px; outline:none;
    }
    .row { display:flex; gap:8px; }
    .btn {
      border:1px solid #31415e; border-radius:10px; height:40px; min-width:112px; padding:0 14px;
      background:linear-gradient(180deg, #132034 0%, #101a2b 100%); color:#e6edf8;
      font-weight:600; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;
    }
    .btn:hover { border-color:#46618e; }
    .btn:disabled { opacity:.5; cursor:not-allowed; }
    .primary { background:linear-gradient(180deg, #3273ff 0%, #1d4ed8 100%); border-color:#1d4ed8; }
    .danger { border-color:#7f1d1d; color:#fecaca; }
    .item {
      border:1px solid #243046; border-radius:12px; padding:12px;
      background:rgba(9,15,26,.7); display:flex; flex-direction:column; gap:6px;
    }
    .item-head { display:flex; justify-content:space-between; align-items:center; gap:8px; }
    .item-name { font-weight:600; }
    .badge {
      font-size:11px; text-transform:uppercase; letter-spacing:.3px;
      border:1px solid #2f4466; border-radius:999px; padding:3px 9px;
    }
    .badge.PENDING   { background:#1a2335; color:#9fb0ca; }
    .badge.TRAINING  { background:#132237; color:#cde0ff; }
    .badge.COMPLETED { background:#0e2a1d; color:#bbf7d0; border-color:#14532d; }
    .badge.FAILED    { background:#3f1d20; color:#fecaca; border-color:#7f1d1d; }
    .progress-track { height:6px; border-radius:999px; background:#0e1728; border:1px solid #273b59; overflow:hidden; }
    .progress-val   { height:100%; background:linear-gradient(90deg,#3b82f6,#10b981); transition:width .4s ease; }
    .meta { font-size:12px; color:#9fb0ca; }
    .errmsg { color:#fecaca; font-size:12px; }
    .empty { opacity:.7; padding:18px; border:1px dashed #31415e; border-radius:10px; text-align:center; }
    .form-grid { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
    .files-info { color:#9fb0ca; font-size:12px; margin-top:6px; }
    .files-info.err { color:#fbbf24; }
  `],
  template: `
    <div class="backdrop" *ngIf="open" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="head">
          <div class="title">Mis marcas (LoRA)</div>
          <button class="btn" (click)="close.emit()">Cerrar</button>
        </div>

        <div class="body">
          <!-- Form crear -->
          <div>
            <div class="section-title">Entrenar nueva marca</div>
            <div class="form-grid">
              <div>
                <label class="meta">Nombre de la marca</label>
                <input class="input" type="text" [(ngModel)]="newName" maxlength="80" placeholder="Ej: Café Aurora">
              </div>
              <div>
                <label class="meta">Trigger word</label>
                <input class="input" type="text" [(ngModel)]="newTrigger" maxlength="40" placeholder="Ej: aurora_brand">
              </div>
            </div>
            <div style="margin-top:10px;">
              <label class="meta">Tipo de producto (mejora los captions)</label>
              <input class="input" type="text" [(ngModel)]="newProductType" maxlength="80"
                     placeholder="Ej: soda bottle, running shoe, perfume bottle">
            </div>

            <div style="margin-top:10px;">
              <label class="meta">Imágenes del dataset (5 a 50)</label>
              <input class="input" type="file" accept="image/*" multiple (change)="onFilesChange($event)">
              <div class="files-info" [class.err]="filesError">{{ filesInfo }}</div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
              <button class="btn primary" (click)="submit()"
                      [disabled]="!canSubmit() || creating">
                {{ creating ? 'Encolando…' : 'Entrenar' }}
              </button>
            </div>
          </div>

          <!-- Lista -->
          <div>
            <div class="section-title">Trainings</div>
            <div *ngIf="loras.length===0" class="empty">Todavía no entrenaste ninguna marca.</div>

            <div *ngFor="let bl of loras" class="item" style="margin-bottom:8px;">
              <div class="item-head">
                <div>
                  <span class="item-name">{{ bl.name }}</span>
                  <span class="meta" style="margin-left:8px;">trigger: <code>{{ bl.triggerWord }}</code></span>
                </div>
                <span class="badge" [ngClass]="bl.status">{{ bl.status }}</span>
              </div>
              <div *ngIf="bl.status==='TRAINING' || bl.status==='PENDING'" class="progress-track">
                <div class="progress-val" [style.width.%]="bl.progress ?? 0"></div>
              </div>
              <div class="meta">
                {{ bl.imageCount }} imágenes · creada {{ bl.createdAt | date:'short' }}
                <ng-container *ngIf="bl.completedAt"> · lista {{ bl.completedAt | date:'short' }}</ng-container>
              </div>
              <div class="errmsg" *ngIf="bl.errorMessage">{{ bl.errorMessage }}</div>
              <div style="display:flex; justify-content:flex-end;">
                <button class="btn danger" (click)="remove(bl)" [disabled]="bl.status==='TRAINING'">Borrar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BrandLoraModalComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  /** Se emite cuando hay cambios (crear/borrar/COMPLETED) para que el padre refresque su select. */
  @Output() changed = new EventEmitter<void>();

  loras: BrandLoraDto[] = [];
  newName = '';
  newTrigger = '';
  newProductType = '';
  newFiles: File[] = [];
  creating = false;

  private pollSub: Subscription | null = null;
  private lastCompletedIds = new Set<string>();

  constructor(private api: BrandLoraService) {}

  ngOnChanges(c: SimpleChanges): void {
    if (c['open']) {
      if (this.open) {
        this.refresh();
        this.startPolling();
      } else {
        this.stopPolling();
        this.resetForm();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get filesInfo(): string {
    const n = this.newFiles.length;
    if (n === 0) return '0 imágenes seleccionadas (mínimo 5).';
    if (n < 5)   return `${n} imágenes seleccionadas. Faltan al menos ${5 - n}.`;
    if (n > 50)  return `${n} imágenes — máximo permitido: 50.`;
    return `${n} imágenes seleccionadas.`;
  }

  get filesError(): boolean {
    return this.newFiles.length > 0 && (this.newFiles.length < 5 || this.newFiles.length > 50);
  }

  onFilesChange(evt: Event) {
    const input = evt.target as HTMLInputElement;
    this.newFiles = Array.from(input.files ?? []);
  }

  canSubmit(): boolean {
    return this.newName.trim().length >= 2
        && this.newTrigger.trim().length >= 2
        && this.newFiles.length >= 5
        && this.newFiles.length <= 50;
  }

  submit() {
    if (!this.canSubmit() || this.creating) return;
    this.creating = true;
    this.api.create(this.newName.trim(), this.newTrigger.trim(), this.newProductType.trim() || null, this.newFiles).subscribe({
      next: () => {
        this.resetForm();
        this.refresh();
        this.changed.emit();
      },
      error: (e) => {
        alert(e?.error?.message || e?.message || 'No se pudo encolar el training');
        this.creating = false;
      }
    });
  }

  remove(bl: BrandLoraDto) {
    if (!confirm(`¿Borrar la marca "${bl.name}"? No se puede deshacer.`)) return;
    this.api.delete(bl.id).subscribe({
      next: () => {
        this.refresh();
        this.changed.emit();
      }
    });
  }

  private resetForm() {
    this.newName = '';
    this.newTrigger = '';
    this.newProductType = '';
    this.newFiles = [];
    this.creating = false;
  }

  private refresh() {
    this.api.list().subscribe({
      next: (items) => {
        this.loras = items;
        // Detectar transiciones a COMPLETED para avisar al padre
        for (const bl of items) {
          if (bl.status === 'COMPLETED' && !this.lastCompletedIds.has(bl.id)) {
            this.lastCompletedIds.add(bl.id);
            this.changed.emit();
          }
        }
      }
    });
  }

  private startPolling() {
    this.stopPolling();
    this.pollSub = interval(2000).pipe(switchMap(() => this.api.list())).subscribe({
      next: (items) => {
        this.loras = items;
        for (const bl of items) {
          if (bl.status === 'COMPLETED' && !this.lastCompletedIds.has(bl.id)) {
            this.lastCompletedIds.add(bl.id);
            this.changed.emit();
          }
        }
      }
    });
  }

  private stopPolling() {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }
}
