<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- LEFT: Images -->
      <div class="flex gap-6">
        <!-- Thumbnails -->
        <div class="flex flex-col gap-4">
          <img
            v-for="(img, i) in images"
            :key="i"
            :src="img"
            class="w-20 h-24 object-cover border rounded-md cursor-pointer hover:ring-4 hover:ring-indigo-500 transition"
            @click="mainImage = img"
          />
        </div>

        <!-- Main Image -->
        <div class="flex-1">
          <img
            :src="mainImage"
            class="w-full h-auto max-h-screen object-contain rounded-lg shadow-lg"
            alt="Product main view"
          />
        </div>
      </div>

      <!-- RIGHT: Product Info -->
      <div class="flex flex-col justify-start">
        <h1 class="text-3xl font-bold uppercase text-gray-900">
          CYBERPUNK: EDGERUNNERS
        </h1>
        <p class="text-gray-500 mt-1 text-lg">
          David & Lucy Crew Neck Sweatshirt
        </p>

        <!-- Rating -->
        <div class="flex items-center gap-3 mt-4">
          <div class="flex text-red-500 text-xl">
            ★★★★☆
          </div>
          <span class="text-sm text-gray-500">(5 Reviews)</span>
        </div>

        <!-- Price -->
        <div class="flex items-center gap-4 mt-6">
          <span class="text-3xl font-bold text-red-500">$45.00</span>
          <span class="text-xl text-gray-400 line-through">$75.00</span>
        </div>

        <hr class="my-8 border-gray-300" />

        <!-- Description -->
        <ul class="space-y-2 text-sm text-gray-600 list-disc pl-5">
          <li>Pigment printed David and Lucy on the front</li>
          <li>Printed logo on the front chest</li>
          <li>HD ink-printed icon on the front</li>
          <li>HD ink-printed letters on the back</li>
          <li>Embroidered Atsuko logo on the sleeve</li>
          <li>Fleece: 60% Cotton, 40% Polyester</li>
          <li>Ribbed banded cuffs, neck, and waist</li>
          <li>Imported</li>
          <li>Officially licensed Cyberpunk: Edgerunners merchandise</li>
        </ul>

        <!-- Size Selector -->
        <div class="mt-10">
          <p class="font-semibold mb-4 text-lg">Size:</p>
          <div class="flex gap-4 flex-wrap">
            <button
              v-for="size in sizes"
              :key="size"
              @click="selectedSize = size"
              class="w-14 h-14 border-2 rounded-md text-sm font-semibold transition"
              :class="selectedSize === size
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-500'"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Quantity Selector -->
        <div class="mt-8 flex items-center gap-6">
          <p class="font-semibold text-lg">Quantity:</p>
          <div class="flex items-center border-2 border-gray-300 rounded-md">
            <button
              class="px-5 py-3 hover:bg-gray-100 transition"
              @click="qty > 1 && qty--"
            >−</button>
            <span class="px-6 py-3 border-x-2 border-gray-300 font-medium">{{ qty }}</span>
            <button
              class="px-5 py-3 hover:bg-gray-100 transition"
              @click="qty++"
            >+</button>
          </div>
        </div>

        <!-- Add to Cart Button -->
        <button
          class="mt-10 w-full bg-indigo-600 text-white py-5 rounded-lg font-bold text-lg hover:bg-indigo-700 transition shadow-md"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Replace these URLs with your own hosted images if needed.
// These are public examples of similar merchandise views.
const images = ref([
  'https://c.p02.c4a.im/images/item/14771735/d9206c80acbfe054b8ee266203492eb0d199567eb85b83b3ebe4bc47d1f575b5?d=583x585', // Front view (David & Lucy print)
  'https://i.etsystatic.com/54712522/r/il/642dd0/7401731369/il_fullxfull.7401731369_6y4i.jpg', // Back/side view example
  'https://m.media-amazon.com/images/I/71QqEJCPjkL.jpg', // Alternative angle
  'https://i.etsystatic.com/25815087/r/il/5988ea/4298578209/il_fullxfull.4298578209_72md.jpg', // Detail view
]);

const mainImage = ref(images.value[0]);
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3X'];
const selectedSize = ref('M');
const qty = ref(1);
</script>

<style scoped>
/* Optional: Add any custom styles here */
</style>