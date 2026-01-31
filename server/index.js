import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// OpenRouter proxy endpoint
app.post('/api/chat', async (req, res) => {
  const { model, messages } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set')
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5173',
        'X-Title': 'TripLab - Collaborative Trip Planner'
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-3.5-sonnet',
        messages,
        max_tokens: 1024,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenRouter API error:', response.status, errorData)
      return res.status(response.status).json({
        error: errorData.error?.message || 'Failed to get response from AI'
      })
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TripLab API server running on port ${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/api/health`)
  console.log(`   Chat endpoint: http://localhost:${PORT}/api/chat`)

  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('⚠️  Warning: OPENROUTER_API_KEY is not set. AI chat will not work.')
  }
})
