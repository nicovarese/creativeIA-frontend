# CreativeIA Frontend — AGENTS.md

## Goal (MVP)
- Register / Login
- Choose project
- Choose a generation type/flow
- Create generation job and poll status
- Display generated images and keep them in a per-project library

## Source of truth (IMPORTANT)
- Do NOT trust README.
- Use the existing code as source of truth:
  - API base URL in `src/environments/**`
  - API calls in `src/app/**/services/**`
  - Request/response models in `src/app/**/models/**`
- Backend must align to the frontend API contract used by these services/models.

## Workspace
Frontend: `./frontend`
Backend: `../backend`

## Deliverables
1) Confirm API base URL and endpoints from existing services (do not invent).
2) Implement auth screens + token storage + interceptor + route guards.
3) Replace any hardcoded projects/library placeholders with real API calls.
4) Ensure generate flow works with polling until DONE/FAILED.
5) Ensure images render correctly (consider auth vs <img> constraints).

## Rules for Codex changes
- Minimal changes; avoid sweeping refactors.
- Keep UI functional and consistent.
- Run `npm test` / `ng build` before finishing.