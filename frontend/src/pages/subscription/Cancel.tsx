import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SubscriptionCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Checkout Cancelled
          </CardTitle>
          <CardDescription>
            Your subscription checkout was cancelled. No payment was processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Don't worry! You can try again anytime. Your current plan remains active and unchanged.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/subscription/plans">View Plans Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/subscription">Manage Subscription</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}