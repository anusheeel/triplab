import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTrip } from '../hooks/useTrip'
import { useToast } from '../components/Toast'

export default function WelcomePage() {
  const [destination, setDestination] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('create')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const { user, signOut } = useAuth()
  const { createTrip, joinTrip } = useTrip()
  const navigate = useNavigate()
  const toast = useToast()

  const handleCreateTrip = async (e) => {
    e.preventDefault()
    if (!destination.trim()) {
      setError('Please enter a destination')
      return
    }

    setIsCreating(true)
    setError('')

    const result = await createTrip(destination.trim(), user.uid, user.displayName)

    if (result.success) {
      toast.success('Trip created!')
      navigate(`/create?id=${result.tripId}&code=${result.shareableCode}`)
    } else {
      setError(result.error || 'Failed to create trip')
      setIsCreating(false)
    }
  }

  const handleJoinTrip = async (e) => {
    e.preventDefault()
    if (!joinCode.trim()) {
      setError('Please enter a trip code')
      return
    }

    setIsJoining(true)
    setError('')

    const result = await joinTrip(joinCode.trim().toUpperCase(), user.uid, user.displayName)

    if (result.success) {
      toast.success(result.alreadyJoined ? 'Welcome back!' : 'Joined trip!')
      navigate(`/trip/${result.tripId}/calendar`)
    } else {
      setError(result.error || 'Failed to join trip')
      setIsJoining(false)
    }
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setError('')
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Subtle background */}
      <div className="fixed inset-0 world-map-bg opacity-30 pointer-events-none" />

      {/* Floating decorations */}
      <div className="fixed top-16 right-16 compass-decoration hidden lg:block" />
      <div className="fixed bottom-16 left-16 compass-decoration hidden lg:block" style={{ animationDelay: '1.5s' }} />

      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-display text-lg text-espresso">TripLab</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-espresso/60 hover:text-espresso transition-colors p-1 rounded-lg hover:bg-espresso/5"
              >
                <span className="font-sans text-sm hidden sm:block">{user?.displayName}</span>
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border-2 border-coral/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-coral/10 border border-dashed border-coral/30 flex items-center justify-center">
                    <span className="font-display text-xs text-coral">
                      {user?.displayName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-warm-white rounded-xl shadow-lg border border-amber/20 overflow-hidden z-20 animate-scale-in">
                    <div className="p-3 border-b border-espresso/10">
                      <p className="font-sans text-sm font-medium text-espresso truncate">
                        {user?.displayName}
                      </p>
                      {user?.email && (
                        <p className="font-sans text-xs text-espresso/50 truncate">
                          {user.email}
                        </p>
                      )}
                      {user?.isAnonymous && (
                        <p className="font-sans text-xs text-amber mt-1">
                          Guest account
                        </p>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        await signOut()
                        navigate('/auth')
                      }}
                      className="w-full px-3 py-2.5 text-left font-sans text-sm text-espresso/70 hover:bg-espresso/5 hover:text-espresso flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Headline */}
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="font-display text-3xl sm:text-4xl text-espresso mb-2">
                Where to next?
              </h1>
              <p className="font-sans text-espresso/50 text-sm">
                Start a new trip or join friends
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex p-1 bg-espresso/5 rounded-xl mb-6 animate-slide-up">
              <button
                onClick={() => switchTab('create')}
                className={`
                  flex-1 py-2.5 px-4 rounded-lg font-sans text-sm font-medium
                  transition-all duration-200 flex items-center justify-center gap-2
                  ${activeTab === 'create'
                    ? 'bg-warm-white text-espresso shadow-sm'
                    : 'text-espresso/50 hover:text-espresso'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Trip
              </button>
              <button
                onClick={() => switchTab('join')}
                className={`
                  flex-1 py-2.5 px-4 rounded-lg font-sans text-sm font-medium
                  transition-all duration-200 flex items-center justify-center gap-2
                  ${activeTab === 'join'
                    ? 'bg-warm-white text-espresso shadow-sm'
                    : 'text-espresso/50 hover:text-espresso'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Join Trip
              </button>
            </div>

            {/* Forms */}
            <div className="animate-scale-in">
              {activeTab === 'create' ? (
                <form onSubmit={handleCreateTrip} className="postcard p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="destination" className="block font-sans text-xs text-espresso/60 mb-1.5 ml-1">
                        Destination
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso/30">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          id="destination"
                          value={destination}
                          onChange={(e) => { setDestination(e.target.value); setError(''); }}
                          placeholder="Paris, Tokyo, Bali..."
                          className="input-vintage pl-11"
                          disabled={isCreating}
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    {error && activeTab === 'create' && (
                      <div className="p-2.5 bg-stamp-red/10 border border-stamp-red/20 rounded-lg animate-scale-in">
                        <p className="text-stamp-red text-sm font-sans text-center">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isCreating || !destination.trim()}
                      className="btn-stamp w-full flex items-center justify-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Trip</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleJoinTrip} className="postcard p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="joinCode" className="block font-sans text-xs text-espresso/60 mb-1.5 ml-1">
                        Trip Code
                      </label>
                      <input
                        type="text"
                        id="joinCode"
                        value={joinCode}
                        onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                        placeholder="ABC123"
                        className="input-vintage text-center text-xl tracking-[0.25em] font-mono uppercase"
                        disabled={isJoining}
                        maxLength={6}
                        autoComplete="off"
                      />
                    </div>

                    {error && activeTab === 'join' && (
                      <div className="p-2.5 bg-stamp-red/10 border border-stamp-red/20 rounded-lg animate-scale-in">
                        <p className="text-stamp-red text-sm font-sans text-center">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isJoining || joinCode.length !== 6}
                      className="btn-stamp w-full flex items-center justify-center gap-2"
                    >
                      {isJoining ? (
                        <>
                          <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <span>Join Trip</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Helper text */}
            <p className="text-center mt-6 font-sans text-espresso/40 text-xs">
              {activeTab === 'create'
                ? "You'll get a code to share with friends"
                : "Ask your travel buddy for the code"
              }
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
