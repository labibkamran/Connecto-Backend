Folder: src/utils

Purpose:
Small, focused utility functions used across the app (hashing, formatting, helpers).

How to add utilities:
- Create `src/utils/<name>.ts` with a top-file comment and export the functions.
- Keep utilities small and focused; prefer pure functions for ease of testing.

Example:
```
export function formatDate(date: Date): string { return date.toISOString() }
```
