import { chatController } from '~/src/server/chat/controller.js'

/**
 * Sets up the routes used in the /chat page.
 * These routes are registered in src/server/router.js.
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const chat = {
  plugin: {
    name: 'chat',
    register(server) {
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
            validate: {
              payload: (value) => {
                if (
                  !value ||
                  typeof value.user_id !== 'string' ||
                  value.user_id.trim() === ''
                ) {
                  throw new Error(
                    'Missing or invalid "user_id" in request body.'
                  )
                }
                return value
              }
            },
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
