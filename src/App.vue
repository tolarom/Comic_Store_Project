<script lang="ts">
import productCard from "./components/client/product-card.vue";
export default {
  components: {
    productCard
  }
};
</script>

<template>
    <productCard
      :product="{
        image: 'https://media.burford.co.uk/images/SNY04089.jpg_edit.width-640_ln7jm6QxYVkHFHaT.jpg',
        title: 'Sample Product',
        description: 'This is a sample product description.',
        price: 29.99,
        discount: 10,
        rating: 3.5
      }">
    </productCard>

</template>

