import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppHeaderComponent, HeaderTab } from '../../shared/components/app-header/app-header.component';
import { ImagePickerModalComponent } from '../../shared/components/image-picker-modal/image-picker-modal.component';
import { CollapsePanelComponent } from '../../shared/components/collapse-panel/collapse-panel.component';

// 👇 Importo servicio + tipos del contrato (mismo que en el backend)
import { JobService } from '../../core/services/job.service';
import { CreateJobRequestDto, JobResponseDto, Flow } from '../../core/models/job.models';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'ai-studio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppHeaderComponent,
    ImagePickerModalComponent,
    CollapsePanelComponent
  ],
  styles: [`
    .panel { background:#111316; color:#e5e7eb; border:1px solid #2a2f36; border-radius:8px; }
    .btn { border:1px solid #2a2f36; border-radius:8px; padding:8px 10px; background:#1a1f24; color:#e5e7eb; }
    .btn:hover { background:#232931; }
    .primary { background:#2563eb; border-color:#2563eb; }
    .primary:hover { filter:brightness(1.05); }

    .prompt {
      width:100%; box-sizing:border-box; background:#0f1317; color:#e5e7eb;
      border:1px solid #2a2f36; border-radius:8px; padding:10px; resize:none; height:140px; display:block;
    }
    .field { display:flex; flex-direction:column; gap:6px; }
    .input, .select {
      width:100%; box-sizing:border-box; background:#0f1317; color:#e5e7eb;
      border:1px solid #2a2f36; border-radius:8px; padding:8px 10px;
    }
    .grid2 { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px; }
    .thumb { margin-top:8px; width:100%; max-width:320px; height:180px; object-fit:cover; border-radius:8px; border:1px solid #2a2f36; }
  `],
  template: `
  <div style="min-height:100vh; background:#0b0e12;">
    <!-- Header -->
    <app-header
      [activeTab]="activeTab"
      [projects]="projects"
      [project]="project"
      [userName]="userName"
      [userAvatarUrl]="userAvatarUrl"
      (tabChange)="onTabChange($event)"
      (projectChange)="onProjectChange($event)">
    </app-header>

    <!-- Layout principal -->
    <div style="display:grid; grid-template-columns: 360px 1fr; gap:16px; padding:16px;">
      <!-- LEFT: barra lateral con acordeones -->
      <div class="panel" style="padding:14px;">
        <!-- Flujo -->
        <collapse-panel title="Tipo de creación" [open]="true">
          <div class="field">
            <select class="select" [(ngModel)]="flow">
              <option value="txt2img">Texto a Imágen</option>
              <option value="img2img">Imagen a Imágen</option>
              <option value="upscale">Upscale</option>
              <option value="mockup">Mockup</option>
            </select>
          </div>
        </collapse-panel>

        <!-- FORMULARIOS DINÁMICOS -->
        <div [ngSwitch]="flow" style="display:block; margin-top:10px;">

          <!-- ===== TXT → IMG ===== -->
          <ng-container *ngSwitchCase="'txt2img'">
            <collapse-panel title="Prompt" [open]="true">
              <textarea [(ngModel)]="prompt" class="prompt"
                placeholder="Escribí el prompt (ej: retrato realista, luz suave, 50mm, fondo bokeh)"></textarea>
            </collapse-panel>

            <collapse-panel title="Estilo" [open]="false">
              <div class="field">
                <select class="select" [(ngModel)]="style">
                  <option *ngFor="let s of styles" [value]="s">{{ s }}</option>
                </select>
              </div>
            </collapse-panel>

            <collapse-panel title="Marca / Producto" [open]="false">
              <div class="field">
                <label>Marca</label>
                <select class="select" [(ngModel)]="brand" (ngModelChange)="onBrandChange($event)">
                  <option *ngFor="let b of brands" [value]="b">{{ b }}</option>
                </select>
              </div>
              <div class="field" *ngIf="brand !== 'Ninguno'" style="margin-top:10px;">
                <label>Producto</label>
                <select class="select" [(ngModel)]="product">
                  <option *ngFor="let p of productOptions" [value]="p">{{ p }}</option>
                </select>
                <small style="color:#9ca3af">Elegí un modelo/producto de {{ brand }} (opcional).</small>
              </div>
            </collapse-panel>

            <collapse-panel title="Tamaño & Batch" [open]="false">
              <div class="grid2">
                <div class="field">
                  <label>Width (px)</label>
                  <input class="input" type="number" [(ngModel)]="width" min="256" max="1536" step="64">
                </div>
                <div class="field">
                  <label>Height (px)</label>
                  <input class="input" type="number" [(ngModel)]="height" min="256" max="1536" step="64">
                </div>
              </div>
              <div class="field" style="margin-top:10px;">
                <label>Batch (imágenes)</label>
                <input class="input" type="number" [(ngModel)]="batch" min="1" max="8" step="1">
              </div>
            </collapse-panel>
          </ng-container>

          <!-- ===== IMG → IMG ===== -->
          <ng-container *ngSwitchCase="'img2img'">
            <collapse-panel title="Prompt" [open]="true">
              <textarea [(ngModel)]="prompt" class="prompt"
                placeholder="Contale al modelo qué querés lograr (p.ej.: noche, estilo cine, lluvia suave)"></textarea>
            </collapse-panel>

            <collapse-panel title="Imagen base" [open]="false">
              <div class="field">
                <input class="input" type="file" accept="image/*"
                  (change)="srcImageFile = $event.target.files?.[0] || undefined; pickedImgUrl = undefined;">
                <small style="color:#9ca3af">Usá una imagen de referencia.</small>
                <div style="display:flex; gap:8px; margin-top:8px;">
                  <button class="btn" type="button" (click)="openPicker('img2img')">Elegir de proyectos</button>
                </div>
                <img *ngIf="pickedImgUrl" class="thumb" [src]="pickedImgUrl" alt="seleccionada">
              </div>
            </collapse-panel>

            <collapse-panel title="Estilo" [open]="false">
              <div class="field">
                <select class="select" [(ngModel)]="style">
                  <option *ngFor="let s of styles" [value]="s">{{ s }}</option>
                </select>
              </div>
            </collapse-panel>

            <collapse-panel title="Marca / Producto" [open]="false">
              <div class="field">
                <label>Marca</label>
                <select class="select" [(ngModel)]="brand" (ngModelChange)="onBrandChange($event)">
                  <option *ngFor="let b of brands" [value]="b">{{ b }}</option>
                </select>
              </div>
              <div class="field" *ngIf="brand !== 'Ninguno'" style="margin-top:10px;">
                <label>Producto</label>
                <select class="select" [(ngModel)]="product">
                  <option *ngFor="let p of productOptions" [value]="p">{{ p }}</option>
                </select>
              </div>
            </collapse-panel>

            <collapse-panel title="Fuerza de referencia (0–1)" [open]="false">
              <div class="field">
                <input class="input" type="number" [(ngModel)]="strength" min="0" max="1" step="0.05">
              </div>
            </collapse-panel>

            <collapse-panel title="Tamaño & Batch" [open]="false">
              <div class="grid2">
                <div class="field">
                  <label>Width (px)</label>
                  <input class="input" type="number" [(ngModel)]="width" min="256" max="1536" step="64">
                </div>
                <div class="field">
                  <label>Height (px)</label>
                  <input class="input" type="number" [(ngModel)]="height" min="256" max="1536" step="64">
                </div>
              </div>
              <div class="field" style="margin-top:10px;">
                <label>Batch (imágenes)</label>
                <input class="input" type="number" [(ngModel)]="batch" min="1" max="8" step="1">
              </div>
            </collapse-panel>
          </ng-container>

          <!-- ===== UPSCALE ===== -->
          <ng-container *ngSwitchCase="'upscale'">
            <collapse-panel title="Imagen a mejorar" [open]="true">
              <div class="field">
                <input class="input" type="file" accept="image/*"
                  (change)="upImageFile = $event.target.files?.[0] || undefined; pickedImgUrl = undefined;">
                <div style="display:flex; gap:8px; margin-top:8px;">
                  <button class="btn" type="button" (click)="openPicker('upscale')">Elegir de proyectos</button>
                </div>
                <img *ngIf="pickedImgUrl" class="thumb" [src]="pickedImgUrl" alt="seleccionada">
              </div>
            </collapse-panel>

            <collapse-panel title="Factor" [open]="true">
              <div class="field">
                <select class="select" [(ngModel)]="upFactor">
                  <option [ngValue]="2">2×</option>
                  <option [ngValue]="4">4×</option>
                </select>
              </div>
            </collapse-panel>
          </ng-container>

          <!-- ===== MOCKUP ===== -->
          <ng-container *ngSwitchCase="'mockup'">
            <collapse-panel title="Imagen creativa" [open]="true">
              <div class="field">
                <input class="input" type="file" accept="image/*"
                  (change)="mockInputFile = $event.target.files?.[0] || undefined; pickedImgUrl = undefined;">
              </div>
            </collapse-panel>

            <collapse-panel title="Plantilla" [open]="true">
              <div class="field">
                <select class="select" [(ngModel)]="mockTemplate">
                  <option *ngFor="let t of mockupTemplates" [value]="t">{{ t }}</option>
                </select>
              </div>
            </collapse-panel>

            <collapse-panel title="Transformaciones" [open]="true">
              <div class="grid2">
                <div class="field">
                  <label>Escala (%)</label>
                  <input class="input" type="number" [(ngModel)]="mockScale" min="10" max="200" step="5">
                </div>
                <div class="field">
                  <label>Offset X (px)</label>
                  <input class="input" type="number" [(ngModel)]="mockOffsetX" min="-500" max="500" step="5">
                </div>
                <div class="field">
                  <label>Offset Y (px)</label>
                  <input class="input" type="number" [(ngModel)]="mockOffsetY" min="-500" max="500" step="5">
                </div>
              </div>
            </collapse-panel>
          </ng-container>
        </div>

        <!-- Botón común -->
        <div style="margin-top:12px;">
          <button class="btn primary" style="width:100%; padding:12px;"
            (click)="generate()" [disabled]="!canGenerate() || loading">
            {{ loading ? 'Procesando…' : actionLabel }}
          </button>
        </div>
      </div>

      <!-- RIGHT: resultados -->
      <div class="panel" style="padding:14px; min-height:480px;">
        <div *ngIf="images.length===0" style="opacity:.6;">Tus resultados aparecerán acá.</div>
        <div *ngIf="images.length>0" style="display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px;">
          <div *ngFor="let img of images" class="panel" style="padding:6px;">
            <img [src]="img" alt="result"
                 style="width:100%; height:260px; object-fit:cover; border-radius:6px;">
            <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:6px;">
              <button class="btn" (click)="upscale(img)">Mejorar</button>
              <a class="btn" [href]="img" target="_blank">Abrir</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: picker -->
    <image-picker-modal
      [open]="pickerOpen"
      [projects]="projects"
      [imagesByProject]="pickerImagesByProject"
      [initialProject]="project"
      (selectImage)="onPick($event)"
      (close)="pickerOpen=false">
    </image-picker-modal>
  </div>
  `
})
export class AIStudioComponent {
  constructor(private jobs: JobService) {
    // origen del backend (de 'http://localhost:8080/v1' → 'http://localhost:8080')
    this.apiOrigin = new URL(environment.apiBaseUrl).origin;
  } // 👈 inyecto el servicio HTTP

