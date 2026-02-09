import { useState, useRef, useCallback } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay
} from 'date-fns'
import CalendarDay from './CalendarDay'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar({
  selectedDates = [],
  onDateToggle,
  onDatesSelect,
  users = {},
  currentUserId,
  isLocked = false,
  overlappedDates = [],
  showOverlap = false
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState(null) // 'select' or 'deselect'
  const [draggedDates, setDraggedDates] = useState(new Set())
  const calendarRef = useRef(null)

  const today = startOfDay(new Date())

  // Get all days to display in the calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Get users who selected each date
  const getDateUsers = (dateStr) => {
    const dateUsers = []
    Object.entries(users).forEach(([userId, userData]) => {
      if (userData.selectedDates?.includes(dateStr)) {
        dateUsers.push({
          id: userId,
          name: userData.name,
          color: userData.color,
          isCurrentUser: userId === currentUserId
        })
      }
    })
    return dateUsers
  }

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateClick = (date) => {
    if (isLocked) return
    if (isBefore(date, today)) return

    const dateStr = format(date, 'yyyy-MM-dd')
    onDateToggle(dateStr)
  }

  // Drag selection handlers
  const handleDragStart = useCallback((date, dateStr) => {
    if (isLocked || isBefore(date, today)) return

    setIsDragging(true)
    const isCurrentlySelected = selectedDates.includes(dateStr)
    setDragMode(isCurrentlySelected ? 'deselect' : 'select')
    setDraggedDates(new Set([dateStr]))
  }, [isLocked, today, selectedDates])

  const handleDragEnter = useCallback((date, dateStr) => {
    if (!isDragging || isLocked || isBefore(date, today)) return
    if (!isSameMonth(date, currentMonth)) return

    setDraggedDates(prev => {
      const newSet = new Set(prev)
      newSet.add(dateStr)
      return newSet
    })
  }, [isDragging, isLocked, today, currentMonth])

  const handleDragEnd = useCallback(() => {
    if (!isDragging || draggedDates.size === 0) {
      setIsDragging(false)
      setDraggedDates(new Set())
      return
    }

    // Apply the drag selection
    let newDates = [...selectedDates]
    draggedDates.forEach(dateStr => {
      if (dragMode === 'select' && !newDates.includes(dateStr)) {
        newDates.push(dateStr)
      } else if (dragMode === 'deselect') {
        newDates = newDates.filter(d => d !== dateStr)
      }
    })

    if (onDatesSelect) {
      onDatesSelect(newDates)
    }

    setIsDragging(false)
    setDraggedDates(new Set())
    setDragMode(null)
  }, [isDragging, draggedDates, dragMode, selectedDates, onDatesSelect])

  // Touch move handler - detect which element finger is over
  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return

    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)

    // Find the calendar day button (traverse up if needed)
    const dayButton = element?.closest('[data-date]')
    if (dayButton) {
      const dateStr = dayButton.getAttribute('data-date')
      if (dateStr) {
        // Parse the date to check if it's valid for selection
        const date = new Date(dateStr + 'T00:00:00')
        if (!isBefore(date, today) && isSameMonth(date, currentMonth)) {
          setDraggedDates(prev => {
            const newSet = new Set(prev)
            newSet.add(dateStr)
            return newSet
          })
        }
      }
    }
  }, [isDragging, today, currentMonth])

  // Check if date is being dragged over
  const isDragTarget = (dateStr) => draggedDates.has(dateStr)

  return (
    <div className="postcard p-4 sm:p-6">
      <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-espresso/20" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-espresso/20" />

      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-amber/20 transition-colors text-espresso"
          aria-label="Previous month"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="font-display text-2xl text-espresso">
            {format(currentMonth, 'MMMM')}
          </h2>
          <p className="font-sans text-sm text-espresso-light">
            {format(currentMonth, 'yyyy')}
          </p>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-amber/20 transition-colors text-espresso"
          aria-label="Next month"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center py-2 font-sans text-sm font-medium text-espresso/60"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        ref={calendarRef}
        className="grid grid-cols-7 gap-1 select-none"
        onMouseLeave={handleDragEnd}
        onMouseUp={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
        onTouchCancel={handleDragEnd}
      >
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isPast = isBefore(day, today)
          const dateUsers = getDateUsers(dateStr)
          const isSelected = selectedDates.includes(dateStr)
          const isOverlap = overlappedDates.includes(dateStr)
          const isDraggedOver = isDragTarget(dateStr)

          return (
            <CalendarDay
              key={dateStr}
              date={day}
              dateStr={dateStr}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday(day)}
              isPast={isPast}
              isSelected={isSelected}
              isLocked={isLocked}
              isOverlap={showOverlap && isOverlap}
              isDragTarget={isDraggedOver}
              dragMode={dragMode}
              users={dateUsers}
              currentUserId={currentUserId}
              onClick={() => handleDateClick(day)}
              onDragStart={() => handleDragStart(day, dateStr)}
              onDragEnter={() => handleDragEnter(day, dateStr)}
            />
          )
        })}
      </div>

      {/* Footer with legend and hint */}
      <div className="mt-4 pt-3 border-t border-dashed border-espresso/20 flex flex-wrap items-center justify-between gap-2">
        {/* Drag hint */}
        {!isLocked && (
          <p className="font-sans text-xs text-espresso/40">
            Tip: Click and drag to select multiple dates
          </p>
        )}

        {/* Overlap legend */}
        {showOverlap && overlappedDates.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-sage to-sage-light border border-sage" />
            <span className="font-sans text-xs text-espresso-light">
              Everyone&apos;s available ({overlappedDates.length} day{overlappedDates.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
