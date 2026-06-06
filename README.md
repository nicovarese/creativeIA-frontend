# CreativeIA Frontend

Aplicación Angular para autenticación, Studio de generación de imágenes, gestión de proyectos y biblioteca por usuario.

## 1. Stack

- Angular 20 (standalone components)
- TypeScript 5.9
- RxJS 7.8
- Angular Router + HttpClient

## 2. Qué cubre hoy

- Auth UI:
  - `/login`
  - `/register`
- Protección de rutas:
  - `authGuard` para `/studio`
- Auth token:
  - interceptor `Authorization: Bearer <token>`
- Studio:
  - selección de proyecto real (backend)
  - creación de proyecto (modal)
  - generación por flows (`txt2img`, `img2img`, `upscale`, `mockup`)
  - card de progreso del job (`status`, `phase`, `progress`)
  - render de resultados y picker de assets por proyecto

## 3. Requisitos

- Node.js 20.x recomendado
- npm 10.x recomendado

## 4. Configuración

Archivo: `src/environments/environment.ts`

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/v1'
};
```

## 5. Instalación y ejecución

Instalar dependencias:

```bash
npm install
```

Levantar dev server:

```bash
npm start -- --host 127.0.0.1 --port 4200
```

URL:

- `http://127.0.0.1:4200`

Build:

```bash
npm run build
```

## 6. Flujo recomendado de prueba manual

1. Registrarse en `/register`.
2. Login en `/login`.
3. Entrar a `/studio` (guard activo).
4. Crear proyecto desde el botón `Nuevo proyecto`.
5. Generar imagen en `txt2img`.
6. Verificar en UI:
   - aparece card de job
   - cambia `phase`
   - avanza `progress`
   - al completar aparecen resultados
7. Verificar en DevTools:
   - llamadas a `:8080`
   - header `Authorization: Bearer ...`

## 7. Estructura clave

- `src/app/features/auth/*`: login/register
- `src/app/features/studio/ai-studio.component.ts`: Studio principal
- `src/app/core/services/auth.service.ts`: auth API + token storage
- `src/app/core/services/job.service.ts`: create/poll de jobs
- `src/app/core/services/project.service.ts`: proyectos/assets
- `src/app/core/interceptors/auth.interceptor.ts`: bearer token
- `src/app/core/guards/auth.guard.ts`: protección de rutas

## 8. Contrato frontend-backend usado en Studio

### Crear job

- `POST /v1/generate`
  - JSON o multipart (`payload` + `image[]`)

### Estado job

- `GET /v1/jobs/{id}`

Campos usados por UI:

- `status`
- `phase`
- `progress`
- `assets`
- `error`

### Proyectos y assets

- `GET /v1/projects`
- `POST /v1/projects`
- `GET /v1/projects/{projectId}/assets`

## 9. Troubleshooting

- Error Vite/esbuild `spawn EPERM` o optimize deps:
  - borrar cache y reinstalar:

```powershell
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\.angular\cache -ErrorAction SilentlyContinue
npm install
npm run build
```

- 401 en Studio:
  - borrar token (`localStorage.auth_token`) y reloguear.
- CORS:
  - usar `127.0.0.1:4200` o `localhost:4200` según lo permitido en backend.

## 10. Criterios de UI actuales

- Estética consistente entre login/register/studio.
- Header integrado con fondo de la app (sin corte visual).
- Feedback explícito durante generación (no solo spinner).
- Estados de error visibles y accionables.
