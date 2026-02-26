import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppHeaderComponent, HeaderTab } from '../../shared/components/app-header/app-header.component';
import { ImagePickerModalComponent } from '../../shared/components/image-picker-modal/image-picker-modal.component';
import { CollapsePanelComponent } from '../../shared/components/collapse-panel/collapse-panel.component';

import { JobService } from '../../core/services/job.service';
import { CreateJobRequestDto, JobResponseDto, Flow } from '../../core/models/job.models';
import { environment } from '../../../environments/environment';
import { ProjectDto, ProjectService } from '../../core/services/project.service';

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
    <app-header
      [activeTab]="activeTab"
      [projects]="projects"
      [project]="project"
      [userName]="userName"
      [userAvatarUrl]="userAvatarUrl"
      (tabChange)="onTabChange($event)"
      (projectChange)="onProjectChange($event)">
    </app-header>

    <div style="display:grid; grid-template-columns: 360px 1fr; gap:16px; padding:16px;">
      <div class="panel" style="padding:14px;">
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

            <collapse-panel title="Imágenes base" [open]="false">
              <div class="field">
                <input class="input" type="file" accept="image/*" multiple
                  (change)="onFilesChange($event, 'img2img')">
                <small style="color:#9ca3af">Podés subir varias imágenes.</small>

                <div style="display:flex; gap:8px; margin-top:8px;">
                  <button class="btn" type="button" (click)="openPicker('img2img')">Elegir de proyectos</button>
                </div>

                <div *ngIf="pickedImgUrls.length>0" style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
                  <div *ngFor="let u of pickedImgUrls" class="panel" style="padding:6px;">
                    <img class="thumb" [src]="u" alt="seleccionada">
                    <div style="display:flex; justify-content:flex-end; margin-top:6px;">
                      <button class="btn" type="button" (click)="removePicked(u)">Quitar</button>
                    </div>
                  </div>
                </div>
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
            <collapse-panel title="Imágenes a mejorar" [open]="true">
              <div class="field">
                <input class="input" type="file" accept="image/*" multiple
                  (change)="onFilesChange($event, 'upscale')">

                <div style="display:flex; gap:8px; margin-top:8px;">
                  <button class="btn" type="button" (click)="openPicker('upscale')">Elegir de proyectos</button>
                </div>

                <div *ngIf="pickedImgUrls.length>0" style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
                  <div *ngFor="let u of pickedImgUrls" class="panel" style="padding:6px;">
                    <img class="thumb" [src]="u" alt="seleccionada">
                    <div style="display:flex; justify-content:flex-end; margin-top:6px;">
                      <button class="btn" type="button" (click)="removePicked(u)">Quitar</button>
                    </div>
                  </div>
                </div>
              </div>
            </collapse-panel>

            <collapse-panel title="Resolución (px)" [open]="true">
              <div class="field">
                <label>Resolución máxima del lado más largo</label>
                <input
                  class="input"
                  type="number"
                  [(ngModel)]="resolution"
                  min="512"
                  max="4000"
                  step="10"
                  placeholder="Ej: 2000"
                >
              </div>
            </collapse-panel>
          </ng-container>

          <!-- ===== MOCKUP ===== -->
          <ng-container *ngSwitchCase="'mockup'">
            <collapse-panel title="Imágenes" [open]="true">
              <div class="field">
                <input class="input" type="file" accept="image/*" multiple
                  (change)="onFilesChange($event, 'mockup')">
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

        <div style="margin-top:12px;">
          <button class="btn primary" style="width:100%; padding:12px;"
            (click)="generate()" [disabled]="!canGenerate() || loading">
            {{ loading ? 'Procesando…' : actionLabel }}
          </button>
        </div>
      </div>

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
export class AIStudioComponent implements OnInit {

  constructor(
    private jobs: JobService,
    private projectsApi: ProjectService
  ) {
    this.apiOrigin = new URL(environment.apiBaseUrl).origin;
  }

  private readonly apiOrigin: string;

  activeTab: HeaderTab = 'studio';

  private projectsByName: Record<string, ProjectDto> = {};
  projects: string[] = [];
  project = '';

  userName = 'Nicolás';
  userAvatarUrl = 'https://i.pravatar.cc/28';

  flow: Flow = 'txt2img';

