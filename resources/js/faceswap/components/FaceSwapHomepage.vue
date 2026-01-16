<template>
  <!-- 手機版容器：App.vue 已處理固定寬度和置中 -->
  <div 
    class="relative w-full min-h-screen flex flex-col items-center justify-center cursor-pointer hover:opacity-95 active:opacity-90 transition-opacity duration-300"
    :style="{ backgroundImage: `url(${imageUrls.homepageBg})`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"
    style="touch-action: manipulation;"
    @click="enterFaceSwap"
    @touchend.prevent="enterFaceSwap"
  >
    <!-- 首頁內容圖片（正常顯示，不拉伸） -->
    <img
      :src="imageUrls.homepage"
      alt="點擊開始"
      class="w-full h-auto max-w-full object-contain pointer-events-none"
      style="max-height: 100vh;"
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
