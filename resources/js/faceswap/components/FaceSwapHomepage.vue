<template>
  <div
    class="relative mx-auto my-0 bg-black h-screen w-full lg:h-full lg:w-full flex flex-col"
  >
    <!-- Header -->
    <div class="flex gap-5 justify-center items-center px-12 pt-12 pb-8 w-full font-bold min-h-20 lg:pt-20 lg:pb-8">
      <img
        :src="imageUrls.header"
        class="h-20 object-contain lg:h-48"
        alt="將你的照片打造成熱門IP"
      />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center px-6 pt-1 lg:px-12 lg:pt-2">
      <!-- Hero Video with Button -->
      <div class="mb-8 relative flex flex-col items-center justify-center lg:mb-16">
        <!-- Video -->
        <video
          src="https://storage.googleapis.com/fanpokka/prod/2025%20Road%20Show%20Faceswap%20V1%2020251002.mov"
          autoplay
          loop
          muted
          playsinline
          class="relative w-[297px] h-[397px] object-cover max-sm:w-[250px] max-sm:h-[335px] lg:w-[800px] lg:h-[1000px] z-10"
          style="object-position: center;"
        >
          <!-- Fallback for browsers that don't support video -->
          <img
            :src="imageUrls.Group13948"
            alt="Hero Image"
            class="w-[297px] h-[397px] object-contain max-sm:w-[250px] max-sm:h-[335px]"
          />
        </video>

        <!-- CTA Button - Connected to video with same width -->
        <button
          class="w-[297px] max-sm:w-[250px] lg:w-[800px] flex justify-center items-center py-3 h-11 rounded-md cursor-pointer hover:shadow-lg transition-all duration-300 text-base font-bold text-[#333333] lg:h-24 lg:text-3xl lg:rounded-xl -mt-1 z-20"
          style="background: radial-gradient(50% 50% at 50% 50%, #FFF8E9 0%, #DEC799 100%); box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);"
          @click="enterFaceSwap"
        >
          進入IP換臉生成工具
        </button>
      </div>

      <!-- Decorative Bars -->
      <div class="relative w-full">
        <div class="absolute left-[-6%] top-1/2 transform -translate-y-[40px] w-52 h-2.5 bg-gradient-to-r from-[#F773AF] via-[#AC86EB] to-[#FAAC95] -rotate-90 origin-left lg:w-96 lg:h-6 lg:-translate-y-[80px]"></div>
        <div class="absolute right-[-6%] top-1/2 transform -translate-y-[152px] w-52 h-2.5 bg-gradient-to-r from-[#F773AF] via-[#AC86EB] to-[#FAAC95] rotate-90 origin-right lg:w-96 lg:h-6 lg:-translate-y-[280px]"></div>
      </div>

      <!-- Text Content -->
      <div class="text-center max-w-md lg:max-w-4xl">
        <h1 class="text-2xl font-bold text-[#EBD8B2] mb-4 max-sm:text-xl lg:text-6xl lg:mb-12 lg:whitespace-nowrap">
          將你的照片打造成熱門IP！
        </h1>
        <p class="text-base text-[#EBD8B2] max-sm:text-sm lg:text-3xl leading-relaxed lg:leading-loose">
          三步驟快速換臉！選擇一熱門IP<br />
          並拍一張正面清晰的照片<br />
          即可生成換臉效果
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-auto bg-black">
      <p class="text-xs text-[#f5f5f5] whitespace-nowrap lg:text-xl text-center pt-25 pb-20 lg:pt-32 lg:pb-32">
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
