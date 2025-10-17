Folder: src/interfaces

Purpose:
Place TypeScript interfaces, types and DTO definitions here.

How to add types:
- Create a new file `src/interfaces/<name>.ts` and export interfaces or types.
- Prefer small, focused interfaces for request/response DTOs.

Example:
```
export interface SignupDTO {
  email: string
  password: string
}
```
