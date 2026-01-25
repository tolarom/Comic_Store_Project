<template>
  <div class="product-card">
    <router-link :to="`/client/products/${product.id}`" class="product-link">
      <h2 class="product-title">{{ product.title }}</h2>
      <div class="image-cover">
        <img class="product-image" :src="product.image" :alt="product.title" />
      </div>
      <h3 class="product-subtitle">{{ product.subtitle }}</h3>
    </router-link>
    <div class="product-footer">
      <div class="product-price">
        <p class="current-price">{{ discountedPrice }}</p>
        <p class="original-price" v-if="product.discount">${{ Number(product.price).toFixed(2) }}</p>
      </div>
      <div class="discount-badge" v-if="product.discount">{{ Number(product.discount).toFixed(2) }}% off</div>
      <router-link :to="`/client/products/${product.id}`" class="view-item-btn">View Item</router-link>
    </div>
    <StarRating :rating="displayRating" :read-only="true" :increment="0.1" :star-size="starSize" />
  </div>
</template>

<script lang="ts">
import { ref, watch, onMounted } from 'vue'
import StarRating from 'vue-star-rating'
import { getAverageRating } from '../../services/api'

export default {
  components: { StarRating },
  props: {
    product: {
      type: Object,
      required: true,
      image: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      subtitle: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      afterDiscount: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        required: false,
        default: 0,
      },
      rating: {
        type: Number,
        required: false,
        default: 0,
      },
    },
  },
  setup(props) {
    const loadedRating = ref(props.product?.rating || 0)

    const loadRating = async () => {
      try {
        const productId = props.product?.backend_id || props.product?.id
        if (!productId) return

        const avgRating = await getAverageRating(String(productId))
        loadedRating.value = avgRating || 0
      } catch (error) {
        console.warn('Failed to load rating for product:', error)
        loadedRating.value = 0
      }
    }

    // Load rating when component mounts
    onMounted(() => {
      loadRating()
    })

    // Reload rating if product changes
    watch(
      () => props.product?.id,
      () => {
        loadRating()
      },
    )

    return {
      loadedRating,
    }
  },
  computed: {
    discountedPrice() {
      const price = Number(this.product.price) || 0
      const discount = Number(this.product.discount) || 0
      const result = discount ? price * (1 - discount / 100) : price
      return result.toFixed(2)
    },
    starSize() {
      // Responsive star size based on screen width
      if (typeof window !== 'undefined') {
        return window.innerWidth < 640 ? 15 : 20
      }
      return 20
    },
    displayRating() {
      return this.loadedRating || this.product?.rating || 0
    },
  },
  methods: {
    // Methods removed - View Item now uses router-link
  },
}
</script>

<style scoped>
.product-card {
  border-radius: 8px;
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  width: 100%;
  max-width: 270px;
  height: auto;
  min-height: 350px;
  margin: 15px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.product-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-cover {
  width: 100%;
  height: 150px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-image {
  width: 70%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-image:hover {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4444;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.product-info {
  padding: 15px;
  flex: 1;
}

.product-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.3;
}

.product-subtitle {
  margin: 0 0 10px;
  color: #666;
  font-size: 14px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.product-price {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 12px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff4444;
}

.add-to-cart-btn {
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  transition: background-color 0.3s ease;
}

.add-to-cart-btn:hover {
  background: #0056b3;
}

.view-item-btn {
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  transition: background-color 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.view-item-btn:hover {
  background: #0056b3;
}

/* Mobile responsive styles */
@media (max-width: 640px) {
  .product-card {
    max-width: 100%;
    margin: 6px;
    min-height: 260px;
  }

  .image-cover {
    height: 100px;
  }

  .product-info {
    padding: 8px;
  }

  .product-title {
    font-size: 13px;
    margin-bottom: 4px;
  }

  .product-subtitle {
    font-size: 11px;
    margin-bottom: 6px;
  }

  .current-price {
    font-size: 14px;
  }

  .original-price {
    font-size: 10px;
  }

  .add-to-cart-btn {
    padding: 5px 8px;
    font-size: 10px;
  }

  .view-item-btn {
    padding: 5px 8px;
    font-size: 10px;
  }

  .discount-badge {
    font-size: 9px;
    padding: 1px 3px;
    left: -12px;
  }

  .product-footer {
    margin-top: 6px;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .product-card {
    margin: 3px;
    min-height: 220px;
  }

  .image-cover {
    height: 80px;
  }

  .product-info {
    padding: 6px;
  }

  .product-title {
    font-size: 12px;
  }

  .current-price {
    font-size: 13px;
  }

  .add-to-cart-btn {
    padding: 4px 6px;
    font-size: 9px;
  }

  .view-item-btn {
    padding: 4px 6px;
    font-size: 9px;
  }
}
</style>
