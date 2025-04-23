/**
 * @param {Partial<Request> | null} request
 */
export function buildNavigation(request) {
  return [
    {
      text: 'Home',
      url: '/',
      isActive: request?.path === '/'
    },
    {
      text: 'About',
      url: '/about',
      isActive: request?.path === '/about'
    },
    {
      text: 'Chat',
      url: '/chat',
      isActive: request?.path === '/chat'
    }
  ]
}

/**
 * @import { Request } from '@hapi/hapi'
 */