   private readonly apiOrigin: string;
  /** Header */
  activeTab: HeaderTab = 'studio';
  projects = ['Proyecto demo', 'Proyecto Itaú', 'Proyecto Coca'];
  project = this.projects[0];
  userName = 'Nicolás';
  
  userAvatarUrl = 'https://i.pravatar.cc/28';

  onTabChange(tab: HeaderTab) { this.activeTab = tab; }
  onProjectChange(p: string)   { this.project = p; }

  /** Flujo actual */
  flow: Flow = 'txt2img';

  /** Form compartido */
  prompt = '';
  style = 'Ninguno';
  brand = 'Ninguno';
  product = 'Ninguno';
  width = 768;
  height = 768;
  batch = 4;

  /** Catálogos (mock) */
  styles = ['Ninguno', 'Realismo', 'Animación', 'Classic'];
  brands = ['Ninguno', 'Hyundai', 'Itaú', 'Marca ejemplo'];
  productsByBrand: Record<string, string[]> = {
    'Ninguno': ['Ninguno'],
    'Hyundai': ['Ninguno', 'Kona', 'Tucson', 'Elantra', 'Santa Fe'],
    'Itaú': ['Ninguno', 'Cuenta', 'Tarjeta', 'Préstamo'],
    'Marca ejemplo': ['Ninguno', 'Producto A', 'Producto B'],
  };
  get productOptions() { return this.productsByBrand[this.brand] ?? ['Ninguno']; }
  onBrandChange(newBrand: string) { this.brand = newBrand; this.product = 'Ninguno'; }

