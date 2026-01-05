import Anthropic from '@anthropic-ai/sdk'

// Initialize Claude client
const getClaudeClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables')
  }

  return new Anthropic({
    apiKey,
  })
}

// Get the model to use from environment
export const getClaudeModel = (): string => {
  return process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'
}

// Check if AI features are enabled
export const isAIEnabled = (): boolean => {
  return process.env.ENABLE_AI_AGENT === 'true'
}

export const isNLEventCreationEnabled = (): boolean => {
  return process.env.ENABLE_NL_EVENT_CREATION === 'true'
}

// Claude API client with error handling
export class ClaudeClient {
  private client: Anthropic

  constructor() {
    this.client = getClaudeClient()
  }

  /**
   * Send a message to Claude and get a response
   */
  async sendMessage(
    prompt: string,
    options?: {
      systemPrompt?: string
      maxTokens?: number
      temperature?: number
    }
  ): Promise<string> {
    try {
      console.log('🤖 Claude API: Sending request to model:', getClaudeModel())
      const response = await this.client.messages.create({
        model: getClaudeModel(),
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 1.0,
        system: options?.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      console.log('🤖 Claude API: Received response, tokens:', response.usage)

      // Extract text from response
      const content = response.content[0]
      if (content.type === 'text') {
        return content.text
      }

      throw new Error('Unexpected response type from Claude')
    } catch (error) {
      console.error('❌ Claude API Error:', error)
      return this.handleError(error)
    }
  }

  /**
   * Send a message with structured output (JSON)
   */
  async sendMessageForJSON<T>(
    prompt: string,
    options?: {
      systemPrompt?: string
      maxTokens?: number
    }
  ): Promise<T> {
    try {
      const systemPrompt = options?.systemPrompt || 'You are a helpful assistant that outputs valid JSON only.'

      const response = await this.sendMessage(prompt, {
        ...options,
        systemPrompt: `${systemPrompt}\n\nIMPORTANT: Respond with valid JSON only. Do not include markdown code blocks or any other text.`,
      })

      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON object found in response')
      }

      return JSON.parse(jsonMatch[0]) as T
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse JSON from Claude response: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Handle API errors with retries for rate limits
   */
  private handleError(error: any): never {
    if (error instanceof Anthropic.APIError) {
      // Handle rate limit errors
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after']
        const message = retryAfter
          ? `Rate limit exceeded. Retry after ${retryAfter} seconds.`
          : 'Rate limit exceeded. Please try again later.'
        throw new Error(message)
      }

      // Handle authentication errors
      if (error.status === 401) {
        throw new Error('Invalid Anthropic API key. Please check your configuration.')
      }

      // Handle other API errors
      throw new Error(`Claude API error (${error.status}): ${error.message}`)
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Failed to connect to Claude API. Please check your internet connection.')
    }

    // Re-throw other errors
    throw error
  }

  /**
   * Test the Claude API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendMessage('Hello! Please respond with "OK" if you can read this.')
      return response.toLowerCase().includes('ok')
    } catch (error) {
      console.error('Claude API connection test failed:', error)
      return false
    }
  }
}

// Export singleton instance
let claudeClientInstance: ClaudeClient | null = null

export const getClaudeClientInstance = (): ClaudeClient => {
  if (!claudeClientInstance) {
    claudeClientInstance = new ClaudeClient()
  }
  return claudeClientInstance
}

// Helper function for one-off requests
export async function askClaude(
  prompt: string,
  options?: {
    systemPrompt?: string
    maxTokens?: number
    temperature?: number
  }
): Promise<string> {
  const client = getClaudeClientInstance()
  return client.sendMessage(prompt, options)
}

// Helper function for JSON responses
export async function askClaudeForJSON<T>(
  prompt: string,
  options?: {
    systemPrompt?: string
    maxTokens?: number
  }
): Promise<T> {
  const client = getClaudeClientInstance()
  return client.sendMessageForJSON<T>(prompt, options)
}
