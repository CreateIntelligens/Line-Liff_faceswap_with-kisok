<template>
  <!-- Kiosk Template Selection - 1080x1920 直立式全螢幕 -->
  <div class="kiosk-template-selection w-[1080px] h-[1920px] bg-black flex flex-col relative overflow-hidden">
    <!-- Header -->
    <div class="flex gap-5 justify-center items-center pt-16 pb-12 w-full">
      <img
        :src="imageUrls.header"
        class="h-36 object-contain"
        alt="2025三立集團內容創新發布會"
      />
    </div>

    <!-- 步驟指示器 -->
    <div class="flex max-w-full text-2xl font-bold text-center text-[#EBD8B2] whitespace-nowrap w-[600px] mx-auto mb-8">
      <img
        :src="imageUrls.step1"
        class="w-16 h-16 object-contain"
        alt="Step 1"
      />
      <img
        :src="imageUrls.horizontal"
        class="object-contain shrink-0 my-auto w-[180px]"
      />
      <img
        :src="imageUrls.step2_inactive"
        class="w-16 h-16 object-contain"
        alt="Step 2"
      />
      <img
        :src="imageUrls.horizontal"
        class="object-contain shrink-0 my-auto w-[180px]"
      />
      <img
        :src="imageUrls.step3_inactive"
        class="w-16 h-16 object-contain"
        alt="Step 3"
      />
    </div>

    <!-- 步驟文字 -->
    <div class="flex gap-10 justify-between max-w-full text-2xl text-center text-[#EBD8B2] w-[700px] mx-auto mb-16">
      <div>Step 1</div>
      <div>Step 2</div>
      <div>Step 3</div>
    </div>

    <!-- 主要內容區域 -->
    <div class="flex-1 px-16 overflow-y-auto">
      <!-- 標題 -->
      <div class="flex gap-4 items-center font-bold mb-12">
        <img
          :src="imageUrls.step1"
          class="w-16 h-16 object-contain"
          alt="Step 1"
        />
        <div class="text-4xl text-[#EBD8B2]">選擇節目模板</div>
      </div>

      <!-- 模板網格 - 2x2 大卡片 -->
      <div class="grid grid-cols-2 gap-8 mb-16">
        <div
          v-for="template in templates"
          :key="template.id"
          @click="selectTemplate(template.id)"
          class="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          :class="selectedTemplate === template.id ? 'ring-4 ring-[#EBD8B2] shadow-2xl' : 'opacity-80 hover:opacity-100'"
        >
          <img
            :src="template.image"
            :alt="template.name"
            class="w-full h-[400px] object-cover"
          />
          <!-- 選中標記 -->
          <div
            v-if="selectedTemplate === template.id"
            class="absolute top-4 right-4 w-12 h-12 bg-[#EBD8B2] rounded-full flex items-center justify-center"
          >
            <svg class="w-8 h-8 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <!-- 模板名稱 -->
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
            <div class="text-3xl font-bold text-white">{{ template.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按鈕區 -->
    <div class="px-16 pb-16 pt-8 bg-gradient-to-t from-black via-black to-transparent">
      <div class="flex gap-6">
        <!-- 返回按鈕 -->
        <button
          @click="goBack"
          class="flex-1 h-20 flex justify-center items-center rounded-xl cursor-pointer border-2 border-[#EBD8B2] hover:bg-[#EBD8B2]/10 transition-all duration-300"
        >
          <span class="text-3xl font-bold text-[#EBD8B2]">返回</span>
        </button>
        
        <!-- 下一步按鈕 -->
        <button
          @click="nextStep"
          :disabled="!selectedTemplate"
          class="flex-1 h-20 flex justify-center items-center rounded-xl cursor-pointer transition-all duration-300"
          :class="selectedTemplate 
            ? 'hover:scale-[1.02] hover:shadow-xl' 
            : 'opacity-50 cursor-not-allowed'"
          style="background: radial-gradient(50% 50% at 50% 50%, #FFF8E9 0%, #DEC799 100%); box-shadow: 0 4px 16px rgba(222, 199, 153, 0.4);"
        >
          <span class="text-3xl font-bold text-[#333]">下一步</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { imageUrls } from '@/config/imageUrls'

const props = defineProps({
  userUsage: {
    type: Number,
    default: 0
  },
  userId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['next-step', 'back'])

const selectedTemplate = ref('')

// 模板資料
const templates = [
  { id: 'play', name: '綜藝玩很大', image: imageUrls.play },
  { id: 'wife', name: '犀利人妻', image: imageUrls.wife },
  { id: 'love', name: '命中註定我愛你', image: imageUrls.love },
  { id: 'super', name: '超級夜總會', image: imageUrls.super }
]

function selectTemplate(templateId) {
  selectedTemplate.value = templateId
}

function nextStep() {
  if (selectedTemplate.value) {
    emit('next-step', { selectedTemplate: selectedTemplate.value })
  }
}

function goBack() {
  emit('back')
}
</script>

<style scoped>
.kiosk-template-selection {
  font-family: 'Noto Sans TC', sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>

