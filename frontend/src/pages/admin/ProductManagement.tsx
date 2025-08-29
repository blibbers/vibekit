import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productApi, Product } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await productApi.getAllProducts()
      setProducts(data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await productApi.deleteProduct(id)
      setProducts(products.filter(p => p._id !== id))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete product')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <Button onClick={fetchProducts} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage subscription products and pricing</p>
        </div>
        <Button asChild>
          <Link to="/admin/products/create">Create Product</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products found</p>
            <Button asChild>
              <Link to="/admin/products/create">Create Your First Product</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {product.name}
                      <Badge variant="secondary">{product.sku}</Badge>
                    </CardTitle>
                    <CardDescription className="mb-2">{product.description}</CardDescription>
                    {product.features && product.features.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Features:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {product.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-current rounded-full flex-shrink-0"></span>
                              {feature}
                            </li>
                          ))}
                          {product.features.length > 3 && (
                            <li className="text-xs font-medium">
                              +{product.features.length - 3} more features
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {product.isFree ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        <>
                          ${product.price}
                          {product.billingType === 'recurring' && product.billingInterval && (
                            <span className="text-sm font-normal text-muted-foreground">
                              /{product.billingIntervalCount && product.billingIntervalCount > 1 ? `${product.billingIntervalCount} ` : ''}
                              {product.billingInterval}
                              {product.billingIntervalCount && product.billingIntervalCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <Badge 
                      variant={
                        product.isFree 
                          ? 'outline' 
                          : product.billingType === 'recurring' 
                          ? 'default' 
                          : 'secondary'
                      } 
                      className="mt-1"
                    >
                      {product.isFree 
                        ? 'Free' 
                        : product.billingType === 'recurring' 
                        ? 'Subscription' 
                        : 'One-time'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/admin/products/${product._id}/edit`}>Edit</Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}