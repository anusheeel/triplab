import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTrip } from '../hooks/useTrip'
import { isValidShareableCode, normalizeShareableCode } from '../utils/shareableCode'

export default function JoinTripPage() {
  const { code } = useParams()
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(true)

  const { user } = useAuth()
  const { joinTrip } = useTrip()
  const navigate = useNavigate()

  const normalizedCode = normalizeShareableCode(code)

  useEffect(() => {
    const validateAndJoin = async () => {
      // Validate the code format
      if (!isValidShareableCode(normalizedCode)) {
        setError('Invalid trip code format')
        setValidating(false)
        return
      }

      // Auto-join the trip
      setIsJoining(true)
      const result = await joinTrip(normalizedCode, user.uid, user.displayName)

      if (result.success) {
        navigate(`/trip/${result.tripId}/calendar`, { replace: true })
      } else {
        setError(result.error || 'Failed to join trip')
        setIsJoining(false)
        setValidating(false)
      }
    }

    if (user && normalizedCode) {
      validateAndJoin()
    }
  }, [user, normalizedCode, joinTrip, navigate])

  const handleRetry = async () => {
    setIsJoining(true)
    setError('')

    const result = await joinTrip(normalizedCode, user.uid, user.displayName)

    if (result.success) {
      navigate(`/trip/${result.tripId}/calendar`, { replace: true })
    } else {
      setError(result.error || 'Failed to join trip')
      setIsJoining(false)
    }
  }

  const handleGoHome = () => {
    navigate('/')
  }

  // Show loading state
  if (validating || isJoining) {
    return (
      <div className="min-h-screen bg-cream world-map-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6">
            <div className="w-full h-full border-4 border-coral border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="font-display text-2xl text-espresso mb-2">
            {validating ? 'Validating code...' : 'Joining trip...'}
          </h1>
          <p className="font-body text-espresso-light">
            Please wait while we process your request
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  return (
    <div className="min-h-screen bg-cream world-map-bg flex items-center justify-center p-4">
      {/* Decorative compass */}
      <div className="fixed top-10 left-10 compass-decoration hidden lg:block" />

      <div className="w-full max-w-md">
        <div className="postcard p-8 animate-fade-in">
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-espresso/20" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-espresso/20" />

          {/* Error icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-dashed border-stamp-red/50 flex items-center justify-center bg-stamp-red/10">
              <svg className="w-10 h-10 text-stamp-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl text-espresso mb-2">
              Unable to Join
            </h1>
            <p className="font-body text-espresso-light">
              {error}
            </p>
          </div>

          {/* Code display */}
          <div className="bg-espresso/5 rounded-lg p-4 mb-6 text-center">
            <p className="font-sans text-sm text-espresso/60 uppercase tracking-wider mb-1">
              Trip Code
            </p>
            <p className="font-mono text-2xl font-bold text-espresso tracking-[0.2em]">
              {normalizedCode || code}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isJoining}
              className="btn-stamp w-full flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <div className="w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                  <span>Trying again...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Try Again</span>
                </>
              )}
            </button>

            <button
              onClick={handleGoHome}
              className="btn-stamp-outline w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Go Home</span>
            </button>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="font-sans text-sm text-espresso/50">
              Make sure you have the correct code from your travel buddy
            </p>
          </div>

          {/* Decorative stamp */}
          <div className="mt-6 flex justify-end">
            <div className="opacity-20 transform rotate-6">
              <div className="border-2 border-stamp-red rounded px-3 py-1 text-xs font-display text-stamp-red uppercase tracking-wider">
                Denied
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
