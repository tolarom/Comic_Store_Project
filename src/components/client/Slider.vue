<template>
  <div class="slider">
    <div
      v-for="(slide, index) in slides"
      :key="index"
      class="slide"
      :class="{ active: currentSlide === index }"
      :style="{ backgroundColor: slide.bg }"
    >
      <div class="content">
        <h1>{{ slide.title }}</h1>
        <p>{{ slide.subtitle }}</p>
        <button>Shop Now</button>
      </div>

      <div class="image">
        <img :src="slide.image" alt="product" />
      </div>
    </div>

    <div class="dots">
      <span
        v-for="(slide, index) in slides"
        :key="index"
        :class="{ active: currentSlide === index }"
        @click="currentSlide = index"
      ></span>
    </div>
  </div>
</template>

<script>
import promo1 from '@/assets/promo1.png'
import promo2 from '@/assets/promo2.png'
import promo3 from '@/assets/promo3.png'

export default {
  name: "Slider",
  data() {
    return {
      currentSlide: 0,
      slides: [
        {
          title: "Up to 30% offer",
          subtitle: "Enjoy our big offer",
          bg: "#ffffff",
          image: promo1
        },
        {
          title: "Mid - Year Discount",
          subtitle: "Enjoy our big offer",
          bg: "#c13b3b",
          image: promo2
        },
        {
          title: "Up to 30% offer",
          subtitle: "Enjoy our big offer",
          bg: "#55c53a",
          image: promo3
        }
      ]
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length
    }, 5000)
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
  }
}
</script>


<style scoped>
.slider {
  position: relative;
  height: 600px;
  overflow: hidden;
  background: white; /* Matches the white background */
}

.slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;           
  justify-content: space-between; 
  padding: 100px;              
  opacity: 0;
  transition: opacity 0.8s ease;
}

.slide.active {
  opacity: 1;
}

.content {
  flex: 1;
  max-width: 600px;
  text-align: left;             /* Left-align text */
  z-index: 2;
}

.content h1 {
  font-size: 48px;              /* Larger like in the image */
  margin-bottom: 20px;
  color: #000;
}

.content p {
  font-size: 24px;              /* Bigger subtitle */
  margin-bottom: 40px;
  color: #333;
  opacity: 0.9;
}

.content button {
  background: black;
  color: white;
  padding: 16px 40px;
  border-radius: 50px;          /* Fully rounded like the screenshot */
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: background 0.3s;
}

.content button:hover {
  background: #333;
}

.image {
  display: flex;
  justify-content: center;      /* Center image horizontally */
  align-items: center;          /* Center image vertically */
  z-index: 1;
}

.image img {
  max-height: 400px;            /* Larger to fill more space */
  max-width: 100%;
  object-fit: contain;
  transform: translateX(-50px); /* Slight overlap/pull toward text for dynamic feel */
}

.dots {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
}

.dots span {
  width: 12px;
  height: 12px;
  background: red;              /* Inactive = red */
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s;
}

.dots span.active {
  width: 28px;                  /* Elongated when active */
  border-radius: 20px;
  background: #007bff;          /* Active = blue like in screenshot */
  opacity: 1;
}
</style>