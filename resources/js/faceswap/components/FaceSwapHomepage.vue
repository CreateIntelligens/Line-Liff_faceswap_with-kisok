<template>
  <!-- 手機版容器：App.vue 已處理固定寬度和置中 -->
  <div class="relative w-full min-h-screen flex flex-col justify-between" style="background-color: #333333;">
    <!-- Header -->
    <div class="flex gap-5 justify-center items-center px-6 pt-6 pb-4 w-full font-bold">
      <img
        :src="imageUrls.header"
        class="h-11 object-contain"
        alt="大同寶寶賀新年"
      />
    </div>

    <!-- Main Content -->
    <div class="flex flex-col items-center px-4 relative">
      <!-- Hero Image (可點擊進入) -->
      <img
        :src="imageUrls.profile"
        alt="點擊開始"
        class="relative w-[340px] h-[454px] object-contain z-10 cursor-pointer hover:opacity-95 active:opacity-90 transition-opacity duration-300"
        style="object-position: center; touch-action: manipulation;"
        @click="enterFaceSwap"
        @touchend.prevent="enterFaceSwap"
      />
    </div>

    <!-- Footer -->
    <div class="py-4" style="background-color: #333333;">
      <p class="text-xs text-gray-300 whitespace-nowrap text-center">
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
