import Wreck from '@hapi/wreck'
import Boom from '@hapi/boom'

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
  const backendUrl = 'http://localhost:8085/query/' // Your backend API endpoint
  const userQuery = request.payload?.query // Get query from POST body

  if (!userQuery || typeof userQuery !== 'string' || userQuery.trim() === '') {
    return Boom.badRequest('Missing or invalid "query" in request body.')
  }

  // console.log(`Forwarding query to backend: ${userQuery}`) // Server log

  try {
    const { res, payload } = await Wreck.post(backendUrl, {
      headers: {
        'Content-Type': 'application/json'
        // Add any other headers your backend requires, like Authorization
      },
      payload: JSON.stringify({ query: userQuery }), // Send in the expected format
      json: true, // Automatically parse the response payload as JSON
      timeout: 15000 // Optional: Set a timeout (e.g., 15 seconds)
    })

    // Log backend status code
    // console.log(`Backend response status: ${res.statusCode}`)

    // Check if the backend responded with an error status code
    if (res.statusCode < 200 || res.statusCode >= 300) {
      // Try to forward the backend's error message if available
      const errorMessage =
        payload?.message ||
        payload?.error ||
        `Backend returned status ${res.statusCode}`
      // console.error(`Backend error: ${errorMessage}`, payload)
      // Use Boom to create an appropriate error response for the frontend
      // We map common backend errors to frontend errors. Adjust as needed.
      if (res.statusCode === 400) return Boom.badRequest(errorMessage)
      if (res.statusCode === 401 || res.statusCode === 403)
        return Boom.unauthorized(errorMessage)
      if (res.statusCode === 404) return Boom.notFound(errorMessage)
      // Default to badGateway if the backend failed
      return Boom.badGateway(`Backend service failed: ${errorMessage}`)
    }

    // Assuming the backend response JSON has the answer in a property, e.g., "answer" or "response"
    // Adjust 'payload.answer' based on the actual structure of your backend's response
    const aiResponse = payload?.answer

    // console.log(`Received response from backend, AI says: ${aiResponse}`) // Server log

    // Send the relevant part of the response back to the frontend client
    return h.response({ answer: aiResponse }).code(200)
  } catch (error) {
    // console.error('Error calling backend API:', error)
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
