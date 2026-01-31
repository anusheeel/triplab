import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import ActivityCard from './ActivityCard'

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', icon: '☀️', timeRange: '6am - 12pm', color: 'mustard' },
  { id: 'afternoon', label: 'Afternoon', icon: '🌤️', timeRange: '12pm - 6pm', color: 'coral' },
  { id: 'evening', label: 'Evening', icon: '🌅', timeRange: '6pm - 10pm', color: 'ocean' },
  { id: 'night', label: 'Night', icon: '🌙', timeRange: '10pm - 6am', color: 'plum' },
]

export default function DayPlanner({
  date,
  activities = {},
  users = {},
  currentUserId,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onVoteActivity
}) {
  const [expandedSlot, setExpandedSlot] = useState(null)
  const [newActivity, setNewActivity] = useState({ title: '', description: '' })

  const formattedDate = format(parseISO(date), 'EEEE, MMMM d')

  const handleAddActivity = (timeSlot) => {
    if (!newActivity.title.trim()) return

    onAddActivity(date, timeSlot, {
      title: newActivity.title.trim(),
      description: newActivity.description.trim(),
      createdBy: currentUserId,
      createdByName: users[currentUserId]?.name || 'Unknown'
    })

    setNewActivity({ title: '', description: '' })
    setExpandedSlot(null)
  }

  const getSlotActivities = (slotId) => {
    const slotActivities = activities[slotId]
    if (!slotActivities) return []
    return Object.entries(slotActivities).map(([id, data]) => ({
      id,
      ...data
    }))
  }

  return (
    <div className="postcard p-4 sm:p-6 mb-6">
      {/* Date header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-dashed border-espresso/10">
        <div>
          <h3 className="font-display text-xl text-espresso">
            {formattedDate}
          </h3>
          <p className="font-sans text-xs text-espresso/50 mt-0.5">
            Plan your day's activities
          </p>
        </div>
        <div className="postmark">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{format(parseISO(date), 'MMM d')}</span>
        </div>
      </div>

      {/* Time slots in columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {TIME_SLOTS.map((slot) => {
          const slotActivities = getSlotActivities(slot.id)
          const hasConflict = slotActivities.length > 1
          const isExpanded = expandedSlot === slot.id

          return (
            <div
              key={slot.id}
              className={`
                flex flex-col rounded-xl border-2 border-dashed transition-all duration-200
                ${isExpanded ? 'border-coral/40 bg-coral/5' : 'border-espresso/10 hover:border-espresso/20'}
              `}
            >
              {/* Slot header */}
              <div className={`
                p-3 border-b border-dashed text-center
                ${isExpanded ? 'border-coral/20' : 'border-espresso/10'}
              `}>
                <span className="text-xl mb-1 block">{slot.icon}</span>
                <h4 className="font-sans font-medium text-sm text-espresso">
                  {slot.label}
                </h4>
                <p className="font-sans text-[10px] text-espresso/40">
                  {slot.timeRange}
                </p>
                {slotActivities.length > 0 && (
                  <span className={`
                    inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium
                    ${hasConflict ? 'bg-terracotta/20 text-terracotta' : 'bg-sage/20 text-sage'}
                  `}>
                    {slotActivities.length} {slotActivities.length === 1 ? 'activity' : 'activities'}
                  </span>
                )}
              </div>

              {/* Activities list */}
              <div className="flex-1 p-2 space-y-2 min-h-[100px]">
                {slotActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    users={users}
                    currentUserId={currentUserId}
                    isConflict={hasConflict}
                    compact={true}
                    onEdit={(updates) => onEditActivity(date, slot.id, activity.id, updates)}
                    onDelete={() => onDeleteActivity(date, slot.id, activity.id)}
                    onVote={(vote) => onVoteActivity(date, slot.id, activity.id, vote)}
                  />
                ))}

                {/* Add activity */}
                {isExpanded ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-2.5 py-2 bg-warm-white border border-amber/40 rounded-lg font-sans text-sm text-espresso placeholder:text-espresso/30 focus:outline-none focus:border-coral"
                      placeholder="Activity name"
                      autoFocus
                    />
                    <textarea
                      value={newActivity.description}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-2.5 py-2 bg-warm-white border border-amber/40 rounded-lg font-sans text-xs text-espresso placeholder:text-espresso/30 focus:outline-none focus:border-coral resize-none"
                      placeholder="Details (optional)"
                      rows={2}
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setExpandedSlot(null)
                          setNewActivity({ title: '', description: '' })
                        }}
                        className="flex-1 py-1.5 font-sans text-xs text-espresso/60 hover:text-espresso hover:bg-espresso/5 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddActivity(slot.id)}
                        disabled={!newActivity.title.trim()}
                        className="flex-1 py-1.5 font-sans text-xs bg-coral text-cream rounded-lg hover:bg-coral-dark transition-colors disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpandedSlot(slot.id)}
                    className="w-full py-2 px-3 border border-dashed border-espresso/15 rounded-lg
                             text-espresso/30 font-sans text-xs hover:border-coral/40 hover:text-coral/60
                             transition-colors flex items-center justify-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
