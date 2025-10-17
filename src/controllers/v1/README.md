Folder: src/controllers/v1

Purpose:
Contains version 1 controllers. Keep these stable and extend functionality in new versions when breaking changes are needed.

How to add endpoints:
1. Add a controller file `src/controllers/v1/<resource>.controller.ts` with a top-file comment.
2. Implement handler functions and export them.
3. Add routes in `src/routes/v1.routes.ts` (or in a centralized router) and mount at `/api/v1`.

Example:
```
// src/controllers/v1/auth.controller.ts
export async function signup(req, res) { /* ... */ }
```
