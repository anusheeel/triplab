import { createContext, useContext, useState, useEffect } from 'react'
import { auth, database, googleProvider } from '../config/firebase'
import {
  signInAnonymously,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { ref, set, get } from 'firebase/database'

const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Try to get existing user data from database
        const userRef = ref(database, `users/${firebaseUser.uid}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            isAnonymous: firebaseUser.isAnonymous,
            ...snapshot.val()
          })
        } else {
          // User exists but no profile yet
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            isAnonymous: firebaseUser.isAnonymous,
            displayName: firebaseUser.displayName || null
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Anonymous sign in with display name
  const signInAnonymouslyWithName = async (displayName) => {
    try {
      const { user: firebaseUser } = await signInAnonymously(auth)

      const userRef = ref(database, `users/${firebaseUser.uid}`)
      const userData = {
        displayName,
        isAnonymous: true,
        createdAt: Date.now()
      }
      await set(userRef, userData)

      setUser({
        uid: firebaseUser.uid,
        isAnonymous: true,
        ...userData
      })

      return { success: true, user: firebaseUser }
    } catch (error) {
      console.error('Anonymous sign in error:', error)
      return { success: false, error: error.message }
    }
  }

  // Google sign in
  const signInWithGoogle = async () => {
    try {
      const { user: firebaseUser } = await signInWithPopup(auth, googleProvider)

      const userRef = ref(database, `users/${firebaseUser.uid}`)
      const snapshot = await get(userRef)

      let userData
      if (snapshot.exists()) {
        // Existing user - update last login
        userData = snapshot.val()
        await set(userRef, { ...userData, lastLoginAt: Date.now() })
      } else {
        // New user
        userData = {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          isAnonymous: false,
          createdAt: Date.now()
        }
        await set(userRef, userData)
      }

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        isAnonymous: false,
        ...userData
      })

      return { success: true, user: firebaseUser }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { success: false, error: error.message }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
  }

  // Update display name
  const updateDisplayName = async (displayName) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const userRef = ref(database, `users/${user.uid}/displayName`)
      await set(userRef, displayName)
      setUser(prev => ({ ...prev, displayName }))
      return { success: true }
    } catch (error) {
      console.error('Update display name error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    signInAnonymouslyWithName,
    signInWithGoogle,
    signOut,
    updateDisplayName,
    isAuthenticated: !!user?.displayName
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
