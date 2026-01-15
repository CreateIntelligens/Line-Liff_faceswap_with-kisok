<template>
  <div 
    ref="imageFrameContainer"
    class="w-full image-frame-container"
    :class="containerClass"
    :style="containerStyle"
  >
    <!-- 生成圖片 -->
    <div>
      <img
        v-if="imageUrl"
        :src="imageUrl"
        class="w-full object-contain rounded-lg"
        alt="生成結果"
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <div v-else class="w-full h-60 bg-gray-700 rounded-lg flex items-center justify-center">
        <div class="text-white text-center">
          <div class="text-lg font-bold mb-2">生成中...</div>
          <div class="text-sm">請稍候，正在處理您的圖片</div>
        </div>
      </div>
      <div v-if="imageLoadError" class="text-center text-red-400 text-sm mt-2">
        ⚠️ 圖片載入失敗，請檢查網路連線
      </div>
    </div>

    <!-- 條碼區域 -->
    <div class="relative z-10 mt-4 flex flex-col items-center">
      <div class="text-center mb-8 text-[36px]" style="color: #FBEFC2;">
        《送您大同3C $100購物金》
      </div>
      <div 
        ref="barcodeContainer"
        class="bg-white p-4 rounded"
        :style="barcodeContainerStyle"
      >
        <div class="text-gray-500 text-sm">條碼區域</div>
      </div>
      <div class="text-white text-[36px] mt-8 text-center" style="color: #FBEFC2;">
        請於結帳時出示此優惠條碼
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  imageUrl: {
    type: String,
    default: ''
  },
  containerClass: {
    type: String,
    default: 'mb-6'
  },
  isKioskMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['image-load', 'image-error'])

const imageLoadError = ref(false)
const imageFrameContainer = ref(null)
const barcodeContainer = ref(null)

// 容器樣式
const containerStyle = computed(() => {
  return {
    backgroundImage: 'url(/resources/images/result_bg.png)',
    backgroundRepeat: 'repeat',
    backgroundPosition: 'center',
    padding: props.isKioskMode ? '1.5rem' : '1rem'
  }
})

// 條碼容器樣式
const barcodeContainerStyle = computed(() => {
  return {
    minHeight: props.isKioskMode ? '100px' : '80px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

// 處理圖片載入成功
function handleImageLoad(event) {
  imageLoadError.value = false
  emit('image-load', event)
}

// 處理圖片載入錯誤
function handleImageError(event) {
  imageLoadError.value = true
  emit('image-error', event)
}

// 暴露 ref 供父組件使用
defineExpose({
  imageFrameContainer,
  barcodeContainer
})
</script>
