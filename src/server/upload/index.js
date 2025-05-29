import { getUploadPage } from './controller.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const upload = {
  plugin: {
    name: 'upload',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/upload',
          handler: getUploadPage
        },
        {
          method: 'GET',
          path: '/upload-success',
          handler: (request, h) => h.view('upload-success')
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
