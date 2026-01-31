import { useState } from 'react'

export default function LockButton({
  isLocked,
  onToggle,
  selectedDatesCount = 0,
  disabled = false
}) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = async () => {
    if (disabled) return

    setIsAnimating(true)
    await onToggle(!isLocked)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const canLock = selectedDatesCount > 0

  return (
    <div className="postcard p-3">
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className={`flex-shrink-0 ${isAnimating ? 'animate-stamp-in' : ''}`}>
          {isLocked ? (
            <div className="w-10 h-10 rounded-full border-2 border-sage bg-sage/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-amber bg-amber/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Text and button */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-sans font-medium text-sm text-espresso">
                {isLocked ? 'Dates Locked' : 'Your Dates'}
              </h3>
              <p className="font-sans text-xs text-espresso/60">
                {selectedDatesCount} date{selectedDatesCount !== 1 ? 's' : ''} selected
              </p>
            </div>

            <button
              onClick={handleClick}
              disabled={disabled || (!isLocked && !canLock)}
              className={`
                px-3 py-1.5 rounded-md font-sans text-xs font-medium transition-all duration-200
                flex items-center gap-1.5
                ${isLocked
                  ? 'bg-espresso/10 text-espresso hover:bg-espresso/20'
                  : canLock
                    ? 'bg-coral text-cream hover:bg-coral-dark'
                    : 'bg-espresso/10 text-espresso/40 cursor-not-allowed'
                }
              `}
            >
              {isLocked ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Unlock
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Lock
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
