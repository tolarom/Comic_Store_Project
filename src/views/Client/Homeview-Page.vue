<template>
  <NavigationBar />
  <Slider />
  <div class="products-section">
    <div class="section-header">
      <h2 class="section-title">Featured Products</h2>
      <router-link to="/productpage" class="see-more-btn">
        See More
        <i class="pi pi-arrow-right"></i>
      </router-link>
    </div>
    <div class="products-grid">
      <ProductCard
        v-for="product in products.slice(0, 4)"
        :key="product.id"
        :product="product"
        @add-to-cart="addToCart"
      />
    </div>
  </div>
  <FooterPage />
</template>

<script setup lang="ts">
import NavigationBar from '@/components/client/NavigationBar.vue'
import Slider from '@/components/client/Slider.vue'
import ProductCard from '@/components/client/product-card.vue'
import FooterPage from '@/components/client/FooterPage.vue'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/data/products'
import { computed } from 'vue'

const cartStore = useCartStore()
const productsStore = useProductsStore()

const products = computed(() => productsStore.products)

const addToCart = (product: any) => {
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price
  cartStore.addToCart({
    id: product.id,
    name: product.title,
    price: discountedPrice,
    image: product.image,
  })
}
</script>

<style scoped>
.products-section {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.see-more-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #5f6fff;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(95, 111, 255, 0.2);
}

.see-more-btn:hover {
  background: #4a5dd8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(95, 111, 255, 0.3);
}

.see-more-btn i {
  font-size: 0.85rem;
  transition: transform 0.3s ease;
}

.see-more-btn:hover i {
  transform: translateX(4px);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 1rem;
  justify-items: center;
}
</style>
