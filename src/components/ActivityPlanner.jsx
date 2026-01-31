import { useState } from 'react'
import { format, parseISO, compareAsc } from 'date-fns'
import DayPlanner from './DayPlanner'

export default function ActivityPlanner({
  tripId,
  overlappedDates = [],
  activities = {},
  users = {},
  currentUserId,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onVoteActivity
}) {
  const [selectedDate, setSelectedDate] = useState(overlappedDates[0] || null)

  // Sort dates chronologically
  const sortedDates = [...overlappedDates].sort((a, b) =>
    compareAsc(parseISO(a), parseISO(b))
  )

  if (sortedDates.length === 0) {
    return (
      <div className="postcard p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-dashed border-amber flex items-center justify-center bg-amber/10">
          <svg className="w-8 h-8 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-display text-xl text-espresso mb-2">No Dates Available</h3>
        <p className="font-body text-espresso-light">
          There are no overlapping dates to plan activities for.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Date selector tabs */}
      <div className="postcard p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="font-display text-lg text-espresso">Trip Days</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {sortedDates.map((date, index) => {
            const isSelected = date === selectedDate
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`
                  px-4 py-2 rounded-lg font-sans text-sm transition-all duration-200
                  ${isSelected
                    ? 'bg-coral text-cream shadow-postcard'
                    : 'bg-warm-white text-espresso hover:bg-amber/20 border border-amber/30'
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs opacity-70">Day {index + 1}</span>
                  <span className="font-medium">{format(parseISO(date), 'MMM d')}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Day planner for selected date */}
      {selectedDate && (
        <DayPlanner
          date={selectedDate}
          activities={activities[selectedDate] || {}}
          users={users}
          currentUserId={currentUserId}
          onAddActivity={onAddActivity}
          onEditActivity={onEditActivity}
          onDeleteActivity={onDeleteActivity}
          onVoteActivity={onVoteActivity}
        />
      )}

      {/* Navigation arrows for quick date switching */}
      {sortedDates.length > 1 && selectedDate && (
        <div className="flex justify-between mt-4">
          <button
            onClick={() => {
              const currentIndex = sortedDates.indexOf(selectedDate)
              if (currentIndex > 0) {
                setSelectedDate(sortedDates[currentIndex - 1])
              }
            }}
            disabled={sortedDates.indexOf(selectedDate) === 0}
            className="flex items-center gap-2 px-4 py-2 font-sans text-sm text-espresso hover:bg-amber/20 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous Day
          </button>

          <button
            onClick={() => {
              const currentIndex = sortedDates.indexOf(selectedDate)
              if (currentIndex < sortedDates.length - 1) {
                setSelectedDate(sortedDates[currentIndex + 1])
              }
            }}
            disabled={sortedDates.indexOf(selectedDate) === sortedDates.length - 1}
            className="flex items-center gap-2 px-4 py-2 font-sans text-sm text-espresso hover:bg-amber/20 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next Day
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
