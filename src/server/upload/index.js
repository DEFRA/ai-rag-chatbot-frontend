import {
  getUploadPage,
  getUploadToUploaderPage,
  checkUploadStatusHandler
} from './controller.js'

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
        },
        {
          method: 'GET',
          path: '/check-upload-status',
          handler: (request, h) => {
            // Render the status check form
            return h.view('upload/check-upload-status')
          }
        },
        {
          method: 'POST',
          path: '/check-upload-status',
          handler: checkUploadStatusHandler
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
