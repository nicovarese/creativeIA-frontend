import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'collapse-panel',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .wrap { background:#111316; color:#e5e7eb; border:1px solid #2a2f36; border-radius:8px; overflow:hidden; }
    .head { display:flex; align-items:center; justify-content:space-between; gap:10px;
            padding:10px 12px; cursor:pointer; user-select:none; }
    .head:hover { background:#151a20; }
    .title { font-weight:600; }
    .chev { transition:transform .18s ease; opacity:.85; }
    .chev.open { transform:rotate(90deg); }
    .body { padding:10px 12px; border-top:1px solid #2a2f36; }
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
