import { parseISO, isValid, format, compareAsc } from 'date-fns'

/**
 * Calculate the overlap (intersection) of dates selected by all users
 * @param {object} users - Object with userId keys and user data including selectedDates
 * @returns {string[]} Array of date strings that all users have selected
 */
export function calculateOverlap(users) {
  if (!users || typeof users !== 'object') return []

  const userEntries = Object.values(users)
  if (userEntries.length === 0) return []

  // Get all selected dates for each user
  const userDateSets = userEntries.map(user => {
    const dates = user.selectedDates || []
    return new Set(dates)
  })

  // If any user has no dates selected, there's no overlap
  if (userDateSets.some(set => set.size === 0)) return []

  // Start with the first user's dates
  let overlap = [...userDateSets[0]]

  // Intersect with each subsequent user's dates
  for (let i = 1; i < userDateSets.length; i++) {
    overlap = overlap.filter(date => userDateSets[i].has(date))
  }

  // Sort dates chronologically
  return overlap.sort((a, b) => compareAsc(parseISO(a), parseISO(b)))
}

/**
 * Check if all users have locked their dates
 * @param {object} users - Object with userId keys and user data including lockedDates
 * @returns {boolean} Whether all users have locked their dates
 */
export function allUsersLocked(users) {
  if (!users || typeof users !== 'object') return false

  const userEntries = Object.values(users)
  if (userEntries.length === 0) return false

  return userEntries.every(user => user.lockedDates === true)
}

/**
 * Check if we should show the overlap (when all users are locked)
 * @param {object} users - Object with userId keys and user data
 * @returns {{ showOverlap: boolean, overlap: string[], allLocked: boolean }}
 */
export function getOverlapStatus(users) {
  const allLocked = allUsersLocked(users)
  const overlap = calculateOverlap(users)

  return {
    showOverlap: allLocked && overlap.length > 0,
    overlap,
    allLocked
  }
}

/**
 * Get users who haven't locked their dates yet
 * @param {object} users - Object with userId keys and user data
 * @returns {string[]} Array of user names who haven't locked
 */
export function getUnlockedUsers(users) {
  if (!users || typeof users !== 'object') return []

  return Object.values(users)
    .filter(user => !user.lockedDates)
    .map(user => user.name || 'Unknown')
}

/**
 * Get a summary of each user's date selection
 * @param {object} users - Object with userId keys and user data
 * @returns {object[]} Array of { userId, name, dateCount, locked, dates }
 */
export function getUserDateSummary(users) {
  if (!users || typeof users !== 'object') return []

  return Object.entries(users).map(([userId, userData]) => ({
    userId,
    name: userData.name || 'Unknown',
    dateCount: (userData.selectedDates || []).length,
    locked: userData.lockedDates || false,
    dates: userData.selectedDates || []
  }))
}

/**
 * Format a date for display
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @param {string} formatStr - date-fns format string
 * @returns {string} Formatted date
 */
export function formatDate(dateString, formatStr = 'MMM d, yyyy') {
  const date = parseISO(dateString)
  if (!isValid(date)) return dateString
  return format(date, formatStr)
}

/**
 * Get date range description
 * @param {string[]} dates - Array of ISO date strings
 * @returns {string} Human-readable date range
 */
export function getDateRangeDescription(dates) {
  if (!dates || dates.length === 0) return 'No dates selected'
  if (dates.length === 1) return formatDate(dates[0])

  const sortedDates = [...dates].sort((a, b) => compareAsc(parseISO(a), parseISO(b)))
  const first = formatDate(sortedDates[0], 'MMM d')
  const last = formatDate(sortedDates[sortedDates.length - 1], 'MMM d, yyyy')

  return `${first} - ${last} (${dates.length} days)`
}

/**
 * Check if a date is in the overlap
 * @param {string} dateString - ISO date string
 * @param {string[]} overlapDates - Array of overlap date strings
 * @returns {boolean}
 */
export function isDateInOverlap(dateString, overlapDates) {
  return overlapDates.includes(dateString)
}
