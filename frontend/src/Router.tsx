import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import { AuthLayout } from './components/auth-layout'
import { ProtectedRoute } from './components/protected-route'
import { AdminProtectedRoute } from './components/admin-protected-route'
import { useAuth } from './contexts/AuthContext'
import NotMatch from './pages/NotMatch'
import Dashboard from './pages/Dashboard'
import Sample from './pages/Sample'
import ComingSoon from './pages/ComingSoon'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import VerifyEmailToken from './pages/VerifyEmailToken'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProductManagement from './pages/admin/ProductManagement'
import CreateProduct from './pages/admin/CreateProduct'
import EditProduct from './pages/admin/EditProduct'
import SubscriptionManagement from './pages/SubscriptionManagement'
import SubscriptionPlans from './pages/subscription/Plans'
import SubscriptionSuccess from './pages/subscription/Success'
import SubscriptionCancel from './pages/subscription/Cancel'

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user, isLoading } = useAuth()
    
    // Show loading spinner while checking auth status
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }
    
    if (isAuthenticated) {
        if (!user?.isEmailVerified) {
            return <Navigate to="/verify-email-pending" replace />
        }
        return <Navigate to="/" replace />
    }
    
    return <>{children}</>
}

export default function Router() {
    const { isLoading } = useAuth()
    
    // Show loading screen while auth is being determined
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        )
    }
    
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="signup" element={
                    <PublicRoute>
                        <Signup />
                    </PublicRoute>
                } />
            </Route>
            
            {/* Forgot Password routes - no auth layout wrapper needed */}
            <Route path="forgot-password" element={
                <PublicRoute>
                    <ForgotPassword />
                </PublicRoute>
            } />
            <Route path="reset-password" element={
                <PublicRoute>
                    <ResetPassword />
                </PublicRoute>
            } />
            
            <Route path="verify-email" element={<VerifyEmailToken />} />
            <Route path="verify-email-pending" element={<VerifyEmail />} />
            
            <Route element={
                <ProtectedRoute requireVerification>
                    <AppLayout />
                </ProtectedRoute>
            }>
                <Route path="" element={<Dashboard />} />
                <Route path="pages">
                    <Route path="sample" element={<Sample />} />
                    <Route path="feature" element={<ComingSoon />} />
                </Route>
                <Route path="subscription" element={<SubscriptionManagement />} />
                <Route path="subscription/plans" element={<SubscriptionPlans />} />
            </Route>
            
            {/* Subscription checkout routes (no sidebar layout) */}
            <Route path="subscription/success" element={
                <ProtectedRoute requireVerification>
                    <SubscriptionSuccess />
                </ProtectedRoute>
            } />
            <Route path="subscription/cancel" element={
                <ProtectedRoute requireVerification>
                    <SubscriptionCancel />
                </ProtectedRoute>
            } />
            
            {/* Admin-only routes */}
            <Route path="admin" element={
                <AdminProtectedRoute>
                    <AppLayout />
                </AdminProtectedRoute>
            }>
                <Route path="products" element={<ProductManagement />} />
                <Route path="products/create" element={<CreateProduct />} />
                <Route path="products/:id/edit" element={<EditProduct />} />
            </Route>
            
            <Route path="*" element={<NotMatch />} />
        </Routes>
    )
}
