import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productApi, UpdateProductData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FeaturesInput } from '@/components/ui/features-input'

export default function EditProduct() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<UpdateProductData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    sku: '',
    isFree: false,
    billingType: 'recurring',
    billingInterval: 'month',
    billingIntervalCount: 1,
    features: []
  })

  useEffect(() => {
    if (id) {
      fetchProduct(id)
    }
  }, [id])

  const fetchProduct = async (productId: string) => {
    try {
      setIsLoadingProduct(true)
      setError(null)
      const product = await productApi.getProductById(productId)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        sku: product.sku,
        isFree: product.isFree,
        billingType: product.billingType,
        billingInterval: product.billingInterval,
        billingIntervalCount: product.billingIntervalCount,
        features: product.features || []
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch product')
    } finally {
      setIsLoadingProduct(false)
    }
  }

  const handleInputChange = (field: keyof UpdateProductData, value: string | number | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.category || !formData.sku) {
      setError('All fields are required')
      return
    }

    if (!formData.isFree && formData.price && formData.price <= 0) {
      setError('Price must be greater than 0 for paid products')
      return
    }

    if (!id) {
      setError('Product ID is required')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await productApi.updateProduct(id, formData)
      navigate('/admin/products')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update product')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error && isLoadingProduct) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <Button onClick={() => id && fetchProduct(id)} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Update the product information below
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
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Premium Plan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your product..."
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFree"
                  checked={formData.isFree || false}
                  onCheckedChange={(checked) => {
                    handleInputChange('isFree', checked as boolean)
                    if (checked) {
                      handleInputChange('price', 0)
                    }
                  }}
                />
                <Label htmlFor="isFree" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  This is a free product
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) {!formData.isFree ? '*' : ''}</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.isFree ? 0 : (formData.price || 0)}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required={!formData.isFree}
                    disabled={formData.isFree}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="e.g., Subscription"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="e.g., PREMIUM-001"
                required
              />
              <p className="text-sm text-muted-foreground">
                Unique product identifier for inventory management
              </p>
            </div>

            {!formData.isFree && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium">Billing Configuration</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="billingType">Billing Type *</Label>
                  <Select 
                    value={formData.billingType || 'recurring'} 
                    onValueChange={(value: 'one_time' | 'recurring') => handleInputChange('billingType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recurring">Recurring Subscription</SelectItem>
                      <SelectItem value="one_time">One-time Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.billingType === 'recurring' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billingInterval">Billing Interval *</Label>
                        <Select 
                          value={formData.billingInterval || 'month'} 
                          onValueChange={(value: 'day' | 'week' | 'month' | 'year') => handleInputChange('billingInterval', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">Daily</SelectItem>
                            <SelectItem value="week">Weekly</SelectItem>
                            <SelectItem value="month">Monthly</SelectItem>
                            <SelectItem value="year">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billingIntervalCount">Interval Count *</Label>
                        <Input
                          id="billingIntervalCount"
                          type="number"
                          min="1"
                          value={formData.billingIntervalCount || 1}
                          onChange={(e) => handleInputChange('billingIntervalCount', parseInt(e.target.value) || 1)}
                          placeholder="1"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          e.g., "2" with "month" = every 2 months
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="space-y-4 border-t pt-4">
              <FeaturesInput
                features={formData.features || []}
                onChange={(features) => handleInputChange('features', features)}
                label="Product Features"
                placeholder="e.g., Unlimited access, Priority support, Advanced analytics..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/products')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}