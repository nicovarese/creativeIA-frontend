import { Routes } from '@angular/router';
import { AIStudioComponent } from './features/studio/ai-studio.component';

export const routes: Routes = [
  { path: '', redirectTo: 'studio', pathMatch: 'full' },
  { path: 'studio', component: AIStudioComponent },
  { path: '**', redirectTo: 'studio' },
];
