Folder: src/routes/v2

Purpose:
Holds routers for API version v2. Use this folder for breaking changes or redesigned endpoints.

How to add routes:
1. Create `src/routes/v2/<resource>.routes.ts`.
2. Import controllers from `src/controllers/v2` and bind handlers.
3. Mount v2 routes at `/api/v2`.

Example:

```ts
import { Router } from 'express'
import * as userController from '../../controllers/v2/user.controller'

const router = Router()
router.post('/signup', userController.signup)
export default router
```

Notes:
- Keep `v1` stable and add new features to `v2` when you need to change request/response shapes.
- Consider feature-flagging or gradual rollouts for important changes.