  prompt = '';
  style = 'Ninguno';
  brand = 'Ninguno';
  product = 'Ninguno';
  width = 768;
  height = 768;
  batch = 4;

  styles = ['Ninguno', 'Realismo', 'Animación', 'Classic'];
  brands = ['Ninguno', 'Hyundai', 'Itaú', 'Marca ejemplo'];

  productsByBrand: Record<string, string[]> = {
    'Ninguno': ['Ninguno'],
    'Hyundai': ['Ninguno', 'Kona', 'Tucson', 'Elantra', 'Santa Fe'],
    'Itaú': ['Ninguno', 'Cuenta', 'Tarjeta', 'Préstamo'],
    'Marca ejemplo': ['Ninguno', 'Producto A', 'Producto B']
  };

  get productOptions() {
    return this.productsByBrand[this.brand] ?? ['Ninguno'];
  }

  onBrandChange(newBrand: string) {
    this.brand = newBrand;
    this.product = 'Ninguno';
  }

  /** IMG→IMG */
  srcImageFiles: File[] = [];

  /** Upscale */
  upImageFiles: File[] = [];
  resolution: number = 2000;

  /** Mockup */
  mockInputFiles: File[] = [];
  mockupTemplates = ['Remera', 'Cartel', 'Mockup iPhone', 'Lona'];
  mockTemplate = 'Remera';
  mockScale = 100;
  mockOffsetX = 0;
  mockOffsetY = 0;

  /** Picker */
  pickerOpen = false;
  pickerContext: 'img2img' | 'upscale' | null = null;

  // ✅ ahora múltiples urls
  pickedImgUrls: string[] = [];

  pickerImagesByProject: Record<string, string[]> = {};

  loading = false;
  images: string[] = [];

  ngOnInit(): void {
    this.loadProjectsAndLibrary();
  }

  get actionLabel() {
    switch (this.flow) {
      case 'txt2img':
      case 'img2img': return 'Generar';
      case 'upscale': return 'Upscale';
      case 'mockup':  return 'Render Mockup';
    }
  }

  private inRange(n: number, min: number, max: number) {
    return n >= min && n <= max;
  }

  onTabChange(tab: HeaderTab) { this.activeTab = tab; }
  onProjectChange(p: string) { this.project = p; }

  openPicker(ctx: 'img2img' | 'upscale') {
    this.pickerContext = ctx;
    this.pickerOpen = true;
  }

  onPick(url: string) {
    if (!this.pickedImgUrls.includes(url)) this.pickedImgUrls.push(url);
    this.pickerOpen = false;
  }

  removePicked(url: string) {
    this.pickedImgUrls = this.pickedImgUrls.filter(x => x !== url);
  }

  onFilesChange(evt: Event, kind: 'img2img' | 'upscale' | 'mockup') {
  const input = evt.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);

