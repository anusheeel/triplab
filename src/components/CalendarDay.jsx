import { format } from 'date-fns'

export default function CalendarDay({
  date,
  dateStr,
  isCurrentMonth,
  isToday,
  isPast,
  isSelected,
  isLocked,
  isOverlap,
  isDragTarget = false,
  dragMode = null,
  users = [],
  currentUserId,
  onClick,
  onDragStart,
  onDragEnter
}) {
  const dayNumber = format(date, 'd')
  const isClickable = isCurrentMonth && !isPast && !isLocked

  // Background based on users who selected this date
  const getBackgroundStyle = () => {
    if (isOverlap) {
      return { background: 'linear-gradient(135deg, #81B29A 0%, #A8D4B8 100%)' }
    }
    if (users.length === 0) return {}
    if (users.length === 1) {
      return { backgroundColor: `${users[0].color}25` }
    }
    // Multiple users - gradient
    const stops = users.map((u, i) => {
      const start = (i / users.length) * 100
      const end = ((i + 1) / users.length) * 100
      return `${u.color}30 ${start}%, ${u.color}30 ${end}%`
    })
    return { background: `linear-gradient(135deg, ${stops.join(', ')})` }
  }

  // Border/ring for selection
  const currentUser = users.find(u => u.isCurrentUser)
  const ringColor = currentUser?.color || '#E07A5F'

  // Drag visual feedback
  const getDragClass = () => {
    if (!isDragTarget) return ''
    return dragMode === 'select' ? 'ring-2 ring-sage/60 bg-sage/20' : 'ring-2 ring-stamp-red/40 bg-stamp-red/10'
  }

  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => { e.preventDefault(); onDragStart?.(); }}
      onMouseEnter={onDragEnter}
      disabled={!isClickable}
      className={`
        relative aspect-square p-0.5 rounded-lg
        flex flex-col items-center justify-center
        transition-all duration-100 ease-out
        ${isCurrentMonth ? '' : 'opacity-20'}
        ${isPast ? 'opacity-30 cursor-not-allowed' : ''}
        ${isClickable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm' : ''}
        ${isLocked && !isPast ? 'cursor-default' : ''}
        ${isSelected && !isOverlap ? 'ring-2 ring-offset-1 ring-offset-cream' : ''}
        ${isDragTarget ? 'scale-105 shadow-md' : ''}
        ${getDragClass()}
      `}
      style={{
        ...getBackgroundStyle(),
        '--tw-ring-color': isSelected && !isOverlap ? ringColor : undefined,
      }}
    >
      {/* Day number */}
      <span className={`
        font-sans text-sm leading-none
        ${isToday ? 'font-bold text-coral' : 'text-espresso'}
        ${isOverlap ? 'text-white font-semibold' : ''}
        ${!isCurrentMonth || isPast ? 'text-espresso/40' : ''}
      `}>
        {dayNumber}
      </span>

      {/* User dots */}
      {users.length > 0 && !isOverlap && (
        <div className="flex gap-0.5 mt-0.5">
          {users.slice(0, 3).map((u) => (
            <div
              key={u.id}
              className={`w-1.5 h-1.5 rounded-full ${u.isCurrentUser ? 'ring-1 ring-white' : ''}`}
              style={{ backgroundColor: u.color }}
            />
          ))}
          {users.length > 3 && (
            <span className="text-[8px] text-espresso/50 leading-none">+{users.length - 3}</span>
          )}
        </div>
      )}

      {/* Overlap checkmark */}
      {isOverlap && (
        <svg className="w-3 h-3 text-white/80 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}

      {/* Today indicator dot */}
      {isToday && !isOverlap && (
        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-coral" />
      )}
    </button>
  )
}
