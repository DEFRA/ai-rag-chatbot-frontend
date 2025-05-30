import Wreck from '@hapi/wreck'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import { buildRedisClient } from '~/src/server/common/helpers/redis-client.js'
import { config } from '~/src/config/config.js'
// import crypto from 'crypto'

const logger = createLogger()
const redisClient = buildRedisClient(config.get('redis'))

const CDP_UPLOADER_URL = process.env.CDP_UPLOADER_URL ?? 'http://localhost:7337'
const BACKEND_CALLBACK_URL =
  process.env.BACKEND_CALLBACK_URL ??
  'http://backend-service:8085/uploader-callback'
const S3_BUCKET = process.env.S3_BUCKET ?? 'ai-rag-bucket'

function generateReferenceNumber() {
  // GOV.UK style: 3-4-3 alphanumeric, e.g. ABC1234XYZ
  const alpha = () =>
    Math.random()
      .toString(36)
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 3)
  const num = () => Math.floor(1000 + Math.random() * 9000)
  return `${alpha()}${num()}${alpha()}`
}

export async function getUploadPage(request, h) {
  // Step 1: Generate reference number first
  const reference = generateReferenceNumber()
  // Step 2: Initiate upload with CDP-Uploader, passing reference in redirect
  const initiatePayload = {
    redirect: `/upload-success?reference=${reference}`,
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
  // Step 3: Store mapping in Redis
  const uploadId = initiateResponse.uploadId
  await redisClient.set(
    `reference:${reference}`,
    uploadId,
    'PX',
    7 * 24 * 60 * 60 * 1000 // 7 days in ms
  )
  // Step 4: Redirect to upload form with reference
  let uploadUrl = initiateResponse.uploadUrl
  if (!/^https?:\/\//.test(uploadUrl)) {
    uploadUrl = `${CDP_UPLOADER_URL}${uploadUrl}`
  }
  return h.redirect(
    `/upload-to-uploader?uploadUrl=${encodeURIComponent(uploadUrl)}&reference=${reference}`
  )
}

export function getUploadToUploaderPage(request, h) {
  // Render the upload form with the correct uploadUrl and reference
  const { uploadUrl, reference } = request.query
  return h.view('upload/upload-to-uploader', { uploadUrl, reference })
}

export async function checkUploadStatusHandler(request, h) {
  const { reference } = request.payload
  if (!reference) {
    return h.view('upload/check-upload-status', {
      error: 'Enter your reference number'
    })
  }
  let uploadId
  try {
    uploadId = await redisClient.get(`reference:${reference}`)
  } catch (err) {
    return h.view('upload/check-upload-status', {
      error: 'Error looking up reference'
    })
  }
  if (!uploadId) {
    return h.view('upload/check-upload-status', {
      error: 'Reference not found'
    })
  }
  // Poll cdp-uploader for status
  try {
    const { payload } = await Wreck.get(
      `${CDP_UPLOADER_URL}/status/${uploadId}`,
      { json: true }
    )
    const status = payload.uploadStatus || 'unknown'
    return h.view('upload/upload-status-result', {
      reference,
      status,
      details: payload
    })
  } catch (err) {
    return h.view('upload/upload-status-result', {
      reference,
      status: 'error',
      details: { error: 'Failed to fetch status' }
    })
  }
}
