import { ref, onMounted, onUnmounted } from 'vue'

interface UseScrollDirectionOptions {
  threshold?: number
  onScroll?: () => void
  shouldHide?: () => boolean
}

export function useScrollDirection(options: UseScrollDirectionOptions = {}) {
  const { threshold = 50, onScroll, shouldHide } = options

  const isVisible = ref(true)
  let lastScrollTop = 0

  const handleScroll = () => {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Avoid negative values when overscrolling
    if (currentScrollTop < 0) {
      return
    }

    // Call onScroll callback if provided
    if (onScroll) {
      onScroll()
    }

    // Show when at the top of the page
    if (currentScrollTop < threshold) {
      isVisible.value = true
      lastScrollTop = currentScrollTop
      return
    }

    // Check if hiding is allowed
    const canHide = shouldHide ? shouldHide() : true

    // Scrolling down - hide (only if allowed)
    if (currentScrollTop > lastScrollTop && currentScrollTop > threshold && canHide) {
      isVisible.value = false
    }
    // Scrolling up - show
    else if (currentScrollTop < lastScrollTop) {
      isVisible.value = true
    }

    lastScrollTop = currentScrollTop
  }

  // Setup scroll listener
  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    isVisible,
  }
}
