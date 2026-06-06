import { Routes } from '@angular/router';
import { AIStudioComponent } from './features/studio/ai-studio.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'studio', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'studio', component: AIStudioComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'studio' },
];
