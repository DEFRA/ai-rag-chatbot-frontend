/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const chatController = {
  handler(_request, h) {
    return h.view('chat/index', {
      pageTitle: 'Chat',
      heading: 'Chat',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Chat'
        }
      ]
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