  /** IMG→IMG */
  srcImageFile?: File;
  strength = 0.6;

  /** Upscale */
  upImageFile?: File;
  upFactor: 2 | 4 = 2;

  /** Mockup */
  mockInputFile?: File;
  mockupTemplates = ['Remera', 'Cartel', 'Mockup iPhone', 'Lona'];
  mockTemplate = 'Remera';
  mockScale = 100;
  mockOffsetX = 0;
  mockOffsetY = 0;

  /** Picker modal */
  pickerOpen = false;
  pickerContext: 'img2img' | 'upscale' | null = null;
  pickedImgUrl?: string;

  // mock: imágenes por proyecto (reemplazar por backend real)
  pickerImagesByProject: Record<string,string[]> = {
    'Proyecto demo': Array.from({ length: 10 }).map((_, i) => `https://picsum.photos/seed/demo-${i}/640/400`),
    'Proyecto Itaú': Array.from({ length: 12 }).map((_, i) => `https://picsum.photos/seed/itau-${i}/640/400`),
    'Proyecto Coca': Array.from({ length:  8 }).map((_, i) => `https://picsum.photos/seed/coca-${i}/640/400`),
  };

  openPicker(ctx: 'img2img'|'upscale') {
    this.pickerContext = ctx;
    this.pickerOpen = true;
  }
  onPick(url: string) {
    this.pickedImgUrl = url;
    this.pickerOpen = false;
  }

