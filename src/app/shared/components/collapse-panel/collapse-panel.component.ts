import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'collapse-panel',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .wrap { background:rgba(11,17,29,.92); color:#e5e7eb; border:1px solid #273a57; border-radius:12px; overflow:hidden; }
    .head { display:flex; align-items:center; justify-content:space-between; gap:10px;
            padding:10px 12px; cursor:pointer; user-select:none; transition:background .16s ease; }
    .head:hover { background:#142034; }
    .title { font-weight:700; font-size:14px; letter-spacing:.15px; }
    .chev { transition:transform .18s ease; opacity:.85; }
    .chev.open { transform:rotate(90deg); }
    .body { padding:10px 12px; border-top:1px solid #263652; }
  `],
  template: `
    <div class="wrap">
      <div class="head" (click)="open=!open">
        <div class="title">{{ title }}</div>
        <div class="chev" [class.open]="open">▶</div>
      </div>
      <div class="body" *ngIf="open">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class CollapsePanelComponent {
  @Input() title = '';
  @Input() open = false;  
}
