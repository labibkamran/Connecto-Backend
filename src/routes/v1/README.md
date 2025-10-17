Folder: src/routes/v1

Purpose:
Holds routers for API version v1. Keep these routers stable and mount them under `/api/v1` in `src/app.ts` or a central router.

How to add routes:
1. Create a file `src/routes/v1/<resource>.routes.ts`.
2. Import Express `Router` and controller functions from `src/controllers/v1`.
3. Export the router and mount it from `src/app.ts` or `src/routes/index.ts`.

Example:

```ts
import { Router } from 'express'
import * as userController from '../../controllers/v1/user.controller'

const router = Router()
router.post('/signup', userController.signup)
export default router
```

Mounting example in `src/app.ts`:

```ts
import v1UserRoutes from './routes/v1/user.routes'
app.use('/api/v1/users', v1UserRoutes)
```
