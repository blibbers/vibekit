import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireVerification?: boolean
}

export function ProtectedRoute({ children, requireVerification = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireVerification && !user?.isEmailVerified) {
    return <Navigate to="/verify-email-pending" replace />
  }

  return <>{children}</>
}