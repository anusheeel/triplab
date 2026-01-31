import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { getShareableUrl } from '../utils/shareableCode'

export default function CreateTripPage() {
  const [searchParams] = useSearchParams()
  const [copied, setCopied] = useState(null) // 'code' | 'link' | null
  const navigate = useNavigate()
  const toast = useToast()

  const tripId = searchParams.get('id')
  const shareableCode = searchParams.get('code')

  useEffect(() => {
    if (!tripId || !shareableCode) {
      navigate('/')
    }
  }, [tripId, shareableCode, navigate])

  const shareableUrl = getShareableUrl(shareableCode)

  const handleCopy = async (type) => {
    const text = type === 'code' ? shareableCode : shareableUrl
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast.success(type === 'code' ? 'Code copied!' : 'Link copied!')
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const handleContinue = () => {
    navigate(`/trip/${tripId}/calendar`)
  }

  if (!tripId || !shareableCode) {
    return null
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 world-map-bg opacity-30 pointer-events-none" />
      <div className="fixed top-16 left-16 compass-decoration hidden lg:block" />

      <div className="w-full max-w-md relative">
        {/* Success card */}
        <div className="postcard p-6 sm:p-8 animate-scale-in">
          {/* Success check */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-sage/10 border-2 border-sage/40 flex items-center justify-center animate-stamp-in">
              <svg className="w-8 h-8 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl text-espresso mb-1">
              Trip Created!
            </h1>
            <p className="font-sans text-sm text-espresso/50">
              Share this code with your travel companions
            </p>
          </div>

          {/* Code display */}
          <button
            onClick={() => handleCopy('code')}
            className="w-full mb-4 p-5 bg-amber/10 hover:bg-amber/20 active:bg-amber/30 border-2 border-dashed border-amber/40 rounded-xl transition-all duration-150 press-effect group"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-bold text-espresso tracking-[0.3em]">
                {shareableCode}
              </span>
              <div className={`p-1.5 rounded-lg transition-colors ${copied === 'code' ? 'bg-sage/20' : 'bg-espresso/5 group-hover:bg-espresso/10'}`}>
                {copied === 'code' ? (
                  <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-espresso/40 group-hover:text-espresso/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>
            <p className="text-xs text-espresso/40 mt-2">Click to copy code</p>
          </button>

          {/* Share link */}
          <button
            onClick={() => handleCopy('link')}
            className="w-full mb-6 flex items-center gap-2 p-3 bg-espresso/5 hover:bg-espresso/10 active:bg-espresso/15 rounded-lg transition-all duration-150 press-effect group"
          >
            <svg className="w-5 h-5 text-espresso/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="flex-1 text-left font-mono text-xs text-espresso/60 truncate">
              {shareableUrl}
            </span>
            {copied === 'link' ? (
              <svg className="w-4 h-4 text-sage flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-espresso/30 group-hover:text-espresso/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* How it works */}
          <div className="mb-6 p-4 bg-espresso/5 rounded-xl">
            <h3 className="font-sans text-xs font-medium text-espresso/70 mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How it works
            </h3>
            <ol className="space-y-2 text-sm text-espresso/60 font-sans">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-coral/20 text-coral text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Share the code with friends</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-coral/20 text-coral text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Everyone selects their available dates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-coral/20 text-coral text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Lock dates and plan activities together!</span>
              </li>
            </ol>
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            className="btn-stamp w-full flex items-center justify-center gap-2"
          >
            <span>Continue to Calendar</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 font-sans text-espresso/40 text-xs">
          Waiting for travelers to join...
        </p>
      </div>
    </div>
  )
}
