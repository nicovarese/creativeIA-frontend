# CreativeIA Frontend

Frontend Angular 20 para auth, studio y biblioteca por proyecto.

## Estado Actual (PR1 + PR2)

- Auth:
  - pantalla `/register`
  - pantalla `/login`
  - guard para `/studio`
  - interceptor `Authorization: Bearer <token>`
- Studio:
  - carga proyectos reales desde backend
  - usa `projectId` real (UUID) al crear jobs
  - picker de imágenes carga assets reales por proyecto
  - placeholders de proyectos/biblioteca removidos

## Requisitos

- Node 20.x recomendado
- npm 10.x

## Configuración API

Archivo: `src/environments/environment.ts`

- `apiBaseUrl: 'http://localhost:8080/v1'`

## Instalación

```bash
npm install
```

## Build

```bash
npm run build
```

## Run (dev server)

```bash
npm run start -- --host 127.0.0.1 --port 4200
```

Frontend queda en `http://127.0.0.1:4200`.

## Limpieza de cache (si aparece error de Vite/esbuild)

```bash
rm -rf node_modules/.vite
rm -rf .angular/cache
npm install
```

En PowerShell:

```powershell
Remove-Item -Recurse -Force .\node_modules\.vite
Remove-Item -Recurse -Force .\.angular\cache
npm install
```

## Checklist manual PR2 en UI

1. Ir a `/register` y crear usuario.
2. Verificar redirección a `/studio`.
3. Recargar página; confirmar que sigue autenticado (token en localStorage).
4. En header, confirmar que el selector de proyectos muestra los proyectos del usuario.
5. Cambiar de proyecto; abrir picker de imágenes (`Elegir de proyectos`) en `img2img` o `upscale`.
6. Confirmar que el picker muestra assets del proyecto actual (no placeholders de picsum).
7. Si no hay proyectos: botón `Generar` debe quedar deshabilitado.
8. En DevTools Network, confirmar `Authorization: Bearer ...` en:
   - `GET /v1/projects`
   - `GET /v1/projects/{id}/assets`

## Notas

- Este PR no cambia diseño visual ni flujo de comfy.
- La validación de generación completa depende de backend jobs/comfy.

## Resumen de implementación (esta rama)

- PR1:
  - pantallas `/login` y `/register`
  - guard para proteger `/studio`
  - `AuthService` con storage de token
  - interceptor para enviar `Authorization: Bearer <token>`
  - bootstrap corregido para usar `app.config` (y aplicar interceptor real)
  - manejo de `401` en interceptor:
    - limpia token
    - redirige a `/login`
- PR2:
  - integración de proyectos reales:
    - `GET /v1/projects`
    - `POST /v1/projects`
  - integración de biblioteca real por proyecto:
    - `GET /v1/projects/{id}/assets`
  - `studio` deja de usar placeholders de proyectos/imagenes
  - `projectId` real (UUID) en payload de generación
  - botón `Nuevo proyecto` en header:
    - crea proyecto
    - refresca selector y assets del picker
