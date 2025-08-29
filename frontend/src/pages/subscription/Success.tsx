import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { subscriptionApi, type CurrentSubscriptionResponse } from '@/lib/api'

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams()
  const [subscription, setSubscription] = useState<CurrentSubscriptionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const data = await subscriptionApi.getCurrentSubscription()
      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Subscription Successful!
          </CardTitle>
          <CardDescription>
            Your subscription has been activated successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription?.currentProduct && (
            <div className=" p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Plan Details</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Plan:</span> {subscription.currentProduct.name}</p>
                <p><span className="font-medium">Price:</span> ${subscription.currentProduct.price}/{subscription.currentProduct.billingInterval}</p>
                {subscription.subscription && (
                  <p><span className="font-medium">Next billing:</span> {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/subscription">Manage Subscription</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>

          {sessionId && (
            <div className="text-sm text-muted-foreground text-center">
              <p>Session ID: {sessionId}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}