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
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

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
    :host { display:block; min-height:100vh; color:#e5e7eb;
      font-family:'Segoe UI Variable', 'Space Grotesk', 'Manrope', sans-serif; }
    .studio-screen { min-height:100vh; background:
      radial-gradient(1200px 500px at 5% -10%, #1e3a8a 0%, transparent 55%),
      radial-gradient(900px 500px at 95% 110%, #14532d 0%, transparent 50%),
      linear-gradient(180deg, #05080f 0%, #070b13 100%); }
    .panel {
      background:rgba(12,18,30,.84);
      color:#e5e7eb;
      border:1px solid #243046;
      border-radius:14px;
      box-shadow:0 10px 28px rgba(0,0,0,.32);
    }
    .btn {
      border:1px solid #31415e;
      border-radius:10px;
      padding:9px 12px;
      background:linear-gradient(180deg, #132034 0%, #101a2b 100%);
      color:#e6edf8;
      font-weight:600;
      transition:all .16s ease;
      cursor:pointer;
    }
    .btn:hover {
      border-color:#46618e;
      transform:translateY(-1px);
      box-shadow:0 8px 16px rgba(0,0,0,.25);
    }
    .btn:disabled {
      opacity:.55;
      cursor:not-allowed;
      transform:none;
      box-shadow:none;
    }
    .primary {
      background:linear-gradient(180deg, #3273ff 0%, #1d4ed8 100%);
      border-color:#1d4ed8;
      color:#f8fbff;
      text-shadow:0 1px 0 rgba(0,0,0,.2);
    }
    .primary:hover { filter:brightness(1.04); }

    .prompt {
      width:100%; box-sizing:border-box; background:#0c1220; color:#e5e7eb;
      border:1px solid #293851; border-radius:10px; padding:12px; resize:none; height:140px; display:block;
    }
    .field { display:flex; flex-direction:column; gap:6px; }
    .input, .select {
      width:100%; box-sizing:border-box; background:#0c1220; color:#e5e7eb;
      border:1px solid #293851; border-radius:10px; padding:10px 12px;
      outline:none;
    }
    .input:focus, .select:focus, .prompt:focus {
      border-color:#3b82f6;
      box-shadow:0 0 0 3px rgba(59,130,246,.2);
    }
    .grid2 { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px; }
    .thumb { margin-top:8px; width:100%; max-width:320px; height:180px; object-fit:cover; border-radius:10px; border:1px solid #2a2f36; }
    .modal-backdrop {
      position:fixed; inset:0; background:rgba(0,0,0,.55);
      display:flex; align-items:center; justify-content:center; z-index:100;
    }
    .modal-card {
      width:min(460px, calc(100vw - 24px)); background:#111722; border:1px solid #2a2f36;
      border-radius:12px; padding:18px; color:#e5e7eb; box-shadow:0 20px 45px rgba(0,0,0,.4);
    }
    .modal-title { margin:0; font-size:18px; font-weight:700; }
    .modal-subtitle { margin:6px 0 14px; color:#9ca3af; font-size:13px; }
    .job-card {
      border:1px solid #2d4060;
      border-radius:12px;
      padding:12px;
      margin-bottom:12px;
      background:rgba(9,15,26,.75);
    }
    .job-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }
    .job-id { font-size:12px; color:#95a5c2; }
    .job-badge {
      font-size:11px; letter-spacing:.2px; text-transform:uppercase;
      border:1px solid #2f4466; border-radius:999px; padding:3px 9px; color:#cde0ff; background:#132237;
    }
    .job-progress-track {
      width:100%; height:8px; border-radius:999px; background:#0e1728; border:1px solid #273b59; overflow:hidden;
    }
    .job-progress-value {
      height:100%;
      background:linear-gradient(90deg, #3b82f6, #10b981);
      transition:width .4s ease;
    }
    .job-meta { margin-top:8px; color:#9fb0ca; font-size:12px; }
    .job-error { margin-top:8px; color:#fecaca; background:#3f1d20; border:1px solid #7f1d1d; border-radius:8px; padding:8px 10px; font-size:12px; }
  `],
  template: `
  <div class="studio-screen">
    <app-header
      [activeTab]="activeTab"
      [projects]="projects"
      [project]="project"
      [userName]="userName"
      [userAvatarUrl]="userAvatarUrl"
      (tabChange)="onTabChange($event)"
      (projectChange)="onProjectChange($event)"
      (createProject)="openCreateProjectModal()"
      (profile)="onProfile()"
      (settings)="onSettings()"
      (logout)="onLogout()">
    </app-header>

    <div style="display:grid; grid-template-columns: 360px 1fr; gap:16px; padding:16px; align-items:start;">
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
        <div class="job-card" *ngIf="currentJob">
          <div class="job-head">
            <strong>Generacion en curso</strong>
            <span class="job-badge">{{ phaseLabel(currentJob.phase) }}</span>
          </div>
          <div class="job-id">Job {{ currentJob.id }}</div>
          <div class="job-progress-track" style="margin-top:8px;">
            <div class="job-progress-value" [style.width.%]="currentJob.progress ?? 0"></div>
          </div>
          <div class="job-meta">
            Estado: {{ currentJob.status }} - Progreso: {{ currentJob.progress ?? 0 }}%
          </div>
          <div class="job-error" *ngIf="currentJob.status === 'FAILED'">{{ currentJob.error || 'Fallo la generacion' }}</div>
        </div>
        <div *ngIf="images.length===0" style="opacity:.72; padding:18px; border:1px dashed #31415e; border-radius:12px;">
          Tus resultados aparecerán acá.
        </div>
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

    <div class="modal-backdrop" *ngIf="createProjectOpen" (click)="closeCreateProjectModal()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <h3 class="modal-title">Crear proyecto</h3>
        <p class="modal-subtitle">Elegí un nombre para organizar tus generaciones y assets.</p>
        <div class="field">
          <label>Nombre del proyecto</label>
          <input
            class="input"
            type="text"
            [(ngModel)]="newProjectName"
            (keyup.enter)="createProjectFromModal()"
            maxlength="120"
            placeholder="Ej: Campaña marzo"
            autofocus
          >
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button class="btn" type="button" (click)="closeCreateProjectModal()">Cancelar</button>
          <button class="btn primary" type="button" (click)="createProjectFromModal()" [disabled]="creatingProject">
            {{ creatingProject ? 'Creando…' : 'Crear proyecto' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AIStudioComponent implements OnInit {

  constructor(
    private jobs: JobService,
    private projectsApi: ProjectService,
    private auth: AuthService,
    private router: Router
  ) {
    this.apiOrigin = new URL(environment.apiBaseUrl).origin;
  }

  private readonly apiOrigin: string;

  activeTab: HeaderTab = 'studio';

  private projectsByName: Record<string, ProjectDto> = {};
  projects: string[] = [];
  project = '';

  userName = 'Usuario';
  userAvatarUrl = 'https://i.pravatar.cc/28';
  createProjectOpen = false;
  newProjectName = '';
  creatingProject = false;

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
  currentJob: JobResponseDto | null = null;

  ngOnInit(): void {
    this.loadCurrentUser();
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
  openCreateProjectModal() {
    this.newProjectName = '';
    this.createProjectOpen = true;
  }

  phaseLabel(phase?: string | null): string {
    switch ((phase ?? '').toUpperCase()) {
      case 'QUEUED': return 'En cola';
      case 'PREPARING': return 'Preparando';
      case 'GENERATING': return 'Generando';
      case 'STORING': return 'Guardando';
      case 'DONE': return 'Completado';
      case 'FAILED': return 'Fallo';
      default: return 'Procesando';
    }
  }

  closeCreateProjectModal() {
    this.createProjectOpen = false;
    this.newProjectName = '';
    this.creatingProject = false;
  }

  createProjectFromModal() {
    const cleanName = this.newProjectName.trim();
    if (!cleanName || this.creatingProject) return;

    this.creatingProject = true;
    this.projectsApi.createProject(cleanName).subscribe({
      next: (created) => {
        this.closeCreateProjectModal();
        this.loadProjectsAndLibrary(created.name);
      },
      error: (e) => {
        this.creatingProject = false;
        alert(e?.error?.message || 'No se pudo crear el proyecto');
      }
    });
  }

  onProfile() {
    alert('Mi perfil: pendiente de implementar');
  }

  onSettings() {
    alert('Configuraciones: pendiente de implementar');
  }

  onLogout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

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
    // El job siempre debe salir con UUID real del proyecto seleccionado.
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
    this.currentJob = null;

    try {
      const payload = this.buildPayloadWithProject();
      const files = this.filesForFlow();

      const first = await this.jobs.createJob(payload, files).toPromise();
      if (!first) return;
      this.currentJob = first;

      if (first.id && (first.status === 'QUEUED' || first.status === 'RUNNING')) {
        await new Promise<void>((resolve, reject) => {
          const sub = this.jobs.pollJob(first.id).subscribe({
            next: (r) => {
              this.currentJob = r;
              if (r.status === 'DONE') {
                this.images = this.toAssetUrls(r);
                sub.unsubscribe();
                resolve();
              } else if (r.status === 'FAILED') {
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
        this.currentJob = first;
        this.images = this.toAssetUrls(first);
      }
    } finally {
      this.loading = false;
    }
  }

  upscale(img: string) {
    alert('Upscale simulado: ' + img);
  }

  private loadProjectsAndLibrary(preferProjectName?: string) {
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

        if (preferProjectName && this.projectsByName[preferProjectName]) {
          this.project = preferProjectName;
        } else if (!this.project || !this.projectsByName[this.project]) {
          this.project = this.projects[0];
        }

        // Precargamos assets por proyecto para alimentar el picker sin placeholders.
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

  private loadCurrentUser() {
    this.auth.me().subscribe({
      next: (user) => {
        const emailName = (user.email ?? '').split('@')[0]?.trim();
        this.userName = emailName || 'Usuario';
        this.userAvatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(this.userName)}`;
      }
    });
  }
}
