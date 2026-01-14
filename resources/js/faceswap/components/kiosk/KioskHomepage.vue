<template>
  <!-- Kiosk Homepage - 1080x1920 直立式全螢幕 -->
  <div class="relative w-full h-full min-h-screen flex flex-col items-center justify-center">
    <!-- Homepage Image (可點擊進入) -->
    <img
      :src="imageUrls.kioskHomepage"
      alt="點擊開始"
      class="w-full h-full object-contain cursor-pointer hover:opacity-95 active:opacity-90 transition-opacity duration-300"
      style="touch-action: manipulation;"
      @click="enterFaceSwap"
      @touchend.prevent="enterFaceSwap"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { imageUrls } from '@/config/imageUrls'

const emit = defineEmits(['enter-face-swap'])

onMounted(() => {
  console.log('🖼️ Kiosk Homepage - 圖片 URLs:', {
    header: imageUrls.header,
    profile: imageUrls.profile
  })
  console.log('📋 完整 imageUrls 對象:', imageUrls)
})

function handleImageError(e) {
  console.error('❌ Logo 載入失敗:', e.target.src)
  console.error('❌ 錯誤事件:', e)
}

function handleImageLoad(e) {
  console.log('✅ Logo 載入成功:', e.target.src)
  console.log('📐 Logo 尺寸:', {
    naturalWidth: e.target.naturalWidth,
    naturalHeight: e.target.naturalHeight,
    displayWidth: e.target.width,
    displayHeight: e.target.height
  })
}

function enterFaceSwap() {
  emit('enter-face-swap')
}
</script>

<style scoped>
/* 確保 Kiosk 模式下的字體和樣式 */
div {
  font-family: 'Noto Sans TC', 'Inter', sans-serif;
}
</style>
