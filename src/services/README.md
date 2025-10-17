Folder: src/services

Purpose:
Business logic, database operations and integrations. Services should be framework-agnostic and easily testable.

How to add a service:
1. Create `src/services/<name>.service.ts` with a top-file comment.
2. Export functions or a class that encapsulates operations.

Example:
```
export async function createUser(dto: SignupDTO) { /* call User model and return created user */ }
```
