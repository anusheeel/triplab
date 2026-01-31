import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRealtimeTrip } from '../hooks/useRealtime'
import { useTrip } from '../hooks/useTrip'
import { useToast } from '../components/Toast'
import { getShareableUrl } from '../utils/shareableCode'
import { calculateOverlap, allUsersLocked } from '../utils/overlapCalculator'
import Calendar from '../components/Calendar'
import UserLegend from '../components/UserLegend'
import LockButton from '../components/LockButton'
import BrewTripButton from '../components/BrewTripButton'

export default function CalendarPage() {
  const { tripId } = useParams()
  const { user } = useAuth()
  const { trip, loading, error } = useRealtimeTrip(tripId)
  const { updateSelectedDates, setLockedDates } = useTrip()
  const toast = useToast()

  const [copied, setCopied] = useState(false)
  const prevUsersRef = useRef({})

  // Get current user's data
  const currentUserData = trip?.users?.[user?.uid]
  const selectedDates = currentUserData?.selectedDates || []
  const isLocked = currentUserData?.lockedDates || false

  // Calculate overlap
  const users = trip?.users || {}
  const allLocked = allUsersLocked(users)
  const overlappedDates = allLocked ? calculateOverlap(users) : []

  // Watch for other users joining or locking
  useEffect(() => {
    const prevUsers = prevUsersRef.current
    const currentUsers = users

    Object.entries(currentUsers).forEach(([id, userData]) => {
      if (id === user?.uid) return

      // New user joined
      if (!prevUsers[id]) {
        toast.info(`${userData.name} joined the trip!`)
      }
      // User locked their dates
      else if (!prevUsers[id]?.lockedDates && userData.lockedDates) {
        toast.success(`${userData.name} locked their dates`)
      }
      // User unlocked their dates
      else if (prevUsers[id]?.lockedDates && !userData.lockedDates) {
        toast.info(`${userData.name} unlocked their dates`)
      }
    })

    prevUsersRef.current = { ...currentUsers }
  }, [users, user?.uid, toast])

  // Watch for all users locked
  useEffect(() => {
    if (allLocked && overlappedDates.length > 0 && Object.keys(users).length > 1) {
      toast.success(`Everyone's locked! ${overlappedDates.length} days overlap`)
    }
  }, [allLocked, overlappedDates.length, Object.keys(users).length])

  const handleDateToggle = async (dateStr) => {
    if (isLocked) return
    const newDates = selectedDates.includes(dateStr)
      ? selectedDates.filter(d => d !== dateStr)
      : [...selectedDates, dateStr]
    await updateSelectedDates(tripId, user.uid, newDates)
  }

  const handleDatesSelect = async (newDates) => {
    if (isLocked) return
    await updateSelectedDates(tripId, user.uid, newDates)
  }

  const handleLockToggle = async (locked) => {
    await setLockedDates(tripId, user.uid, locked)
    if (locked) {
      toast.success('Your dates are locked!')
    } else {
      toast.info('Dates unlocked for editing')
    }
  }

  const handleCopyCode = async () => {
    if (!trip?.shareableCode) return
    try {
      await navigator.clipboard.writeText(trip.shareableCode)
      setCopied(true)
      toast.success('Code copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const handleCopyLink = async () => {
    if (!trip?.shareableCode) return
    try {
      await navigator.clipboard.writeText(getShareableUrl(trip.shareableCode))
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-3 border-coral/30 border-t-coral rounded-full animate-spin mx-auto mb-4" />
          <p className="font-sans text-espresso/60 text-sm">Loading trip...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !trip) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="postcard p-8 max-w-md text-center animate-scale-in">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-stamp-red/30 flex items-center justify-center bg-stamp-red/5">
            <svg className="w-7 h-7 text-stamp-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-display text-xl text-espresso mb-2">Trip Not Found</h2>
          <p className="font-sans text-sm text-espresso/60 mb-6">{error || 'This trip doesn\'t exist or you don\'t have access.'}</p>
          <Link to="/" className="btn-stamp inline-flex items-center gap-2">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  // Not a member of this trip
  if (!currentUserData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="postcard p-8 max-w-md text-center animate-scale-in">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-amber/50 flex items-center justify-center bg-amber/10">
            <svg className="w-7 h-7 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-xl text-espresso mb-2">Access Required</h2>
          <p className="font-sans text-sm text-espresso/60 mb-6">You're not a member of this trip.</p>
          <Link to="/" className="btn-stamp inline-flex items-center gap-2">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream page-transition">
      {/* Header */}
      <header className="bg-warm-white/80 backdrop-blur-sm border-b border-amber/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back link and title */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-2 -ml-2 rounded-lg hover:bg-espresso/5 active:bg-espresso/10 transition-colors text-espresso/60 hover:text-espresso"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="font-display text-xl text-espresso leading-tight">
                  {trip.destination}
                </h1>
                <p className="font-sans text-xs text-espresso/50">
                  {Object.keys(users).length} traveler{Object.keys(users).length !== 1 ? 's' : ''} planning
                </p>
              </div>
            </div>

            {/* Share button */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyCode}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber/10 hover:bg-amber/20 active:bg-amber/30 rounded-lg transition-all duration-150 press-effect"
                title="Copy trip code"
              >
                <span className="font-mono text-sm text-espresso font-medium tracking-wider">
                  {trip.shareableCode}
                </span>
                {copied ? (
                  <svg className="w-4 h-4 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-espresso/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-amber/20 active:bg-amber/30 rounded-lg transition-all duration-150 text-espresso/60 hover:text-espresso press-effect"
                title="Copy invite link"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-4 lg:py-6">
        <div className="grid lg:grid-cols-[1fr,260px] gap-4 lg:gap-5">
          {/* Calendar */}
          <div className="animate-fade-in">
            <Calendar
              selectedDates={selectedDates}
              onDateToggle={handleDateToggle}
              onDatesSelect={handleDatesSelect}
              users={users}
              currentUserId={user?.uid}
              isLocked={isLocked}
              overlappedDates={overlappedDates}
              showOverlap={allLocked}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            <div className="animate-slide-up stagger-1">
              <LockButton
                isLocked={isLocked}
                onToggle={handleLockToggle}
                selectedDatesCount={selectedDates.length}
              />
            </div>

            <div className="animate-slide-up stagger-2">
              <UserLegend
                users={users}
                currentUserId={user?.uid}
                showLockStatus={true}
              />
            </div>

            <div className="animate-slide-up stagger-3">
              <BrewTripButton
                tripId={tripId}
                users={users}
                allUsersLocked={allLocked}
                overlappedDates={overlappedDates}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
