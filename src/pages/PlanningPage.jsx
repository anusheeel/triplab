import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRealtimeTrip, useRealtimeActivities } from '../hooks/useRealtime'
import { useTrip } from '../hooks/useTrip'
import { getDateRangeDescription } from '../utils/overlapCalculator'
import ActivityPlanner from '../components/ActivityPlanner'
import AIChat from '../components/AIChat'

export default function PlanningPage() {
  const { tripId } = useParams()
  const { user } = useAuth()
  const { trip, loading, error } = useRealtimeTrip(tripId)
  const { activities } = useRealtimeActivities(tripId)
  const { addActivity, updateActivity, deleteActivity, voteOnActivity } = useTrip()
  const navigate = useNavigate()

  const [showChat, setShowChat] = useState(false)

  // Get trip data
  const destination = trip?.destination || ''
  const overlappedDates = trip?.overlappedDates || []
  const users = trip?.users || {}
  const allUsersLocked = trip?.allUsersLocked || false

  // Handlers for activities
  const handleAddActivity = async (date, timeSlot, activity) => {
    await addActivity(tripId, date, timeSlot, activity)
  }

  const handleEditActivity = async (date, timeSlot, activityId, updates) => {
    await updateActivity(tripId, date, timeSlot, activityId, updates)
  }

  const handleDeleteActivity = async (date, timeSlot, activityId) => {
    await deleteActivity(tripId, date, timeSlot, activityId)
  }

  const handleVoteActivity = async (date, timeSlot, activityId, vote) => {
    await voteOnActivity(tripId, date, timeSlot, activityId, user.uid, vote)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-espresso text-xl">Loading your itinerary...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !trip) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="postcard p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-stamp-red/50 flex items-center justify-center bg-stamp-red/10">
            <svg className="w-8 h-8 text-stamp-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-espresso mb-2">Trip Not Found</h2>
          <p className="font-body text-espresso-light mb-6">{error || 'This trip does not exist.'}</p>
          <Link to="/" className="btn-stamp inline-flex items-center gap-2">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  // Not ready for planning
  if (!allUsersLocked || overlappedDates.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="postcard p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-amber flex items-center justify-center bg-amber/10">
            <svg className="w-8 h-8 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-espresso mb-2">Not Ready Yet</h2>
          <p className="font-body text-espresso-light mb-6">
            {!allUsersLocked
              ? 'Everyone needs to lock their dates before planning can begin.'
              : 'There are no overlapping dates. Go back and find common dates.'}
          </p>
          <Link to={`/trip/${tripId}/calendar`} className="btn-stamp inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Calendar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-warm-white border-b border-amber/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back link and title */}
            <div className="flex items-center gap-4">
              <Link
                to={`/trip/${tripId}/calendar`}
                className="p-2 rounded-lg hover:bg-amber/20 transition-colors text-espresso"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="font-display text-2xl text-espresso">
                  {destination}
                </h1>
                <p className="font-sans text-sm text-espresso-light">
                  {getDateRangeDescription(overlappedDates)}
                </p>
              </div>
            </div>

            {/* AI Chat toggle */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm transition-all
                ${showChat
                  ? 'bg-coral text-cream'
                  : 'bg-amber/20 text-espresso hover:bg-amber/30'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>AI Assistant</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className={`grid gap-6 ${showChat ? 'lg:grid-cols-2' : ''}`}>
          {/* Activity planner */}
          <div>
            <ActivityPlanner
              tripId={tripId}
              overlappedDates={overlappedDates}
              activities={activities}
              users={users}
              currentUserId={user?.uid}
              onAddActivity={handleAddActivity}
              onEditActivity={handleEditActivity}
              onDeleteActivity={handleDeleteActivity}
              onVoteActivity={handleVoteActivity}
            />
          </div>

          {/* AI Chat panel */}
          {showChat && (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <AIChat
                destination={destination}
                dates={overlappedDates}
                onClose={() => setShowChat(false)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
