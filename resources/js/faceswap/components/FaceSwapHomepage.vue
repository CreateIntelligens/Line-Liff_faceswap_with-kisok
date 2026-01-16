<template>
  <!-- 手機版容器：App.vue 已處理固定寬度和置中 -->
  <div 
    class="relative w-full min-h-screen flex flex-col items-center justify-center cursor-pointer hover:opacity-95 active:opacity-90 transition-opacity duration-300"
    :style="{ backgroundImage: `url(${imageUrls.homepage})`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"
    style="touch-action: manipulation;"
    @click="enterFaceSwap"
    @touchend.prevent="enterFaceSwap"
  >
  </div>
</template>

<script setup>
import { imageUrls } from '@/config/imageUrls'

const emit = defineEmits(['enter-face-swap'])

function enterFaceSwap() {
  emit('enter-face-swap')
}
</script>
