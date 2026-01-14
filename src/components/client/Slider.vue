<template>
  <div class="slider">
    <div
      v-for="(slide, index) in slides"
      :key="index"
      class="slide"
      :class="{
        active: currentSlide === index,
        'slide-enter': slideDirection === 'next' && currentSlide === index,
        'slide-exit': slideDirection === 'prev' && currentSlide === index,
      }"
      :style="{ backgroundColor: slide.bg }"
    >
      <div class="content">
        <h1 class="title-animate">{{ slide.title }}</h1>
        <p class="subtitle-animate">{{ slide.subtitle }}</p>
        <button class="shop-button">Shop Now</button>
      </div>

      <div class="image">
        <img :src="slide.image" alt="product" class="image-animate" />
      </div>
    </div>

    <!-- Navigation Arrows -->
    <button class="nav-button nav-prev" @click="prevSlide" aria-label="Previous slide">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button class="nav-button nav-next" @click="nextSlide" aria-label="Next slide">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Dots Navigation -->
    <div class="dots">
      <span
        v-for="(slide, index) in slides"
        :key="index"
        :class="{ active: currentSlide === index }"
        @click="goToSlide(index)"
      ></span>
    </div>

    <!-- Slide Counter -->
    <div class="slide-counter">
      <span class="current">{{ currentSlide + 1 }}</span>
      <span class="separator">/</span>
      <span class="total">{{ slides.length }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import promo1 from '@/assets/promo1.png'
import promo2 from '@/assets/promo2.png'
import promo3 from '@/assets/promo3.png'
import { sliderData } from '@/data/sliderData'

export default {
  data() {
    return {
      currentSlide: 0,
      slideDirection: 'next',
      autoSlideTimer: null as NodeJS.Timeout | null,
      isAutoSliding: true,
      slides: sliderData,
    }
  },
  methods: {
    nextSlide() {
      this.slideDirection = 'next'
      this.currentSlide = (this.currentSlide + 1) % this.slides.length
    },
    prevSlide() {
      this.slideDirection = 'prev'
      this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length
    },
    goToSlide(index: number) {
      this.slideDirection = index > this.currentSlide ? 'next' : 'prev'
      this.currentSlide = index
    },
    pauseAutoSlide() {
      this.isAutoSliding = false
      if (this.autoSlideTimer) {
        clearInterval(this.autoSlideTimer)
      }
    },
    resumeAutoSlide() {
      this.isAutoSliding = true
      this.startAutoSlide()
    },
    startAutoSlide() {
      if (this.autoSlideTimer) {
        clearInterval(this.autoSlideTimer)
      }
      this.autoSlideTimer = setInterval(() => {
        if (this.isAutoSliding) {
          this.nextSlide()
        }
      }, 4500)
    },
  },
  mounted() {
    this.startAutoSlide()
  },
  beforeUnmount() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer)
    }
  },
}
</script>

<style scoped>
.slider {
  position: relative;
  height: 600px;
  overflow: hidden;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 100px;
  opacity: 0;
  transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide.active {
  opacity: 1;
  z-index: 10;
}

.slide-enter {
  animation: slideEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.slide-exit {
  animation: slideExit 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideEnter {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideExit {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50px);
  }
}

.content {
  flex: 1;
  max-width: 600px;
  text-align: left;
  z-index: 2;
}

.content h1 {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 20px;
  color: #000;
  letter-spacing: -1px;
}

.title-animate {
  animation: titleSlideIn 0.8s ease 0.2s both;
}

@keyframes titleSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content p {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 40px;
  color: #333;
  opacity: 0.9;
}

.subtitle-animate {
  animation: subtitleSlideIn 0.8s ease 0.4s both;
}

@keyframes subtitleSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.shop-button {
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  color: white;
  padding: 16px 40px;
  border-radius: 50px;
  border: none;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: buttonSlideIn 0.8s ease 0.6s both;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@keyframes buttonSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.shop-button:hover {
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.shop-button:active {
  transform: translateY(0);
}

.image {
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.image img {
  max-height: 400px;
  max-width: 100%;
  object-fit: contain;
  transform: translateX(-50px);
}

.image-animate {
  animation: imageSlideIn 0.8s ease 0.4s both;
}

@keyframes imageSlideIn {
  from {
    opacity: 0;
    transform: translateX(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(-50px) scale(1);
  }
}

/* Navigation Arrows */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-button:hover {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%) scale(1.1);
}

.nav-button:active {
  transform: translateY(-50%) scale(0.95);
}

.nav-prev {
  left: 30px;
}

.nav-next {
  right: 30px;
}

.dots {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 20;
}

.dots span {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.dots span:hover {
  opacity: 1;
  transform: scale(1.2);
}

.dots span.active {
  width: 28px;
  border-radius: 20px;
  background: #5f6fff;
  opacity: 1;
  border: 2px solid #5f6fff;
}

/* Slide Counter */
.slide-counter {
  position: absolute;
  bottom: 30px;
  right: 30px;
  font-size: 16px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.6);
  letter-spacing: 2px;
  z-index: 20;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.slide-counter .current {
  color: #5f6fff;
  font-weight: 800;
}

.slide-counter .separator {
  margin: 0 6px;
  opacity: 0.5;
}
</style>
