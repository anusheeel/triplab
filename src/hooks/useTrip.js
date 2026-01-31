import { database } from '../config/firebase'
import { ref, set, get, update, push, remove } from 'firebase/database'
import { generateShareableCode } from '../utils/shareableCode'
import { getColorForUser } from '../utils/colorAssigner'

/**
 * Hook for trip-related Firebase operations
 */
export function useTrip() {
  /**
   * Create a new trip
   * @param {string} destination - Trip destination
   * @param {string} userId - Creator's user ID
   * @param {string} userName - Creator's display name
   * @returns {Promise<{ success: boolean, tripId?: string, shareableCode?: string, error?: string }>}
   */
  const createTrip = async (destination, userId, userName) => {
    try {
      const shareableCode = generateShareableCode()
      const tripRef = push(ref(database, 'trips'))
      const tripId = tripRef.key

      const tripData = {
        destination,
        createdAt: Date.now(),
        createdBy: userId,
        shareableCode,
        users: {
          [userId]: {
            name: userName,
            color: getColorForUser(userId, [userId]).hex,
            lockedDates: false,
            selectedDates: [],
            joinedAt: Date.now()
          }
        },
        overlappedDates: [],
        allUsersLocked: false,
        activities: {}
      }

      await set(tripRef, tripData)

      // Also create code-to-tripId mapping for easy lookup
      await set(ref(database, `codes/${shareableCode}`), tripId)

      return { success: true, tripId, shareableCode }
    } catch (error) {
      console.error('Create trip error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Join an existing trip
   * @param {string} shareableCode - The trip's shareable code
   * @param {string} userId - User's ID
   * @param {string} userName - User's display name
   * @returns {Promise<{ success: boolean, tripId?: string, error?: string }>}
   */
  const joinTrip = async (shareableCode, userId, userName) => {
    try {
      // Look up tripId from code
      const codeRef = ref(database, `codes/${shareableCode.toUpperCase()}`)
      const codeSnapshot = await get(codeRef)

      if (!codeSnapshot.exists()) {
        return { success: false, error: 'Invalid trip code' }
      }

      const tripId = codeSnapshot.val()

      // Check if trip exists
      const tripRef = ref(database, `trips/${tripId}`)
      const tripSnapshot = await get(tripRef)

      if (!tripSnapshot.exists()) {
        return { success: false, error: 'Trip not found' }
      }

      const tripData = tripSnapshot.val()

      // Check if user is already in trip
      if (tripData.users && tripData.users[userId]) {
        return { success: true, tripId, alreadyJoined: true }
      }

      // Get existing user IDs for color assignment
      const existingUserIds = Object.keys(tripData.users || {})
      const allUserIds = [...existingUserIds, userId]

      // Add user to trip
      await set(ref(database, `trips/${tripId}/users/${userId}`), {
        name: userName,
        color: getColorForUser(userId, allUserIds).hex,
        lockedDates: false,
        selectedDates: [],
        joinedAt: Date.now()
      })

      return { success: true, tripId }
    } catch (error) {
      console.error('Join trip error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get trip data
   * @param {string} tripId - Trip ID
   * @returns {Promise<{ success: boolean, trip?: object, error?: string }>}
   */
  const getTrip = async (tripId) => {
    try {
      const tripRef = ref(database, `trips/${tripId}`)
      const snapshot = await get(tripRef)

      if (!snapshot.exists()) {
        return { success: false, error: 'Trip not found' }
      }

      return { success: true, trip: { id: tripId, ...snapshot.val() } }
    } catch (error) {
      console.error('Get trip error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update user's selected dates
   * @param {string} tripId - Trip ID
   * @param {string} userId - User ID
   * @param {string[]} dates - Array of selected dates (YYYY-MM-DD)
   */
  const updateSelectedDates = async (tripId, userId, dates) => {
    try {
      await set(ref(database, `trips/${tripId}/users/${userId}/selectedDates`), dates)
      return { success: true }
    } catch (error) {
      console.error('Update dates error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Toggle date selection for a user
   * @param {string} tripId - Trip ID
   * @param {string} userId - User ID
   * @param {string} date - Date to toggle (YYYY-MM-DD)
   * @param {string[]} currentDates - Current selected dates
   */
  const toggleDate = async (tripId, userId, date, currentDates) => {
    const newDates = currentDates.includes(date)
      ? currentDates.filter(d => d !== date)
      : [...currentDates, date]

    return updateSelectedDates(tripId, userId, newDates)
  }

  /**
   * Lock/unlock user's dates
   * @param {string} tripId - Trip ID
   * @param {string} userId - User ID
   * @param {boolean} locked - Whether to lock or unlock
   */
  const setLockedDates = async (tripId, userId, locked) => {
    try {
      await set(ref(database, `trips/${tripId}/users/${userId}/lockedDates`), locked)

      // Check if all users are now locked and update trip accordingly
      const tripRef = ref(database, `trips/${tripId}`)
      const snapshot = await get(tripRef)
      if (snapshot.exists()) {
        const tripData = snapshot.val()
        const allLocked = Object.values(tripData.users || {}).every(u => u.lockedDates)
        await set(ref(database, `trips/${tripId}/allUsersLocked`), allLocked)

        // If all locked, calculate and store overlap
        if (allLocked) {
          const userDates = Object.values(tripData.users || {}).map(u => new Set(u.selectedDates || []))
          if (userDates.length > 0 && userDates.every(s => s.size > 0)) {
            let overlap = [...userDates[0]]
            for (let i = 1; i < userDates.length; i++) {
              overlap = overlap.filter(d => userDates[i].has(d))
            }
            await set(ref(database, `trips/${tripId}/overlappedDates`), overlap.sort())
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Lock dates error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Add an activity to a day's time slot
   * @param {string} tripId - Trip ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} timeSlot - Time slot (morning, afternoon, evening, night)
   * @param {object} activity - Activity data { title, description, createdBy, createdByName }
   */
  const addActivity = async (tripId, date, timeSlot, activity) => {
    try {
      const activityRef = push(ref(database, `trips/${tripId}/activities/${date}/${timeSlot}`))
      const activityData = {
        ...activity,
        id: activityRef.key,
        createdAt: Date.now(),
        votes: {}
      }
      await set(activityRef, activityData)
      return { success: true, activityId: activityRef.key }
    } catch (error) {
      console.error('Add activity error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update an activity
   * @param {string} tripId - Trip ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} timeSlot - Time slot
   * @param {string} activityId - Activity ID
   * @param {object} updates - Fields to update
   */
  const updateActivity = async (tripId, date, timeSlot, activityId, updates) => {
    try {
      await update(ref(database, `trips/${tripId}/activities/${date}/${timeSlot}/${activityId}`), updates)
      return { success: true }
    } catch (error) {
      console.error('Update activity error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete an activity
   * @param {string} tripId - Trip ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} timeSlot - Time slot
   * @param {string} activityId - Activity ID
   */
  const deleteActivity = async (tripId, date, timeSlot, activityId) => {
    try {
      await remove(ref(database, `trips/${tripId}/activities/${date}/${timeSlot}/${activityId}`))
      return { success: true }
    } catch (error) {
      console.error('Delete activity error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Vote on an activity
   * @param {string} tripId - Trip ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} timeSlot - Time slot
   * @param {string} activityId - Activity ID
   * @param {string} userId - User ID
   * @param {number} vote - Vote value (1 for upvote, -1 for downvote, 0 to remove vote)
   */
  const voteOnActivity = async (tripId, date, timeSlot, activityId, userId, vote) => {
    try {
      const voteRef = ref(database, `trips/${tripId}/activities/${date}/${timeSlot}/${activityId}/votes/${userId}`)
      if (vote === 0) {
        await remove(voteRef)
      } else {
        await set(voteRef, vote)
      }
      return { success: true }
    } catch (error) {
      console.error('Vote error:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    createTrip,
    joinTrip,
    getTrip,
    updateSelectedDates,
    toggleDate,
    setLockedDates,
    addActivity,
    updateActivity,
    deleteActivity,
    voteOnActivity
  }
}
