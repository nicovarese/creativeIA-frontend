// src/app/material.module.ts
import { NgModule } from '@angular/core';                 // Para crear un módulo de Angular
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

const EXPORTED = [                                       // Lista única de módulos de Material que usamos
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatSnackBarModule,
  MatProgressBarModule,
  MatTableModule
];

@NgModule({
  exports: EXPORTED                                      // Cualquier módulo que importe MaterialModule recibe estos exports
})
export class MaterialModule {}
