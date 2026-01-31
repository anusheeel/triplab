import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AuthPage from './pages/AuthPage'
import WelcomePage from './pages/WelcomePage'
import CreateTripPage from './pages/CreateTripPage'
import JoinTripPage from './pages/JoinTripPage'
import CalendarPage from './pages/CalendarPage'
import PlanningPage from './pages/PlanningPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-espresso text-xl">Loading your journey...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function App() {
  return (
    <div className="min-h-screen bg-cream">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WelcomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateTripPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join/:code"
          element={
            <ProtectedRoute>
              <JoinTripPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:tripId/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:tripId/plan"
          element={
            <ProtectedRoute>
              <PlanningPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
