import { useState, useRef, useEffect } from 'react'
import { format, parseISO } from 'date-fns'

const AVAILABLE_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'Meta' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google' },
]

export default function AIChat({
  destination,
  dates = [],
  onClose
}) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  // Format dates for context
  const dateRange = dates.length > 0
    ? `${format(parseISO(dates[0]), 'MMM d')} - ${format(parseISO(dates[dates.length - 1]), 'MMM d, yyyy')}`
    : 'dates not set'

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hello! I'm your travel planning assistant. I see you're planning a trip to **${destination}** for ${dateRange}.

How can I help you plan? I can suggest:
- Activities and attractions
- Restaurant recommendations
- Day-by-day itineraries
- Local tips and hidden gems
- Transportation options

Just ask away!`
      }])
    }
  }, [destination, dateRange])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setError('')

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Build context for the AI
      const systemPrompt = `You are a helpful travel planning assistant. The user is planning a trip to ${destination} from ${dateRange} (${dates.length} days).

Your role is to:
- Suggest activities, restaurants, and attractions
- Help create day-by-day itineraries
- Provide local tips and recommendations
- Answer questions about the destination
- Be concise but informative

Format your responses with:
- Clear sections using **bold** for headers
- Bullet points for lists
- Keep responses focused and actionable

Current context:
- Destination: ${destination}
- Trip dates: ${dateRange}
- Number of days: ${dates.length}`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()
      const assistantMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
    } catch (err) {
      console.error('Chat error:', err)
      setError('Failed to send message. Make sure the server is running.')
      // Remove the user message if request failed
      setMessages(prev => prev.slice(0, -1))
      setInput(userMessage) // Restore input
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Simple markdown-like formatting
  const formatMessage = (content) => {
    return content
      .split('\n')
      .map((line, i) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Bullet points
        if (line.startsWith('- ')) {
          return `<li key="${i}" class="ml-4">${line.substring(2)}</li>`
        }
        return `<p key="${i}" class="${line === '' ? 'h-2' : ''}">${line}</p>`
      })
      .join('')
  }

  return (
    <div className="postcard flex flex-col h-[600px] max-h-[80vh]">
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-espresso/20" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-espresso/20" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dashed border-espresso/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-coral/10 border-2 border-dashed border-coral/40 flex items-center justify-center">
            <svg className="w-5 h-5 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-lg text-espresso">Travel Assistant</h3>
            <p className="font-sans text-xs text-espresso/50">Powered by AI</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 hover:bg-espresso/10 rounded-lg transition-colors text-espresso/60 hover:text-espresso"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Model selector */}
      <div className="px-4 py-2 border-b border-espresso/10 bg-espresso/5">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-3 py-1.5 bg-warm-white border border-amber/30 rounded-md font-sans text-sm text-espresso focus:outline-none focus:border-coral"
        >
          {AVAILABLE_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} ({model.provider})
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}`}
          >
            <div
              className="font-body text-sm text-espresso prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
            />
          </div>
        ))}

        {isLoading && (
          <div className="chat-message chat-message-ai">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-coral rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-stamp-red/10 border border-stamp-red/30 rounded-md">
            <p className="text-stamp-red text-sm font-sans">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dashed border-espresso/20">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for recommendations..."
            className="flex-1 input-vintage text-sm resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="btn-stamp px-4 self-end"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-xs font-sans text-espresso/40 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
