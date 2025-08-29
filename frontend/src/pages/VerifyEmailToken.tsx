import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailToken() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        // If no token, redirect to pending verification page
        navigate('/verify-email-pending')
        return
      }

      try {
        const response = await authApi.verifyEmail(token)
        setStatus('success')
        setMessage(response.message || 'Email verified successfully!')
        
        // Refresh user data to update isEmailVerified status
        await refreshUser()
      } catch (error: any) {
        setStatus('error')
        setMessage(error.response?.data?.error || 'Email verification failed. The token may be invalid or expired.')
      }
    }

    verifyToken()
  }, [token, navigate, refreshUser])

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/login', { state: { message: 'Email verified! You can now sign in.' } })
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === 'loading' && (
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-12 w-12 text-green-600" />
              )}
              {status === 'error' && (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
            </div>
            
            <CardTitle className="text-xl">
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Email verified!'}
              {status === 'error' && 'Verification failed'}
            </CardTitle>
            
            <CardDescription>
              {status === 'loading' && 'Please wait while we verify your email address.'}
              {status === 'success' && 'Your email has been successfully verified. You can now sign in to your account.'}
              {status === 'error' && 'We couldn\'t verify your email address. Please try again or request a new verification email.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {message && (
              <Alert variant={status === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            {status !== 'loading' && (
              <div className="space-y-2">
                <Button 
                  onClick={handleContinue}
                  className="w-full"
                  variant={status === 'success' ? 'default' : 'outline'}
                >
                  {status === 'success' ? 'Continue to Sign In' : 'Go to Sign In'}
                </Button>
                
                {status === 'error' && (
                  <Button 
                    onClick={() => navigate('/signup')}
                    variant="ghost"
                    className="w-full"
                  >
                    Create a new account
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}