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
          ...chatController
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
