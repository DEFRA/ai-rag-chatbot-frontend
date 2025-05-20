import { createServer } from '~/src/server/index.js'
import { statusCodes } from '~/src/server/common/constants/status-codes.js'

describe('#aboutController', () => {
  /** @type {Server} */
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  // FRONTEND TEST: This checks the /about route on the frontend server (localhost:3000)
  test('Should provide expected response from frontend /about route (localhost:3000)', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/about'
    })

    expect(result).toEqual(expect.stringContaining('About |'))
    expect(statusCode).toBe(statusCodes.ok)
  })

  // FRONTEND TEST: This checks that the frontend returns 400 for missing query before calling the backend
  test('Should return 400 for missing query in POST /api/chat (frontend validation)', async () => {
    const { statusCode, result } = await server.inject({
      method: 'POST',
      url: '/api/chat',
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.badRequest)
    expect(result).toContain('Bad Request')
    expect(result).toMatch(/400/)
  })

  // FRONTEND TEST: This checks that the frontend returns 400 for empty query before calling the backend
  test('Should return 400 for empty query in POST /api/chat (frontend validation)', async () => {
    const { statusCode, result } = await server.inject({
      method: 'POST',
      url: '/api/chat',
      payload: { query: '' }
    })
    expect(statusCode).toBe(statusCodes.badRequest)
    expect(result).toContain('Bad Request')
    expect(result).toMatch(/400/)
  })

  // BACKEND TESTS: To test backend (localhost:8085) validation, use integration tests or API tests that hit the backend directly.
  // These are not included here as this file is for frontend route/controller tests.
})

/**
 * @import { Server } from '@hapi/hapi'
 */
