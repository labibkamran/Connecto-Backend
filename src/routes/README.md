Folder: src/routes

Purpose:
Route registration and routers. Centralize route mounting here.

How to add routes:
1. Create a router file `src/routes/<name>.routes.ts`.
2. Import controllers from the appropriate versioned folder and bind handlers.
3. In `src/app.ts`, import and mount the routers.

Versioning example:
- `src/routes/v1.routes.ts` mounts controllers from `src/controllers/v1` at `/api/v1`.
