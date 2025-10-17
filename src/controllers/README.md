Folder: src/controllers

Purpose:
Controllers handle HTTP requests and translate them into service calls. Keep controllers thin — most business logic should live in `src/services`.

Versioning:
- Place versioned controllers in subfolders, e.g. `src/controllers/v1/`, `src/controllers/v2/`.
- Each version directory exports routers or controller functions. Route registration should select the versioned router under `src/routes`.

Example structure:

```
src/controllers/
  v1/
    user.controller.ts
    auth.controller.ts
  v2/
    user.controller.ts
```

How to add a controller:
1. Create `src/controllers/v1/<name>.controller.ts` with a top-file comment describing the controller.
2. Export handler functions, e.g. `export async function signup(req, res) {}`.
3. In `src/routes`, create or update a router to mount the versioned controllers, for example mount `src/controllers/v1` at `/api/v1`.

Compatibility rules:
- v1 stays stable. v2 can change request/response shapes.
- If a breaking change is required, put it in a new version directory and update the routes mapping.
