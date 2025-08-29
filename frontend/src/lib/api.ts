import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we're not already on an auth page and not checking auth status
    if (error.response?.status === 401 && 
        !window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/signup') &&
        !error.config.url?.includes('/auth/me')) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
  isEmailVerified: boolean
  subscription?: {
    id: string
    status: string
    currentPeriodEnd: string
    plan: string
  }
}

export interface AuthResponse {
  message: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  sku: string
  stripePriceId?: string
  stripeProductId?: string
  isFree: boolean
  billingType?: 'one_time' | 'recurring'
  billingInterval?: 'day' | 'week' | 'month' | 'year'
  billingIntervalCount?: number
  tags?: string[]
  images?: string[]
  features?: string[]
  stock?: number
  isActive?: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

export interface CreateProductData {
  name: string
  description: string
  price: number
  category: string
  sku: string
  isFree: boolean
  billingType?: 'one_time' | 'recurring'
  billingInterval?: 'day' | 'week' | 'month' | 'year'
  billingIntervalCount?: number
  features: string[]
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', credentials)
    return data
  },

  async logout(): Promise<{ message: string }> {
    const { data } = await api.post('/auth/logout')
    return data
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const { data } = await api.get('/auth/me')
    return data
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/reset-password', { token, password })
    return data
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/verify-email', { token })
    return data
  },

  async resendVerification(): Promise<{ message: string }> {
    const { data } = await api.post('/auth/resend-verification')
    return data
  },
}

export interface ProductsResponse {
  products: Product[]
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
}

export const productApi = {
  async getAllProducts(): Promise<Product[]> {
    const { data } = await api.get<ProductsResponse>('/products')
    return data.products
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get(`/products/${id}`)
    return data.product
  },

  async createProduct(productData: CreateProductData): Promise<Product> {
    const { data } = await api.post('/products', productData)
    return data
  },

  async updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
    const { data } = await api.put(`/products/${id}`, productData)
    return data
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/products/${id}`)
    return data
  },
}

export interface SubscriptionDetails {
  id: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  cancelAt?: string
  stripeProduct?: any
  price?: any
}

export interface CurrentSubscriptionResponse {
  subscription: SubscriptionDetails | null
  currentProduct: Product | null
  hasActiveSubscription: boolean
}

export interface PaymentMethod {
  id: string
  type: string
  card: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
}

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[]
  defaultPaymentMethod: string | null
}

export interface Invoice {
  id: string
  amount_due: number
  amount_paid: number
  currency: string
  created: number
  status: string
  invoice_pdf: string
  hosted_invoice_url: string
  subscription?: any
  payment_intent?: any
}

export interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

export const subscriptionApi = {
  async getCurrentSubscription(): Promise<CurrentSubscriptionResponse> {
    const { data } = await api.get('/subscriptions/current')
    return data
  },

  async getInvoices(limit = 10): Promise<{ data: Invoice[] }> {
    const { data } = await api.get(`/subscriptions/invoices?limit=${limit}`)
    return data
  },

  async getPaymentMethods(): Promise<PaymentMethodsResponse> {
    const { data } = await api.get('/subscriptions/payment-methods')
    return data
  },

  async createSetupIntent(): Promise<{ clientSecret: string }> {
    const { data } = await api.post('/subscriptions/payment-methods/setup-intent')
    return data
  },

  async addPaymentMethod(paymentMethodId: string): Promise<{ message: string; paymentMethod: PaymentMethod }> {
    const { data } = await api.post('/subscriptions/payment-methods', { paymentMethodId })
    return data
  },

  async removePaymentMethod(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/subscriptions/payment-methods/${id}`)
    return data
  },

  async setDefaultPaymentMethod(id: string): Promise<{ message: string }> {
    const { data } = await api.put(`/subscriptions/payment-methods/${id}/default`)
    return data
  },

  async createCheckoutSession(priceId: string, successUrl: string, cancelUrl: string): Promise<CheckoutSessionResponse> {
    const { data } = await api.post('/subscriptions/checkout', { priceId, successUrl, cancelUrl })
    return data
  },

  async changePlan(priceId: string): Promise<{ message: string; subscription: any }> {
    const { data } = await api.put('/subscriptions/change-plan', { priceId })
    return data
  },

  async cancelSubscription(): Promise<{ message: string; subscription: any }> {
    const { data } = await api.post('/subscriptions/cancel')
    return data
  },

  async resumeSubscription(): Promise<{ message: string; subscription: any }> {
    const { data } = await api.post('/subscriptions/resume')
    return data
  },
}