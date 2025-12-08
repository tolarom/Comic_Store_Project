<template>
  <footer class=" bg-black text-white py-16 px-6 lg:px-20">
    <div class="w-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- ABOUT THE SHOP -->
      <div>
        <h2 class="font-semibold text-2xl tracking-widest mb-4">ABOUT THE SHOP</h2>
        <p class="text-sm leading-relaxed mb-4">
          Comic is a retail experience created for fans of all things Japanese lifestyle and culture. We carry exclusive officially licensed apparel, accessories, and more.
        </p>
        <p class="text-sm leading-relaxed mb-4">
          The store is run by our namesake herself, Comic Store, and her fuzzy little companion, Nuki. They're here to make sure you feel welcome and find everything you're looking for.
        </p>
        <br>
        <br><br><br>
        <p class="text-sm text-gray-400 mt-6">© 2025 - COMIC</p>
      </div>

      <!-- CONTACT US -->
      <div>
        <h2 class="font-semibold text-2xl tracking-widest mb-4">CONTACT US</h2>

        <p class="text-xl mb-2">FOLLOW US</p>
        <div class="flex space-x-4 text-lg mb-6 ">
          <img src="/images/facebook.png" alt="" class="w-7 ">
          <img src="/images/image.png" alt="" class="w-7 ">
          <img src="/images/instagram.png" alt="" class="w-7">
          <img src="/images/telegram.png" alt="" class="w-7">
        </div>

        <div class="flex items-center space-x-3 mb-4">
          <img src="/images/phone-call.png" alt="" class="w-7">
          <span class="text-sm">+855 - XXXXXXXXX</span>
        </div>

        <div class="flex items-center space-x-3 mb-4">
          <img src="/images/communication.png" alt="" class="w-7">
          <span class="text-sm">support@gmail.com</span>
        </div>

        <div class="flex items-center space-x-3">
          <img src="/images/google-maps.png" alt="" class="w-7">
          <span class="text-sm leading-relaxed">Russian Conf Norodom Boulevard,Phnom Penh 120404</span>
        </div>
      </div>

      <!-- MAP SECTION -->
      <div class="w-full h-64 lg:h-96 rounded overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6885.681067950809!2d104.88643625951356!3d11.566524049813875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109517388680e15%3A0x63057e6682968f5!2sInstitute%20of%20Technology%20of%20Cambodia!5e0!3m2!1sen!2skh!4v1765181567232!5m2!1sen!2skh"
          width="100%"
          height="100%"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
export default {
  name: "HomePage",
  methods: {
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    },
};
</script>

<style scoped>
/* Optional: tweak button on small screens */
@media (max-width: 640px) {
  .fixed {
    bottom: 12px;
    right: 12px;
  }
}
</style>
