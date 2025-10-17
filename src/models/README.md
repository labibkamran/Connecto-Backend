Folder: src/models

Purpose:
Mongoose models and schema definitions.

How to add a model:
1. Create `src/models/<name>.model.ts` with a top-file comment.
2. Define a Mongoose schema and export the model.

Example:
```
import { Schema, model } from 'mongoose'
const UserSchema = new Schema({ email: String, password: String })
export default model('User', UserSchema)
```
