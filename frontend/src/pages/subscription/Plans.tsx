import PlanSelection from '@/components/PlanSelection'

export default function SubscriptionPlans() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Select the perfect plan for your needs. Upgrade or downgrade anytime.
        </p>
      </div>
      
      <PlanSelection />
    </div>
  )
}