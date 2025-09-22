import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Flow = 'txt2img' | 'img2img' | 'upscale' | 'mockup';

@Component({
  selector: 'ai-studio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .panel { background:#111316; color:#e5e7eb; border:1px solid #2a2f36; border-radius:8px; }
    .divider { border-top:1px solid #2a2f36; }
    .btn { border:1px solid #2a2f36; border-radius:8px; padding:8px 10px; background:#1a1f24; color:#e5e7eb; }
    .btn:hover { background:#232931; }
    .primary { background:#2563eb; border-color:#2563eb; }
    .primary:hover { filter:brightness(1.05); }
    .chip { font-size:12px; padding:2px 6px; border-radius:6px; background:#0b1220; border:1px solid #2a2f36; }

    .topbar { color:#e5e7eb; }
    .topbar strong { color:#f9fafb; font-weight:700; }

    .prompt {
      width:100%;
      box-sizing:border-box;
      background:#0f1317;
      color:#e5e7eb;
      border:1px solid #2a2f36;
      border-radius:8px;
      padding:10px;
      resize:none;         /* fijo, sin “estirar” */
      height:140px;
      display:block;
    }

    .field { display:flex; flex-direction:column; gap:6px; }
    .input, .select {
      width:100%;
      box-sizing:border-box;
      background:#0f1317;
      color:#e5e7eb;
      border:1px solid #2a2f36;
      border-radius:8px;
      padding:8px 10px;
    }
    .grid2 { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px; }
  `],
  template: `
  <div style="min-height:100vh; background:#0b0e12;">
    <!-- Header -->
    <div class="topbar" style="display:flex; align-items:center; justify-content:space-between; padding:10px 16px; border-bottom:1px solid #2a2f36;">
      <div style="display:flex; align-items:center; gap:12px;">
        <strong>AI Studio</strong>
        <div class="chip">Create</div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <div class="chip">Proyecto demo</div>
        <div class="chip">Créditos: 400</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 360px 1fr; gap:16px; padding:16px;">
      <!-- LEFT: controls -->
      <div class="panel" style="padding:14px;">
        <h3 style="margin:0 0 8px 0;">Studio</h3>

        <!-- Selector de Flujo -->
        <div class="panel" style="padding:10px; margin-bottom:10px;">
          <div class="field">
            <label>Flujo</label>
            <select class="select" [(ngModel)]="flow">
              <option value="txt2img">Texto a Imágen</option>
              <option value="img2img">Imágen a Imágen</option>
              <option value="upscale">Upscale</option>
              <option value="mockup">Mockup</option>
            </select>
          </div>
        </div>

        <!-- Formularios dinámicos -->
        <div [ngSwitch]="flow">

          <!-- ===== TXT → IMG ===== -->
          <ng-container *ngSwitchCase="'txt2img'">
            <textarea [(ngModel)]="prompt" class="prompt"
              placeholder="Escribí el prompt (ej: retrato realista, luz suave, 50mm, fondo bokeh)"></textarea>

            <!-- Estilo -->
            <div class="panel" style="padding:10px; margin-top:10px;">
              <div class="field">
                <label>Estilo</label>
                <select class="select" [(ngModel)]="style">
                  <option *ngFor="let s of styles" [value]="s">{{ s }}</option>
                </select>
              </div>
            </div>

            <!-- Marca -->
            <div class="panel" style="padding:10px; margin-top:10px;">
              <div class="field">
                <label>Marca</label>
                <select class="select" [(ngModel)]="brand">
                  <option *ngFor="let b of brands" [value]="b">{{ b }}</option>
                </select>
              </div>
            </div>

            <!-- Size + Batch -->
            <div class="panel" style="padding:10px; margin-top:10px;">
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
            </div>
          </ng-container>

          <!-- ===== IMG → IMG ===== -->
          <ng-container *ngSwitchCase="'img2img'">
            <div class="panel" style="padding:10px;">
              <div class="field">
                <label>Imagen base</label>
                <input class="input" type="file" accept="image/*"
                  (change)="srcImageFile = $event.target.files?.[0] || undefined">
                <small style="color:#9ca3af">Usá una imagen de referencia.</small>
              </div>
            </div>

            <!-- Estilo -->
            <div class="panel" style="padding:10px; margin-top:10px;">
              <div class="field">
                <label>Estilo</label>
                <select class="select" [(ngModel)]="style">
                  <option *ngFor="let s of styles" [value]="s">{{ s }}</option>
                </select>
              </div>
            </div>

            <!-- Marca -->
            <div class="panel" style="padding:10px; margin-top:10px;">
              <div class="field">
                <label>Marca</label>
                <select class="select" [(ngModel)]="brand">
                  <option *ngFor="let b of brands" [value]="b">{{ b }}</option>
                </select>
              </div>
            </div>

            <!-- Strength -->
            <div class="panel" style="padding:10px; margin-top:10px;">
              <div class="field">
                <label>Fuerza de referencia (0–1)</label>
                <input class="input" type="number" [(ngModel)]="strength" min="0" max="1" step="0.05">
              </div>
            </div>

            <!-- Size + Batch -->
            <div class="panel" style="padding:10px; margin-top:10px;">
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
            </div>
          </ng-container>

          <!-- ===== UPSCALE ===== -->
          <ng-container *ngSwitchCase="'upscale'">
            <div class="panel" style="padding:10px;">
              <div class="field">
                <label>Imagen a mejorar</label>
                <input class="input" type="file" accept="image/*"
                  (change)="upImageFile = $event.target.files?.[0] || undefined">
              </div>
              <div class="field" style="margin-top:10px;">
                <label>Factor</label>
                <select class="select" [(ngModel)]="upFactor">
                  <option [ngValue]="2">2×</option>
                  <option [ngValue]="4">4×</option>
                </select>
              </div>
            </div>
          </ng-container>

          <!-- ===== MOCKUP ===== -->
          <ng-container *ngSwitchCase="'mockup'">
            <div class="panel" style="padding:10px;">
              <div class="field">
                <label>Imagen creativa</label>
                <input class="input" type="file" accept="image/*"
                  (change)="mockInputFile = $event.target.files?.[0] || undefined">
              </div>
              <div class="field" style="margin-top:10px;">
                <label>Plantilla</label>
                <select class="select" [(ngModel)]="mockTemplate">
                  <option *ngFor="let t of mockupTemplates" [value]="t">{{ t }}</option>
                </select>
              </div>
              <div class="grid2" style="margin-top:10px;">
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
            </div>
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
                 [style.width.px]="width"
                 [style.height.px]="height"
                 style="width:100%; height:260px; object-fit:cover; border-radius:6px;">
            <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:6px;">
              <button class="btn" (click)="upscale(img)">Mejorar</button>
              <a class="btn" [href]="img" target="_blank">Abrir</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AIStudioComponent {
  // Flujo actual
  flow: Flow = 'txt2img';

  // Compartidos (txt2img / img2img)
  prompt = '';
  style = 'Ninguno';
  brand = 'Ninguno';
  width = 768;
  height = 768;
  batch = 4;

  // Datos (mock; luego vendrán del backend)
  styles = ['Ninguno', 'Realismo', 'Animación', 'Classic'];
  brands = ['Ninguno', 'Itaú', 'Marca ejemplo'];
  mockupTemplates = ['Remera', 'Cartel', 'Mockup iPhone', 'Lona'];

  // IMG→IMG
  srcImageFile?: File;
  strength = 0.6;

  // Upscale
  upImageFile?: File;
  upFactor: 2 | 4 = 2;

  // Mockup
  mockInputFile?: File;
  mockTemplate = 'Remera';
  mockScale = 100;
  mockOffsetX = 0;
  mockOffsetY = 0;

  // Estado
  loading = false;
  images: string[] = [];

  get actionLabel() {
    switch (this.flow) {
      case 'txt2img': return 'Generar';
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
      return !!this.srcImageFile
        && this.inRange(this.strength, 0, 1)
        && this.inRange(this.width, 256, 1536)
        && this.inRange(this.height, 256, 1536)
        && this.inRange(this.batch, 1, 8);
    }
    if (this.flow === 'upscale') {
      return !!this.upImageFile && (this.upFactor === 2 || this.upFactor === 4);
    }
    if (this.flow === 'mockup') {
      return !!this.mockInputFile && !!this.mockTemplate;
    }
    return false;
  }

  private inRange(n: number, min: number, max: number) {
    return n >= min && n <= max;
  }

  // Arma payloads distintos por flujo (omitiendo style/brand si son "Ninguno")
  private buildPayload() {
    if (this.flow === 'txt2img') {
      const body: any = {
        flow: 'txt2img',
        prompt: this.prompt.trim(),
        width: this.width,
        height: this.height,
        batch: this.batch,
      };
      if (this.style !== 'Ninguno') body.style = this.style;
      if (this.brand !== 'Ninguno') body.brand = this.brand;
      return body;
    }

    if (this.flow === 'img2img') {
      const body: any = {
        flow: 'img2img',
        // imagen: adjuntar como base64 o multipart en la llamada real
        strength: this.strength,
        width: this.width,
        height: this.height,
        batch: this.batch,
      };
      if (this.style !== 'Ninguno') body.style = this.style;
      if (this.brand !== 'Ninguno') body.brand = this.brand;
      return body;
    }

    if (this.flow === 'upscale') {
      return {
        flow: 'upscale',
        // imagen: adjuntar en la llamada real
        factor: this.upFactor,
      };
    }

    // mockup
    return {
      flow: 'mockup',
      // imagen: adjuntar en la llamada real
      template: this.mockTemplate,
      scale: this.mockScale,
      offsetX: this.mockOffsetX,
      offsetY: this.mockOffsetY,
    };
  }

  async generate() {
    if (!this.canGenerate()) return;
    this.loading = true;
    try {
      const payload = this.buildPayload();
      console.log('payload:', payload);

      // 🔸 Simulación por flujo (reemplazar por llamadas reales)
      if (this.flow === 'txt2img') {
        await new Promise(r => setTimeout(r, 700));
        this.images = Array.from({ length: this.batch }).map((_, i) =>
          `https://picsum.photos/seed/${encodeURIComponent(
            (payload as any).prompt + '-' + ((payload as any).style ?? 'none') + '-' + ((payload as any).brand ?? 'none') + '-' + i
          )}/${this.width}/${this.height}`
        );
        return;
      }

      if (this.flow === 'img2img') {
        await new Promise(r => setTimeout(r, 700));
        const seedBase = this.srcImageFile?.name ?? 'img2img';
        this.images = Array.from({ length: this.batch }).map((_, i) =>
          `https://picsum.photos/seed/${encodeURIComponent(seedBase + '-' + this.strength + '-' + i)}/${this.width}/${this.height}`
        );
        return;
      }

      if (this.flow === 'upscale') {
        await new Promise(r => setTimeout(r, 600));
        const base = 512 * this.upFactor; // demo
        this.images = [
          `https://picsum.photos/seed/${encodeURIComponent('up-' + (this.upImageFile?.name ?? 'image'))}/${base}/${base}`
        ];
        return;
      }

      // mockup
      await new Promise(r => setTimeout(r, 700));
      this.images = [
        `https://picsum.photos/seed/${encodeURIComponent('mock-' + this.mockTemplate + '-' + this.mockScale)}/${this.width}/${this.height}`
      ];

    } finally {
      this.loading = false;
    }
  }

  upscale(img: string) {
    // Placeholder de acción sobre cada resultado
    alert('Upscale (simulado) para: ' + img);
  }
}
