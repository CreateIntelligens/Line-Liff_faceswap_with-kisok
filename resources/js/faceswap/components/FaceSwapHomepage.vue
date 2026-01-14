<template>
  <!-- 手機版容器：App.vue 已處理固定寬度和置中 -->
  <div class="relative w-full min-h-screen flex flex-col items-center justify-center">
    <!-- Homepage Image (可點擊進入) -->
    <img
      :src="imageUrls.homepage"
      alt="點擊開始"
      class="w-full h-full object-contain cursor-pointer hover:opacity-95 active:opacity-90 transition-opacity duration-300"
      style="touch-action: manipulation;"
      @click="enterFaceSwap"
      @touchend.prevent="enterFaceSwap"
    />
  </div>
</template>

<script setup>
import { imageUrls } from '@/config/imageUrls'

const emit = defineEmits(['enter-face-swap'])

function enterFaceSwap() {
  emit('enter-face-swap')
}
</script>
