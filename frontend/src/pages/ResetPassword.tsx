import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authApi } from '@/lib/api'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  
  const token = searchParams.get('token')

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setTokenValid(false)
      setError('No reset token provided. Please request a new password reset.')
      return
    }
    
    setTokenValid(true)
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords don\'t match')
      return
    }

    if (!token) {
      setError('Invalid reset token')
      return
    }

    setIsLoading(true)

    try {
      await authApi.resetPassword(token, password)
      setIsSuccess(true)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Password reset failed. The token may be invalid or expired.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    navigate('/login', { state: { message: 'Password reset successful! You can now sign in with your new password.' } })
  }

  // Show loading while checking token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="w-full max-w-md px-4">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show error if no token
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="w-full max-w-md px-4">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-xl">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/forgot-password')}
                  className="w-full"
                >
                  Request New Reset Link
                </Button>
                
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="w-full max-w-md px-4">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-xl">Password Reset Successful!</CardTitle>
              <CardDescription>
                Your password has been successfully updated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleContinue} className="w-full">
                Continue to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show password reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}