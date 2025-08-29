import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  CreditCard, 
  Download, 
  ExternalLink, 
  Loader2, 
  Settings, 
  X, 
  ChevronDown,
  Package,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { 
  subscriptionApi, 
  type CurrentSubscriptionResponse, 
  type PaymentMethodsResponse, 
  type Invoice,
  type PaymentMethod
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import PlanSelection from '@/components/PlanSelection'
import { cn } from '@/lib/utils'

export default function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<CurrentSubscriptionResponse | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isResuming, setIsResuming] = useState(false)
  const [removingPaymentMethod, setRemovingPaymentMethod] = useState<string | null>(null)
  const [settingDefaultPaymentMethod, setSettingDefaultPaymentMethod] = useState<string | null>(null)
  const [paymentMethodToRemove, setPaymentMethodToRemove] = useState<PaymentMethod | null>(null)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  
  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    overview: true,
    plans: false,
    billing: false,
    payments: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [subscriptionData, paymentMethodsData, invoicesData] = await Promise.all([
        subscriptionApi.getCurrentSubscription(),
        subscriptionApi.getPaymentMethods().catch(() => ({ paymentMethods: [], defaultPaymentMethod: null })),
        subscriptionApi.getInvoices().catch(() => ({ data: [] }))
      ])
      
      setSubscription(subscriptionData)
      setPaymentMethods(paymentMethodsData)
      setInvoices(invoicesData.data)
    } catch (error: any) {
      toast.error('Failed to load subscription data')
      console.error('Error fetching subscription data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Only fetch payment methods to avoid full rerender
  const refreshPaymentMethods = async () => {
    try {
      const paymentMethodsData = await subscriptionApi.getPaymentMethods()
      setPaymentMethods(paymentMethodsData)
    } catch (error) {
      console.error('Error refreshing payment methods:', error)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription?.hasActiveSubscription) return
    
    try {
      setIsCancelling(true)
      await subscriptionApi.cancelSubscription()
      toast.success('Subscription will be cancelled at the end of the current billing period')
      await fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel subscription')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleResumeSubscription = async () => {
    if (!subscription?.hasActiveSubscription) return
    
    try {
      setIsResuming(true)
      await subscriptionApi.resumeSubscription()
      toast.success('Subscription resumed successfully')
      await fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resume subscription')
    } finally {
      setIsResuming(false)
    }
  }

  const handleRemovePaymentMethod = async () => {
    if (!paymentMethodToRemove) return
    
    try {
      setRemovingPaymentMethod(paymentMethodToRemove.id)
      await subscriptionApi.removePaymentMethod(paymentMethodToRemove.id)
      toast.success('Payment method removed successfully')
      await refreshPaymentMethods() // Only refresh payment methods
      setShowRemoveDialog(false)
      setPaymentMethodToRemove(null)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove payment method')
    } finally {
      setRemovingPaymentMethod(null)
    }
  }

  const initiateRemovePaymentMethod = (method: PaymentMethod) => {
    setPaymentMethodToRemove(method)
    setShowRemoveDialog(true)
  }

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setSettingDefaultPaymentMethod(paymentMethodId)
      await subscriptionApi.setDefaultPaymentMethod(paymentMethodId)
      toast.success('Default payment method updated successfully')
      await refreshPaymentMethods() // Only refresh payment methods
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to set default payment method')
    } finally {
      setSettingDefaultPaymentMethod(null)
    }
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const formatDate = (timestamp: number | string) => {
    const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatAmount = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">Active</Badge>
      case 'past_due':
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">Past Due</Badge>
      case 'canceled':
        return <Badge variant="secondary">Cancelled</Badge>
      case 'incomplete':
        return <Badge variant="outline">Incomplete</Badge>
      case 'trialing':
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">Trial</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subscription Management</h1>
        <p className="text-muted-foreground mt-2">Manage your subscription, billing, and payment methods</p>
      </div>

      {/* Quick Status Bar */}
      {subscription?.currentProduct && (
        <Card className="mb-6 border-2">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{subscription.currentProduct.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {subscription.subscription && getStatusBadge(subscription.subscription.status)}
                    {subscription.subscription?.cancelAtPeriodEnd && (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-700 dark:text-red-400">
                        Cancelling
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-2xl font-bold">
                  {subscription.currentProduct.isFree ? (
                    <span className="text-green-600 dark:text-green-400">FREE</span>
                  ) : (
                    <>
                      ${subscription.currentProduct.price}
                      {subscription.currentProduct.billingType === 'recurring' && 
                       subscription.currentProduct.billingInterval && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /{subscription.currentProduct.billingInterval}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {subscription.subscription && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Next billing: {formatDate(subscription.subscription.currentPeriodEnd)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {/* Overview Section */}
        <Card className="overflow-hidden">
          <Collapsible open={openSections.overview} onOpenChange={() => toggleSection('overview')}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <CardTitle className="text-base sm:text-lg">Subscription Overview</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Current plan details and features</CardDescription>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    openSections.overview && "rotate-180"
                  )} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {subscription?.currentProduct ? (
                  <div className="space-y-6">
                    {subscription.subscription && (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Billing Period</p>
                            <p className="text-sm">
                              {formatDate(subscription.subscription.currentPeriodStart)} - {formatDate(subscription.subscription.currentPeriodEnd)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                            <p className="text-sm">
                              {paymentMethods?.paymentMethods.length ? (
                                <>
                                  {paymentMethods.paymentMethods.find(m => m.id === paymentMethods.defaultPaymentMethod)?.card.brand} •••• 
                                  {paymentMethods.paymentMethods.find(m => m.id === paymentMethods.defaultPaymentMethod)?.card.last4}
                                </>
                              ) : (
                                'No payment method'
                              )}
                            </p>
                          </div>
                        </div>

                        <Separator />
                      </>
                    )}

                    {subscription.currentProduct.features && subscription.currentProduct.features.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 text-sm">Included Features</h4>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {subscription.currentProduct.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {subscription.subscription && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {subscription.subscription.cancelAtPeriodEnd ? (
                          <Button 
                            onClick={handleResumeSubscription}
                            disabled={isResuming}
                            className="w-full sm:w-auto"
                          >
                            {isResuming ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Resuming...
                              </>
                            ) : (
                              'Resume Subscription'
                            )}
                          </Button>
                        ) : (
                          <Button 
                            variant="destructive"
                            onClick={handleCancelSubscription}
                            disabled={isCancelling}
                            className="w-full sm:w-auto"
                          >
                            {isCancelling ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Cancelling...
                              </>
                            ) : (
                              'Cancel Subscription'
                            )}
                          </Button>
                        )}
                        <Button variant="outline" asChild className="w-full sm:w-auto">
                          <Link to="/subscription/plans">Change Plan</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No active subscription found</p>
                    <Button asChild>
                      <Link to="/subscription/plans">Browse Plans</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Plans Section */}
        <Card className="overflow-hidden">
          <Collapsible open={openSections.plans} onOpenChange={() => toggleSection('plans')}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <CardTitle className="text-base sm:text-lg">Available Plans</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Browse and switch between plans</CardDescription>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    openSections.plans && "rotate-180"
                  )} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <PlanSelection showCurrentPlan={false} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Billing History Section */}
        <Card className="overflow-hidden">
          <Collapsible open={openSections.billing} onOpenChange={() => toggleSection('billing')}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <CardTitle className="text-base sm:text-lg">Billing History</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {invoices.length > 0 ? `${invoices.length} invoices` : 'View invoices and receipts'}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    openSections.billing && "rotate-180"
                  )} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {invoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded bg-muted">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm">Invoice #{invoice.id.slice(-8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(invoice.created)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 ml-9 sm:ml-0">
                          <div className="text-left sm:text-right">
                            <p className="font-semibold text-sm">{formatAmount(invoice.amount_paid, invoice.currency)}</p>
                            <Badge 
                              variant={invoice.status === 'paid' ? 'default' : 'destructive'}
                              className="text-xs mt-1"
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                              <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                              <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No invoices found</p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Payment Methods Section */}
        <Card className="overflow-hidden">
          <Collapsible open={openSections.payments} onOpenChange={() => toggleSection('payments')}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <CardTitle className="text-base sm:text-lg">Payment Methods</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {paymentMethods?.paymentMethods.length 
                          ? `${paymentMethods.paymentMethods.length} card${paymentMethods.paymentMethods.length > 1 ? 's' : ''} on file`
                          : 'Manage payment methods'
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    openSections.payments && "rotate-180"
                  )} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {subscription?.hasActiveSubscription && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      To add a new payment method, please upgrade or change your plan.
                    </AlertDescription>
                  </Alert>
                )}

                {paymentMethods && paymentMethods.paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.paymentMethods.map((method) => {
                      const isDefault = paymentMethods.defaultPaymentMethod === method.id
                      const canRemove = subscription?.hasActiveSubscription 
                        ? paymentMethods.paymentMethods.length > 1 
                        : true
                      
                      return (
                        <div key={method.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded bg-muted">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium capitalize text-sm">
                                {method.card.brand} •••• {method.card.last4}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Expires {method.card.exp_month}/{method.card.exp_year}
                              </p>
                              {isDefault && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-9 sm:ml-0">
                            {!isDefault && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                disabled={settingDefaultPaymentMethod === method.id}
                              >
                                {settingDefaultPaymentMethod === method.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Set Default'
                                )}
                              </Button>
                            )}
                            
                            {canRemove ? (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => initiateRemovePaymentMethod(method)}
                                disabled={removingPaymentMethod === method.id}
                                className="text-destructive hover:text-destructive"
                              >
                                {removingPaymentMethod === method.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground px-2">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No payment methods found</p>
                    <p className="text-sm text-muted-foreground">
                      Payment methods will be added when you upgrade to a paid plan.
                    </p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Remove Payment Method Alert Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method?
              {paymentMethodToRemove && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium capitalize">
                      {paymentMethodToRemove.card.brand} •••• {paymentMethodToRemove.card.last4}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Expires {paymentMethodToRemove.card.exp_month}/{paymentMethodToRemove.card.exp_year}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setPaymentMethodToRemove(null)
                setShowRemoveDialog(false)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePaymentMethod}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removingPaymentMethod !== null}
            >
              {removingPaymentMethod ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Removing...
                </span>
              ) : (
                'Remove Payment Method'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}