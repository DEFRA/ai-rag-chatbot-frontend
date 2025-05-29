import { getUploadPage, getUploadToUploaderPage } from './controller.js'

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
          handler: (request, h) => {
            // Always use the correct template path and pass the reference
            const reference = request.query.reference
            return h.view('upload/upload-success', { reference })
          }
        },
        {
          method: 'GET',
          path: '/upload-to-uploader',
          handler: getUploadToUploaderPage
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
