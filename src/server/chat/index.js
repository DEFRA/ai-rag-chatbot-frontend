import { chatController } from '~/src/server/chat/controller.js'
import { v4 as uuidv4 } from 'uuid'

/**
 * Sets up the routes used in the /chat page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const chat = {
  plugin: {
    name: 'chat',
    register(server) {
      server.ext('onPreHandler', (request, h) => {
        const cookieName = 'chat_user_id'
        let userId = request.state[cookieName]
        if (!userId) {
          // Generate a new user ID if it doesn't exist
          userId = uuidv4()
          h.state(cookieName, userId, {
            ttl: 1 * 24 * 60 * 60 * 1000, // 1 day in ms
            isHttpOnly: true, // Prevent client-side access
            isSecure: process.env.NODE_ENV === 'production', // Secure in production
            path: '/',
            sameSite: 'Lax'
          })
        }
        request.app.userId = userId
        return h.continue
      })

      server.route([
        {
          method: 'GET',
          path: '/chat',
          handler: chatController.getChatPage // Use the specific handler for GET
        },
        {
          method: 'POST',
          path: '/api/chat', // Use a distinct path for the API endpoint
          handler: chatController.handleChatQuery, // Use the new handler for POST
          options: {
            // Payload validation: only allow JSON with a non-empty string 'query'
            validate: {
              payload: (value) => {
                if (
                  !value ||
                  typeof value.query !== 'string' ||
                  value.query.trim() === ''
                ) {
                  throw new Error('Missing or invalid "query" in request body.')
                }
                return value
              }
            },
            // CSRF protection: enable crumb plugin in production
            plugins:
              process.env.NODE_ENV === 'production' ? { crumb: true } : {}
          }
        },
        {
          method: 'POST',
          path: '/api/chat/reset',
          handler: chatController.handleChatReset, // New handler for reset
          options: {
            // Payload validation: only allow JSON with a 'user_id'

            plugins:
              process.env.NODE_ENV === 'production' ? { crumb: true } : {}
          }
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
