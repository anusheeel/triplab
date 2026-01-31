import { useState, useEffect, useCallback, useRef } from 'react'
import { database } from '../config/firebase'
import { ref, onValue, off } from 'firebase/database'

/**
 * Hook for real-time trip data synchronization
 * @param {string} tripId - Trip ID to subscribe to
 * @returns {{ trip: object | null, loading: boolean, error: string | null }}
 */
export function useRealtimeTrip(tripId) {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!tripId) {
      setLoading(false)
      setError('No trip ID provided')
      return
    }

    const tripRef = ref(database, `trips/${tripId}`)

    const unsubscribe = onValue(
      tripRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setTrip({ id: tripId, ...snapshot.val() })
          setError(null)
        } else {
          setTrip(null)
          setError('Trip not found')
        }
        setLoading(false)
      },
      (err) => {
        console.error('Realtime trip error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => {
      off(tripRef)
    }
  }, [tripId])

  return { trip, loading, error }
}

/**
 * Hook for real-time activities synchronization
 * @param {string} tripId - Trip ID
 * @param {string} date - Date to get activities for (optional)
 * @returns {{ activities: object, loading: boolean }}
 */
export function useRealtimeActivities(tripId, date = null) {
  const [activities, setActivities] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tripId) {
      setLoading(false)
      return
    }

    const path = date
      ? `trips/${tripId}/activities/${date}`
      : `trips/${tripId}/activities`
    const activitiesRef = ref(database, path)

    const unsubscribe = onValue(
      activitiesRef,
      (snapshot) => {
        setActivities(snapshot.val() || {})
        setLoading(false)
      },
      (err) => {
        console.error('Realtime activities error:', err)
        setLoading(false)
      }
    )

    return () => {
      off(activitiesRef)
    }
  }, [tripId, date])

  return { activities, loading }
}

/**
 * Hook for debounced date selection updates
 * Provides optimistic UI updates while debouncing writes to Firebase
 * @param {string} tripId - Trip ID
 * @param {string} userId - User ID
 * @param {string[]} initialDates - Initial selected dates
 * @param {function} updateFn - Function to update dates in Firebase
 * @returns {{ selectedDates: string[], toggleDate: function, setSelectedDates: function }}
 */
export function useDebouncedDateSelection(tripId, userId, initialDates, updateFn) {
  const [selectedDates, setSelectedDates] = useState(initialDates || [])
  const debounceRef = useRef(null)
  const pendingDatesRef = useRef(selectedDates)

  // Update local state when initialDates changes (from realtime sync)
  useEffect(() => {
    if (initialDates && JSON.stringify(initialDates) !== JSON.stringify(pendingDatesRef.current)) {
      setSelectedDates(initialDates)
      pendingDatesRef.current = initialDates
    }
  }, [initialDates])

  const debouncedUpdate = useCallback((dates) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      updateFn(tripId, userId, dates)
    }, 300) // 300ms debounce
  }, [tripId, userId, updateFn])

  const toggleDate = useCallback((date) => {
    setSelectedDates(prev => {
      const newDates = prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]

      pendingDatesRef.current = newDates
      debouncedUpdate(newDates)
      return newDates
    })
  }, [debouncedUpdate])

  const updateDates = useCallback((dates) => {
    setSelectedDates(dates)
    pendingDatesRef.current = dates
    debouncedUpdate(dates)
  }, [debouncedUpdate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return { selectedDates, toggleDate, setSelectedDates: updateDates }
}

/**
 * Hook for listening to specific user data changes
 * @param {string} tripId - Trip ID
 * @param {string} userId - User ID
 * @returns {{ userData: object | null, loading: boolean }}
 */
export function useRealtimeUser(tripId, userId) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tripId || !userId) {
      setLoading(false)
      return
    }

    const userRef = ref(database, `trips/${tripId}/users/${userId}`)

    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        setUserData(snapshot.val())
        setLoading(false)
      },
      (err) => {
        console.error('Realtime user error:', err)
        setLoading(false)
      }
    )

    return () => {
      off(userRef)
    }
  }, [tripId, userId])

  return { userData, loading }
}

/**
 * Hook for getting all users in a trip with real-time updates
 * @param {string} tripId - Trip ID
 * @returns {{ users: object, loading: boolean, userList: array }}
 */
export function useRealtimeUsers(tripId) {
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tripId) {
      setLoading(false)
      return
    }

    const usersRef = ref(database, `trips/${tripId}/users`)

    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        setUsers(snapshot.val() || {})
        setLoading(false)
      },
      (err) => {
        console.error('Realtime users error:', err)
        setLoading(false)
      }
    )

    return () => {
      off(usersRef)
    }
  }, [tripId])

  // Convert users object to array for easier iteration
  const userList = Object.entries(users).map(([id, data]) => ({
    id,
    ...data
  }))

  return { users, loading, userList }
}
