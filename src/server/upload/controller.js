import Wreck from '@hapi/wreck'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const logger = createLogger()

const CDP_UPLOADER_URL = process.env.CDP_UPLOADER_URL ?? 'http://localhost:7337'
const BACKEND_CALLBACK_URL =
  process.env.BACKEND_CALLBACK_URL ?? 'http://localhost:8085/uploader-callback'
const S3_BUCKET = process.env.S3_BUCKET ?? 'ai-rag-bucket'

export async function getUploadPage(request, h) {
  // Step 1: Initiate upload with CDP-Uploader
  const initiatePayload = {
    redirect: '/upload-success',
    s3Bucket: S3_BUCKET,
    callback: BACKEND_CALLBACK_URL
  }
  let initiateResponse
  try {
    const { payload } = await Wreck.post(`${CDP_UPLOADER_URL}/initiate`, {
      payload: JSON.stringify(initiatePayload),
      headers: { 'content-type': 'application/json' },
      json: true
    })
    initiateResponse = payload
  } catch (err) {
    logger.error('Failed to initiate upload:', err?.output?.payload || err)
    return h
      .view('upload/upload', {
        error: 'Failed to contact upload service. Please try again later.'
      })
      .code(500)
  }
  // Step 2: Render the upload form with the correct uploadUrl
  let uploadUrl = initiateResponse.uploadUrl
  if (!/^https?:\/\//.test(uploadUrl)) {
    uploadUrl = `${CDP_UPLOADER_URL}${uploadUrl}`
  }
  return h.view('upload/upload', { uploadUrl })
}
