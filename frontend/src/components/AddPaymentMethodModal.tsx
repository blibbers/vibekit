import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { subscriptionApi } from '@/lib/api'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

interface AddPaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function PaymentMethodForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create setup intent on backend
      const { clientSecret } = await subscriptionApi.createSetupIntent()

      // Confirm the setup intent with the card element
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message || 'Failed to add payment method')
      }

      if (!setupIntent?.payment_method) {
        throw new Error('No payment method created')
      }

      // Add the payment method to the user's account
      await subscriptionApi.addPaymentMethod(setupIntent.payment_method as string)

      toast.success('Payment method added successfully')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error adding payment method:', err)
      setError(err.message || 'Failed to add payment method')
      toast.error(err.message || 'Failed to add payment method')
    } finally {
      setIsLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '10px 12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Card Information
        </label>
        <div className="p-3 border rounded-lg bg-background">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-muted-foreground">
          Your card will be saved securely for future payments
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Adding...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default function AddPaymentMethodModal({ isOpen, onClose, onSuccess }: AddPaymentMethodModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new card to your account for subscriptions and payments
          </DialogDescription>
        </DialogHeader>
        
        <Elements stripe={stripePromise}>
          <PaymentMethodForm onClose={onClose} onSuccess={onSuccess} />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}