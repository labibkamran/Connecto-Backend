Folder: src/middleware

Purpose:
Express middleware functions live here (authentication, authorization, validation, error handlers).

How to add middleware:
- Create `src/middleware/<name>.ts` and export the middleware function.
- Register middleware in routers or `src/app.ts`.

Example middleware exports:
```
export function requireAuth(req, res, next) { /* ... */ }
```
