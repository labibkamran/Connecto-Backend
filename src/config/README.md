Folder: src/config

Purpose:
This folder contains configuration helpers and environment bootstrapping code for the application. Typical files:

- `db.ts` - Database connection helpers (e.g., mongoose connect)
- `index.ts` - Optional consolidated configuration exporter

How to add files:
- Create a new file with a top-file comment that describes the file purpose.
- Export functions that return configured clients or values.

Secrets:
- Use Doppler to provide `MONGO_URI` and other secrets at runtime.
- Locally you can use `.env` for quick testing, but do not commit it.