  /** Estado resultados */
  loading = false;
  images: string[] = [];

  get actionLabel() {
    switch (this.flow) {
      case 'txt2img':
      case 'img2img': return 'Generar';
      case 'upscale': return 'Upscale';
      case 'mockup':  return 'Render Mockup';
    }
  }

  canGenerate(): boolean {
    if (this.flow === 'txt2img') {
      return this.prompt.trim().length > 0
        && this.inRange(this.width, 256, 1536)
        && this.inRange(this.height, 256, 1536)
        && this.inRange(this.batch, 1, 8);
    }
    if (this.flow === 'img2img') {
      const hasImage = !!this.srcImageFile || !!this.pickedImgUrl;
      return hasImage
        && this.prompt.trim().length > 0
        && this.inRange(this.strength, 0, 1)
        && this.inRange(this.width, 256, 1536)
        && this.inRange(this.height, 256, 1536)
        && this.inRange(this.batch, 1, 8);
    }
    if (this.flow === 'upscale') {
      const hasImage = !!this.upImageFile || !!this.pickedImgUrl;
      return hasImage && (this.upFactor === 2 || this.upFactor === 4);
    }
    if (this.flow === 'mockup') {
      return !!this.mockInputFile && !!this.mockTemplate;
    }
    return false;
  }
  private inRange(n: number, min: number, max: number) { return n >= min && n <= max; }

