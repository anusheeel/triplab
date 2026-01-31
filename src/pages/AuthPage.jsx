import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthPage() {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const { signInAnonymouslyWithName, signInWithGoogle, user } = useAuth()
  const navigate = useNavigate()

  // If user already authenticated, redirect to home
  useEffect(() => {
    if (user?.displayName) {
      navigate('/')
    }
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError('')

    const result = await signInWithGoogle()

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Failed to sign in with Google')
      setIsGoogleLoading(false)
    }
  }

  const handleAnonymousSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    setIsLoading(true)
    setError('')

    const result = await signInAnonymouslyWithName(name.trim())

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Something went wrong')
      setIsLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return ''
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 world-map-bg opacity-50 pointer-events-none" />
      <div className="fixed top-20 left-20 compass-decoration hidden lg:block" />
      <div className="fixed bottom-20 right-20 compass-decoration hidden lg:block" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-sm relative">
        <div className="postcard p-6 sm:p-8 animate-scale-in">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-coral/10 border-2 border-coral/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl text-espresso mb-1">
              Welcome to TripLab
            </h1>
            <p className="font-sans text-sm text-espresso/50">
              Plan trips together, in real-time
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-stamp-red/10 border border-stamp-red/20 rounded-lg animate-scale-in">
              <p className="text-stamp-red text-sm font-sans text-center">{error}</p>
            </div>
          )}

          {!showNameInput ? (
            /* Main auth options */
            <div className="space-y-3">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-warm-white border-2 border-espresso/10 rounded-xl font-sans text-sm text-espresso hover:border-espresso/20 hover:bg-cream active:bg-espresso/5 transition-all duration-150 press-effect disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-espresso/20 border-t-espresso rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-espresso/10" />
                <span className="font-sans text-xs text-espresso/40">or</span>
                <div className="flex-1 h-px bg-espresso/10" />
              </div>

              {/* Continue as Guest */}
              <button
                onClick={() => setShowNameInput(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-espresso/5 rounded-xl font-sans text-sm text-espresso/70 hover:bg-espresso/10 hover:text-espresso active:bg-espresso/15 transition-all duration-150 press-effect"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Continue as Guest</span>
              </button>
            </div>
          ) : (
            /* Guest name input */
            <form onSubmit={handleAnonymousSubmit} className="space-y-4 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="name" className="font-sans text-xs text-espresso/60 ml-1">
                    What should we call you?
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowNameInput(false); setError(''); }}
                    className="font-sans text-xs text-coral hover:text-coral-dark"
                  >
                    Back
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    placeholder="Your name"
                    className="input-vintage text-center pr-14"
                    disabled={isLoading}
                    autoComplete="name"
                    autoFocus
                  />
                  {name && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 rounded-full bg-coral/10 border border-dashed border-coral/40 flex items-center justify-center">
                        <span className="font-display text-xs text-coral">
                          {getInitials(name)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="btn-stamp w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    <span>Setting up...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy note */}
          <p className="mt-6 text-center font-sans text-[10px] text-espresso/30">
            By continuing, you agree to our terms of service
          </p>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 font-sans text-espresso/40 text-xs">
          Collaborative trip planning made simple
        </p>
      </div>
    </div>
  )
}
