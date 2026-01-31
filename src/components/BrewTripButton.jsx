import { useNavigate } from 'react-router-dom'
import { getUnlockedUsers, getDateRangeDescription } from '../utils/overlapCalculator'

export default function BrewTripButton({
  tripId,
  users = {},
  allUsersLocked = false,
  overlappedDates = []
}) {
  const navigate = useNavigate()

  const unlockedUsers = getUnlockedUsers(users)
  const userCount = Object.keys(users).length
  const lockedCount = userCount - unlockedUsers.length

  const canProceed = allUsersLocked && overlappedDates.length > 0

  const handleClick = () => {
    if (canProceed) {
      navigate(`/trip/${tripId}/plan`)
    }
  }

  return (
    <div className="postcard p-3">
      {/* Status section */}
      <div className="flex items-center gap-3 mb-3">
        {canProceed ? (
          <div className="w-10 h-10 rounded-full border-2 border-sage bg-sage/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-amber bg-amber/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {canProceed ? (
            <>
              <h3 className="font-sans font-medium text-sm text-espresso">Ready to Plan!</h3>
              <p className="font-sans text-xs text-sage">
                {overlappedDates.length} day{overlappedDates.length !== 1 ? 's' : ''} overlap
              </p>
            </>
          ) : (
            <>
              <h3 className="font-sans font-medium text-sm text-espresso">Waiting...</h3>
              <div className="flex items-center gap-1.5">
                {/* Progress dots */}
                {Array.from({ length: userCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < lockedCount ? 'bg-sage' : 'bg-espresso/20'}`}
                  />
                ))}
                <span className="font-sans text-xs text-espresso/60 ml-1">
                  {lockedCount}/{userCount}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* No overlap warning */}
      {allUsersLocked && overlappedDates.length === 0 && (
        <div className="bg-stamp-red/10 rounded-md p-2 mb-3 flex items-center gap-2 text-stamp-red">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-sans text-xs">No overlapping dates found</span>
        </div>
      )}

      {/* Waiting for users */}
      {!allUsersLocked && unlockedUsers.length > 0 && (
        <div className="bg-amber/10 rounded-md p-2 mb-3">
          <p className="font-sans text-xs text-espresso/70">
            <span className="text-espresso/50">Waiting: </span>
            {unlockedUsers.join(', ')}
          </p>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={handleClick}
        disabled={!canProceed}
        className={`
          w-full py-2.5 px-4 rounded-lg font-sans font-medium text-sm transition-all duration-200
          flex items-center justify-center gap-2
          ${canProceed
            ? 'bg-coral text-cream hover:bg-coral-dark active:translate-y-0.5'
            : 'bg-espresso/10 text-espresso/40 cursor-not-allowed'
          }
        `}
      >
        {canProceed ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Brew This Trip</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Waiting for Everyone</span>
          </>
        )}
      </button>
    </div>
  )
}
