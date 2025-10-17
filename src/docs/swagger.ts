/*
  src/docs/swagger.ts
  Purpose: Build the OpenAPI specification and provide an Express router that serves Swagger UI and the spec JSON.
*/

import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()

const spec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend API',
      version: process.env.npm_package_version || '1.0.0',
      description: 'Auto-generated API documentation'
    },
    servers: [
      { url: `http://localhost:${process.env.PORT}` }
    ],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { status: { type: 'string' } } }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: []
})

router.use('/', swaggerUi.serve, swaggerUi.setup(spec))

router.get('/spec.json', (_req, res) => {
  res.json(spec)
})

export default router