  if (kind === 'img2img') this.srcImageFiles = files;
  if (kind === 'upscale') this.upImageFiles = files;
  if (kind === 'mockup')  this.mockInputFiles = files;
}

  private absUrl(u: string): string {
    if (!u) return u;
    try { new URL(u); return u; }
    catch { return `${this.apiOrigin}${u.startsWith('/') ? '' : '/'}${u}`; }
  }

  private toAssetUrls(r: JobResponseDto): string[] {
    return (r.assets ?? []).map(a => this.absUrl(a.url));
  }

  private projectIdFor(name: string) {
    return this.projectsByName[name]?.id ?? '';
  }

  private brandBlock(body: any) {
    const style   = this.style === 'Ninguno' ? null : this.style;
    const brand   = this.brand === 'Ninguno' ? null : this.brand;
    const product = this.product === 'Ninguno' ? null : this.product;
    if (style)   body.style = style;
    if (brand)   body.brand = brand;
    if (product) body.product = product;
  }

  private buildPayloadWithProject(): CreateJobRequestDto {
    const projectId = this.projectIdFor(this.project);
    const base: any = { projectId, flow: this.flow };

    if (this.flow === 'txt2img') {
      const body: any = { ...base, prompt: this.prompt.trim(), width: this.width, height: this.height, batch: this.batch };
      this.brandBlock(body);
      return body;
    }

    if (this.flow === 'img2img') {
      const body: any = { ...base, prompt: this.prompt.trim(), width: this.width, height: this.height, batch: this.batch };
      this.brandBlock(body);
      if (this.pickedImgUrls.length) body.imageUrls = [...this.pickedImgUrls];
      return body;
    }

    if (this.flow === 'upscale') {
      const body: any = { ...base, resolution: this.resolution };
      if (this.pickedImgUrls.length) body.imageUrls = [...this.pickedImgUrls];
      return body;
    }

    return { ...base, template: this.mockTemplate, scale: this.mockScale, offsetX: this.mockOffsetX, offsetY: this.mockOffsetY };
  }

  private hasAnyImage(files: File[]) {
    return (files?.length ?? 0) > 0 || this.pickedImgUrls.length > 0;
  }

  private filesForFlow(): File[] {
    switch (this.flow) {
      case 'img2img': return this.srcImageFiles;
      case 'upscale': return this.upImageFiles;
      case 'mockup':  return this.mockInputFiles;
      default:        return [];
    }
  }

  canGenerate(): boolean {
    if (!this.projectIdFor(this.project)) return false;

    if (this.flow === 'txt2img') {
      return this.prompt.trim().length > 0 &&
             this.inRange(this.width, 256, 1536) &&
             this.inRange(this.height, 256, 1536) &&
             this.inRange(this.batch, 1, 8);
    }

    if (this.flow === 'img2img') {
      return this.hasAnyImage(this.srcImageFiles) &&
             this.prompt.trim().length > 0 &&
             this.inRange(this.width, 256, 1536) &&
             this.inRange(this.height, 256, 1536) &&
             this.inRange(this.batch, 1, 8);
    }

    if (this.flow === 'upscale') {
      return this.hasAnyImage(this.upImageFiles) && this.inRange(this.resolution, 512, 4000);
    }

    if (this.flow === 'mockup') {
      return (this.mockInputFiles.length > 0) && !!this.mockTemplate;
    }

    return false;
  }

  async generate() {
    if (!this.canGenerate()) return;

    this.loading = true;
    this.images = [];

    try {
      const payload = this.buildPayloadWithProject();
      const files = this.filesForFlow();

      const first = await this.jobs.createJob(payload, files).toPromise();
      if (!first) return;

      if (first.id && (first.status === 'QUEUED' || first.status === 'RUNNING')) {
        await new Promise<void>((resolve, reject) => {
          const sub = this.jobs.pollJob(first.id).subscribe({
            next: (r) => {
              if (r.status === 'DONE') {
                this.images = this.toAssetUrls(r);
                sub.unsubscribe();
                resolve();
              } else if (r.status === 'FAILED') {
                alert(r.error ?? 'Error de procesamiento');
                sub.unsubscribe();
                resolve();
              }
            },
            error: (e) => {
              alert(e?.message || 'Error');
              reject(e);
            }
          });
        });
      } else {
        this.images = this.toAssetUrls(first);
      }
    } finally {
      this.loading = false;
    }
  }

  upscale(img: string) {
    alert('Upscale simulado: ' + img);
  }

  private loadProjectsAndLibrary() {
    this.projectsApi.listProjects(0, 50).subscribe({
      next: (page) => {
        const content = page?.content ?? [];
        this.projectsByName = {};
        this.projects = content.map(p => p.name);
        for (const p of content) this.projectsByName[p.name] = p;

        if (this.projects.length === 0) {
          this.project = '';
          this.pickerImagesByProject = {};
          return;
        }

        if (!this.project || !this.projectsByName[this.project]) {
          this.project = this.projects[0];
        }

        const calls = content.map(p =>
          this.projectsApi.listAssets(p.id, 1, 100).pipe(
            catchError(() => of({ items: [], page: 1, size: 100, total: 0 }))
          )
        );

        forkJoin(calls).subscribe(results => {
          const map: Record<string, string[]> = {};
          for (let i = 0; i < content.length; i++) {
            const project = content[i];
            const assets = results[i]?.items ?? [];
            map[project.name] = assets.map(a => this.absUrl(a.url));
          }
          this.pickerImagesByProject = map;
        });
      },
      error: () => {
        this.projects = [];
        this.project = '';
        this.pickerImagesByProject = {};
      }
    });
  }
}
