<template>
  <!-- Kiosk Homepage - 1080x1920 直立式全螢幕 -->
  <div class="relative w-full h-full min-h-screen bg-black flex flex-col justify-between">
    <!-- Header -->
    <div class="flex gap-5 justify-center items-center px-16 pt-12 pb-8 w-full font-bold">
      <img
        :src="imageUrls.header"
        class="h-48 object-contain"
        alt="將你的照片打造成熱門IP"
        @load="handleImageLoad"
        @error="handleImageError"
      />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center justify-center px-12 relative">
      <!-- Hero Image (可點擊進入) -->
      <img
        :src="imageUrls.profile"
        alt="青山王祭 - 點擊開始"
        class="relative w-[850px] h-[1133px] object-cover z-10 cursor-pointer hover:opacity-95 active:opacity-90 transition-opacity duration-300"
        style="object-position: center; touch-action: manipulation;"
        @click="enterFaceSwap"
        @touchend.prevent="enterFaceSwap"
      />

      <!-- Decorative Bars -->
      <div class="absolute left-2 top-[60%] transform -translate-y-1/2 w-[500px] h-5 bg-gradient-to-r from-[#F773AF] via-[#AC86EB] to-[#FAAC95] -rotate-90 origin-left pointer-events-none z-20"></div>
      <div class="absolute right-2 top-1/2 transform -translate-y-1/2 w-[500px] h-5 bg-gradient-to-r from-[#F773AF] via-[#AC86EB] to-[#FAAC95] rotate-90 origin-right pointer-events-none z-20"></div>
    </div>

    <!-- Footer -->
    <div class="bg-black py-8">
      <p class="text-2xl text-[#f5f5f5] whitespace-nowrap text-center">
        此服務由 創造智能 提供技術支持
      </p>
    </div>
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
