import Wreck from '@hapi/wreck'
import Boom from '@hapi/boom'
import { config } from '~/src/config/config.js' // Use config for backend URL

/**
 * Renders the chat page.
 * @satisfies {ServerRoute['handler']}
 */
const getChatPage = (_request, h) => {
  return h.view('chat/index', {
    pageTitle: 'Chat',
    heading: 'Chat with AI', // Updated heading
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

/**
 * Handles incoming chat queries from the frontend,
 * forwards them to the backend API, and returns the response.
 * @satisfies {ServerRoute['handler']}
 */
const handleChatQuery = async (request, h) => {
  const backendUrl = config.get('apiServer') + '/query/'
  const userQuery = request.payload?.query // Get query from POST body

  if (!userQuery || typeof userQuery !== 'string' || userQuery.trim() === '') {
    return Boom.badRequest('Missing or invalid "query" in request body.')
  }

  // Use request.logger if available for logging
  const logger = request.logger || console

  try {
    const { res, payload } = await Wreck.post(backendUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({ query: userQuery }),
      json: true,
      timeout: 15000
    })

    // Log backend status code for traceability
    logger.info(`Backend response status: ${res.statusCode}`)

    // Check if the backend responded with an error status code
    if (res.statusCode < 200 || res.statusCode >= 300) {
      // Try to forward the backend's error message if available
      const errorMessage =
        payload?.message ||
        payload?.error ||
        `Backend returned status ${res.statusCode}`
      // Log backend error details for debugging
      logger.error(`Backend error: ${errorMessage}`, payload)
      // Map common backend errors to frontend errors
      if (res.statusCode === 400) return Boom.badRequest(errorMessage)
      if (res.statusCode === 401 || res.statusCode === 403)
        return Boom.unauthorized(errorMessage)
      if (res.statusCode === 404) return Boom.notFound(errorMessage)
      // Default to badGateway if the backend failed
      return Boom.badGateway(`Backend service failed: ${errorMessage}`)
    }

    // Assuming the backend response JSON has the answer in a property, e.g., "answer"
    // Adjust 'payload.answer' based on the actual structure of your backend's response
    const aiResponse = payload?.answer
    // Log the AI response for traceability
    logger.info(`Received response from backend, AI says: ${aiResponse}`)
    // Send the relevant part of the response back to the frontend client
    return h.response({ answer: aiResponse }).code(200)
  } catch (error) {
    // Log network or unexpected errors
    logger.error('Error calling backend API:', error)
    // Handle network errors or Wreck-specific issues
    if (error.code === 'ECONNREFUSED') {
      return Boom.badGateway('Could not connect to the backend AI service.')
    }
    if (error.output?.statusCode) {
      // If it's already a Boom error, just re-throw it
      throw error
    }
    // Otherwise, wrap it in a generic server error
    return Boom.internal(
      'An unexpected error occurred while processing your request.'
    )
  }
}

// Export both handlers
export const chatController = {
  getChatPage, // Handler for GET /chat
  handleChatQuery // Handler for POST /api/chat
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
