import { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { productApi, subscriptionApi, Product, type CurrentSubscriptionResponse } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface PlanSelectionProps {
  onPlanSelect?: (product: Product) => void
  showCurrentPlan?: boolean
}

export default function PlanSelection({ onPlanSelect, showCurrentPlan = true }: PlanSelectionProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscriptionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null)
  const { } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [productsData, subscriptionData] = await Promise.all([
        productApi.getAllProducts(),
        subscriptionApi.getCurrentSubscription()
      ])
      
      // Sort products: free first, then by price
      const sortedProducts = productsData
        .filter(p => p.isActive)
        .sort((a, b) => {
          if (a.isFree && !b.isFree) return -1
          if (!a.isFree && b.isFree) return 1
          return a.price - b.price
        })
      
      setProducts(sortedProducts)
      setCurrentSubscription(subscriptionData)
    } catch (error: any) {
      toast.error('Failed to load plans')
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPlan = async (product: Product) => {
    if (onPlanSelect) {
      onPlanSelect(product)
      return
    }

    if (product.isFree) {
      toast.error('You are already on the free plan')
      return
    }

    try {
      setIsUpgrading(product._id)
      
      const successUrl = `${window.location.origin}/subscription/success`
      const cancelUrl = `${window.location.origin}/subscription`
      
      const { url } = await subscriptionApi.createCheckoutSession(
        product.stripePriceId!,
        successUrl,
        cancelUrl
      )
      
      window.location.href = url
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start checkout')
      console.error('Error creating checkout session:', error)
    } finally {
      setIsUpgrading(null)
    }
  }

  const getCurrentPlanId = () => {
    if (!currentSubscription) return null
    return currentSubscription.currentProduct?._id || null
  }

  const isCurrentPlan = (productId: string) => {
    return getCurrentPlanId() === productId
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showCurrentPlan && currentSubscription?.currentProduct && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentSubscription.currentProduct.name}
                <Badge variant="secondary">Current</Badge>
              </CardTitle>
              <CardDescription>{currentSubscription.currentProduct.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {currentSubscription.currentProduct.isFree ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    <>
                      ${currentSubscription.currentProduct.price}
                      {currentSubscription.currentProduct.billingType === 'recurring' && 
                       currentSubscription.currentProduct.billingInterval && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /{currentSubscription.currentProduct.billingIntervalCount && 
                            currentSubscription.currentProduct.billingIntervalCount > 1 ? 
                            `${currentSubscription.currentProduct.billingIntervalCount} ` : ''}
                          {currentSubscription.currentProduct.billingInterval}
                          {currentSubscription.currentProduct.billingIntervalCount && 
                           currentSubscription.currentProduct.billingIntervalCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {currentSubscription.subscription?.cancelAtPeriodEnd && (
                  <Badge variant="destructive">Cancelling</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const isCurrentlySelected = isCurrentPlan(product._id)
            const isPopular = !product.isFree && product.name.toLowerCase().includes('premium')
            
            return (
              <Card 
                key={product._id} 
                className={`relative ${
                  isCurrentlySelected 
                    ? 'border-2 border-blue-500' 
                    : isPopular 
                    ? 'border-2 border-purple-200' 
                    : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">Popular</Badge>
                  </div>
                )}
                {isCurrentlySelected && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Current Plan</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <CardDescription className="text-sm">{product.description}</CardDescription>
                  
                  <div className="py-4">
                    <div className="text-4xl font-bold">
                      {product.isFree ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        <>
                          <span>${product.price}</span>
                          {product.billingType === 'recurring' && product.billingInterval && (
                            <span className="text-lg font-normal text-muted-foreground">
                              /{product.billingIntervalCount && product.billingIntervalCount > 1 ? 
                                `${product.billingIntervalCount} ` : ''}
                              {product.billingInterval}
                              {product.billingIntervalCount && product.billingIntervalCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {product.features && product.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Features included:</h4>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    {isCurrentlySelected ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleSelectPlan(product)}
                        disabled={isUpgrading !== null}
                        className={`w-full ${
                          product.isFree 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : isPopular 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : ''
                        }`}
                      >
                        {isUpgrading === product._id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : product.isFree ? (
                          'Switch to Free'
                        ) : (
                          'Upgrade to ' + product.name
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}