  // ===== Helpers de payload =====
  private projectIdMap: Record<string, string> = {
    'Proyecto demo': 'demo',
    'Proyecto Itaú': 'itau',
    'Proyecto Coca': 'coca'
  };
  private projectIdFor(name: string) {
    // fallback: slug del nombre
    return this.projectIdMap[name] ?? name.toLowerCase().replace(/\s+/g, '-');
  }
  /** Convierte "Ninguno" en null y omite campos vacíos */
  private brandBlock(body: any) {
    const style   = this.style === 'Ninguno' ? null : this.style;
    const brand   = this.brand === 'Ninguno' ? null : this.brand;
    const product = this.product === 'Ninguno' ? null : this.product;
    if (style)   body.style = style;
    if (brand)   body.brand = brand;
    if (product) body.product = product;
  }
  /** Arma el JSON exacto que espera el backend */
  private buildPayloadWithProject(): CreateJobRequestDto {
    const projectId = this.projectIdFor(this.project);
    const base: any = { projectId, flow: this.flow };

    if (this.flow === 'txt2img') {
      const body = { ...base, prompt: this.prompt.trim(), width: this.width, height: this.height, batch: this.batch };
      this.brandBlock(body); return body;
    }
    if (this.flow === 'img2img') {
      const body: any = { ...base, prompt: this.prompt.trim(), strength: this.strength,
                          width: this.width, height: this.height, batch: this.batch };
      this.brandBlock(body);
      // ⚠️ Tu backend espera imageUrl, no archivo local
      if (this.pickedImgUrl) body.imageUrl = this.pickedImgUrl;
      return body;
    }
    if (this.flow === 'upscale')  {
      const body: any = { ...base, factor: this.upFactor };
      if (this.pickedImgUrl) body.imageUrl = this.pickedImgUrl;
      return body;
    }
    // mockup
    return { ...base, template: this.mockTemplate, scale: this.mockScale, offsetX: this.mockOffsetX, offsetY: this.mockOffsetY };
  }

  // ===== Acción principal =====
  async generate() {
    if (!this.canGenerate()) return;

    // Validación mínima para flows con imageUrl obligatoria
    if ((this.flow === 'img2img' || this.flow === 'upscale') && !this.pickedImgUrl) {
      alert('Elegí una imagen del picker (URL) o agregamos un upload para obtener una URL.');
      return;
    }

    this.loading = true;
    this.images = [];
    try {
      const payload = this.buildPayloadWithProject();
      const res = await this.jobs.createJob(payload).toPromise();

      if (!res) return;

      // Si el backend procesa async, hacemos polling hasta DONE/ERROR
      if (res.id && (res.status === 'QUEUED' || res.status === 'RUNNING')) {
        await new Promise<void>((resolve, reject) => {
          const sub = this.jobs.pollJob(res.id).subscribe({
            next: (r: JobResponseDto) => {
              if (r.status === 'DONE') {
                this.images = r.results?.length ? r.results : (r.resultUrl ? [r.resultUrl] : []);
                sub.unsubscribe();
                resolve();
              } else if (r.status === 'ERROR') {
                alert(r.message ?? 'Error de procesamiento');
                sub.unsubscribe();
                resolve();
              }
            },
            error: (e) => { alert(e?.message || 'Error'); reject(e); }
          });
        });
      } else {
        // Síncrono: el resultado vino en la respuesta
        this.images = res.results?.length ? res.results : (res.resultUrl ? [res.resultUrl] : []);
      }

    } finally {
      this.loading = false;
    }
  }

  upscale(img: string) { alert('Upscale (simulado) para: ' + img); }
}
