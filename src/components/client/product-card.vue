<template>
    <div class="product-card">
        <h2 class="product-title">{{product.title}}</h2>
        <div class="image-cover">
        <img class="product-image" :v-if="image" :src="product.image" alt="product.image"/>
        </div>
        <h3 class="product-description">{{product.description}}</h3>
        <div class="product-footer">
            <div class="product-price">
                <p class="current-price">{{discountedPrice}}</p>
                <p class="original-price" v-if="product.discount">{{product.price}}</p>
            </div>
            <div class="discount-badge" v-if="product.discount">{{product.discount}}%</div>
            <button class="add-to-cart-btn" @click="addToCart">Add to Cart</button>
        </div>
        <StarRating
        :rating="product.rating"
        :read-only="true"
        :increment="0.5"
        :star-size="25"
        />
    </div>
</template>

<script lang="ts">
import StarRating from 'vue-star-rating'

export default {
    components: { StarRating },
    props: {
        product: {
            type: Object,
            required: true,
            image: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            discount: {
                type: Number,
                required: false,
                default: 0
            },
            rating: {
                type: Number,
                required: false,
                default: 0
            }
        }
        

    },
    computed: {
        discountedPrice() {
            if (this.product.discount) {
                return (this.product.price * (1 - this.product.discount / 100)).toFixed(2);
            }
            return this.product.price;
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.product);
        }
    }
};
</script>

<style scoped>
.product-card {
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
    width: 270px;
    height: 350px;
    margin-left: 15px;
    margin-right: 15px;
    cursor: pointer;
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
    position: relative;
    overflow: hidden;
    background: #f5f5f5;
    width: auto;
    height: 150px;
    object-fit: cover;
}

.discount-badge {
    position: relative;
    left: -20px;
}

.product-info {
    padding: 15px;
}

.product-title {
    margin: 0 0 8px;
    font-weight: 600;
}

.product-description {
    margin: 0 0 10px;
    color: #666;
}

.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
}

.product-price {
    display: flex;
    gap: 8px;
    align-items: center;
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
}

.add-to-cart-btn:hover {
    background: #0056b3;
}
</style>