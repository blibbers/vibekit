import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/lib/api'

export default function VerifyEmail() {
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleResendVerification = async () => {
    setIsResending(true)
    setError('')
    setMessage('')

    try {
      const response = await authApi.resendVerification()
      setMessage(response.message)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verify your email</CardTitle>
            <CardDescription>
              We sent you a verification email. Please check your inbox and click the verification link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <p className="text-sm text-muted-foreground text-center">
                Verification email sent to: <strong>{user.email}</strong>
              </p>
            )}
            
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Button 
                onClick={handleResendVerification} 
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Already verified?{' '}
                <a href="/login" className="underline underline-offset-4">
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}