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
            // Optional: Add payload validation if needed
            // payload: {
            //   parse: true,
            //   allow: 'application/json'
            // },
            // Optional: Add CSRF protection if your app uses it
            // plugins: {
            //   crumb: true // Example if using @hapi/crumb
            // }
          }
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
