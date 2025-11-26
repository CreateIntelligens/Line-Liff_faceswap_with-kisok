<template>
  <!-- 手機版容器：App.vue 已處理固定寬度和置中 -->
  <div class="relative w-full min-h-screen bg-black flex flex-col justify-between">
    <!-- Header -->
    <div class="flex gap-5 justify-center items-center px-6 pt-6 pb-4 w-full font-bold">
      <img
        :src="imageUrls.header"
        class="h-16 object-contain"
        alt="將你的照片打造成熱門IP"
      />
    </div>

    <!-- Main Content -->
    <div class="flex flex-col items-center px-4 relative">
      <!-- Hero Image (可點擊進入) -->
      <img
        :src="imageUrls.profile"
        alt="青山王祭 - 點擊開始"
        class="relative w-[340px] h-[454px] object-cover z-10 cursor-pointer hover:opacity-95 active:opacity-90 transition-opacity duration-300"
        style="object-position: center; touch-action: manipulation;"
        @click="enterFaceSwap"
        @touchend.prevent="enterFaceSwap"
      />

      <!-- Decorative Bars -->
      <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-[180px] h-2.5 bg-gradient-to-r from-[#F773AF] via-[#AC86EB] to-[#FAAC95] -rotate-90 origin-left pointer-events-none z-0"></div>
      <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-[180px] h-2.5 bg-gradient-to-r from-[#F773AF] via-[#AC86EB] to-[#FAAC95] rotate-90 origin-right pointer-events-none z-0"></div>
    </div>

    <!-- Footer -->
    <div class="bg-black py-4">
      <p class="text-xs text-[#f5f5f5] whitespace-nowrap text-center">
        此服務由 創造智能 提供技術支持
      </p>
    </div>
  </div>
</template>

<script setup>
import { imageUrls } from '@/config/imageUrls'

const emit = defineEmits(['enter-face-swap'])

function enterFaceSwap() {
  emit('enter-face-swap')
}
</script>
