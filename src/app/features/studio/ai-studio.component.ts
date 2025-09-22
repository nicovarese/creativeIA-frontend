import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    .selected { outline:1px solid #3b82f6; }

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
      resize:none;
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
    <!-- Top bar -->
    <div class="topbar" style="display:flex; align-items:center; justify-content:space-between; padding:10px 16px; border-bottom:1px solid #2a2f36;">
      <div style="display:flex; align-items:center; gap:12px;">
        <strong>AI Studio</strong>
        <div class="chip">Create</div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <div class="chip">400</div>
        <div class="chip">NV</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 360px 1fr; gap:16px; padding:16px;">
      <!-- LEFT: controls -->
      <div class="panel" style="padding:14px;">
        <h3 style="margin:0 0 8px 0;">Generate Image</h3>

        <!-- Prompt -->
        <textarea [(ngModel)]="prompt" class="prompt"
          placeholder="Escribí el prompt (ej: retrato realista, luz suave, 50mm, fondo bokeh)"></textarea>

        <!-- Style -->
        <div class="panel" style="padding:10px; margin-top:10px;">
          <div class="field">
            <label>Estilo</label>
            <select class="select" [(ngModel)]="style">
              <option *ngFor="let s of styles" [value]="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <!-- Brand -->
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
            <label>Cantidad de imágenes</label>
            <input class="input" type="number" [(ngModel)]="batch" min="1" max="8" step="1">
          </div>
        </div>

        <!-- Generate -->
        <div style="margin-top:12px;">
          <button class="btn primary" style="width:100%; padding:12px;"
            (click)="generate()" [disabled]="!canGenerate() || loading">
            {{ loading ? 'Generating…' : 'Generate' }}
          </button>
        </div>
      </div>

      <!-- RIGHT: results -->
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
  // Form
  prompt = '';
  style = 'Ninguno';
  brand = 'Ninguno';
  width = 1024;
  height = 1024;
  batch = 4;

  // Data
  styles = ['Ninguno', 'Realismo', 'Animación', 'Classic'];
  brands = ['Ninguno', 'Itaú', 'Marca ejemplo'];

  // State
  loading = false;
  images: string[] = [];

  canGenerate() {
    const okPrompt = this.prompt.trim().length > 0;
    const okW = this.width >= 256 && this.width <= 1536;
    const okH = this.height >= 256 && this.height <= 1536;
    const okB = this.batch >= 1 && this.batch <= 8;
    return okPrompt && okW && okH && okB;
  }

  /** arma el payload omitiendo campos en 'Ninguno' */
  private buildPayload() {
    const body: any = {
      prompt: this.prompt.trim(),
      width: this.width,
      height: this.height,
      batch: this.batch,
    };
    if (this.style !== 'Ninguno') body.style = this.style;   // p.ej. 'Realismo'
    if (this.brand !== 'Ninguno') body.brand = this.brand;   // p.ej. 'Itaú'
    return body;
  }

  async generate() {
    if (!this.canGenerate()) return;
    this.loading = true;
    try {
      const payload = this.buildPayload();

      // TODO: reemplazar simulación por tu POST /v1/jobs
      // Ejemplo:
      // const { jobId } = await this.http.post<{jobId:string}>('/v1/jobs', payload).toPromise();
      // const final = await this.pollJob(jobId).toPromise();
      // this.images = final.images?.map(i => i.url) ?? [];

      // Simulación:
      await new Promise(r => setTimeout(r, 800));
      this.images = Array.from({ length: this.batch }).map((_, i) =>
        `https://picsum.photos/seed/${encodeURIComponent(
          (payload.prompt || 'prompt') +
          '-' + (payload.style ?? 'none') +
          '-' + (payload.brand ?? 'none') +
          '-' + i
        )}/${this.width}/${this.height}`
      );

      console.log('payload enviado:', payload); // para que veas que style/brand se omiten
    } finally {
      this.loading = false;
    }
  }

  upscale(img: string) {
    alert('Upscale (simulado) para: ' + img);
  }
}