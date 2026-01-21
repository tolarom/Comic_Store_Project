import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAllProducts } from '@/services/api'
import type { Product } from '@/services/api'

export interface ProductItem {
  id: number
  title: string
  subtitle: string
  description?: string
  price: number
  discount: number
  rating: number
  reviewCount?: number
  image: string
  category?: string
  stock?: number
  sales?: number
}

// No mock data - only use API

export const useProductsStore = defineStore('products', () => {
  const products = ref<ProductItem[]>([])

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from API...')
      const backendProducts = await getAllProducts()

      if (backendProducts && Array.isArray(backendProducts) && backendProducts.length > 0) {
        console.log('Products fetched from API:', backendProducts)
        // Transform backend products to local format
        products.value = backendProducts.map((p: Product, index: number) => ({
          id: index + 1,
          title: p.title || 'Untitled',
          subtitle: p.category || 'Product',
          description: p.description || '',
          price: p.price || 0,
          discount: 0,
          rating: 0,
          reviewCount: 0,
          image: p.image_url || '',
          category: p.category || '',
          stock: p.stock || 0,
          sales: 0,
        }))
      } else {
        console.log('No products from API')
      }
    } catch (error) {
      console.error('Failed to fetch products from API:', error)
      throw error // Re-throw so component knows it failed
    }
  }

  const getById = (id: number) => products.value.find((p) => p.id === id)

  const discountedPriceById = (id: number) => {
    const p = getById(id)
    if (!p) return 0
    return p.discount ? Number((p.price * (1 - p.discount / 100)).toFixed(2)) : p.price
  }

  return { products, fetchProducts, getById, discountedPriceById }
})
