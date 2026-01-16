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
    <div class="relative z-10 flex flex-col items-center" :class="isKioskMode ? 'mt-4' : 'mt-3'">
      <div 
        class="text-center" 
        :class="isKioskMode ? 'mb-8 text-[36px]' : 'mb-4 text-sm'"
        style="color: #FBEFC2;"
      >
        《送您大同3C $100購物金》
      </div>
      <div 
        ref="barcodeContainer"
        class=""
        :class="isKioskMode ? 'px-16 py-4' : 'p-2'"
        :style="barcodeContainerStyle"
      >
        <div class="text-gray-500 text-sm">條碼區域</div>
      </div>
      <div 
        class="text-center" 
        :class="isKioskMode ? 'text-[36px] mt-8' : 'text-sm mt-4'"
        style="color: #FBEFC2;"
      >
        請於結帳時出示此優惠條碼
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import JsBarcode from 'jsbarcode'
import { imageUrls } from '@/config/imageUrls'

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
  },
  couponCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['image-load', 'image-error'])

const imageLoadError = ref(false)
const imageFrameContainer = ref(null)
const barcodeContainer = ref(null)

// 容器樣式
const containerStyle = computed(() => {
  return {
    backgroundImage: `url(${imageUrls.resultBg})`,
    backgroundRepeat: 'no-repeat', // 不重複，避免出現格線
    backgroundPosition: 'center',
    backgroundSize: '100% 100%', // 填滿整個容器，保持比例
    padding: props.isKioskMode ? '1.5rem' : '1rem'
  }
})

// 條碼容器樣式
const barcodeContainerStyle = computed(() => {
  return {
    minHeight: props.isKioskMode ? '100px' : '60px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: props.isKioskMode ? '#ffffff' : 'transparent',
    borderRadius: '0'
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

// 生成條碼
function generateBarcode() {
  if (!props.couponCode || !barcodeContainer.value) {
    if (!props.couponCode) {
      console.log('⚠️ 無法生成條碼：缺少 couponCode')
    }
    return
  }
  
  // 清空容器
  barcodeContainer.value.innerHTML = ''
  
  // 創建 canvas 元素
  const canvas = document.createElement('canvas')
  
  // 根據模式調整尺寸
  const barcodeHeight = props.isKioskMode ? 120 : 60
  const barcodeWidth = props.isKioskMode ? 3 : 2
  const fontSize = props.isKioskMode ? 24 : 14
  
  // 使用 JsBarcode 生成條碼
  try {
    JsBarcode(canvas, props.couponCode, {
      format: "CODE128",
      width: barcodeWidth,
      height: barcodeHeight,
      displayValue: true,
      fontSize: fontSize,
      margin: props.isKioskMode ? 20 : 10,
      background: "#ffffff",
      lineColor: "#000000"
    })
    
    // 添加到容器
    barcodeContainer.value.appendChild(canvas)
    console.log('✅ 條碼生成成功:', props.couponCode)
  } catch (error) {
    console.error('❌ 條碼生成失敗:', error)
    barcodeContainer.value.innerHTML = '<div class="text-gray-500 text-sm">條碼生成失敗</div>'
  }
}

// 監聽 couponCode 變化
watch(() => props.couponCode, (newCode) => {
  if (newCode) {
    nextTick(() => {
      generateBarcode()
    })
  } else {
    // 如果 couponCode 為空，清空條碼容器
    if (barcodeContainer.value) {
      barcodeContainer.value.innerHTML = '<div class="text-gray-500 text-sm">條碼區域</div>'
    }
  }
}, { immediate: true })

onMounted(() => {
  if (props.couponCode) {
    nextTick(() => {
      generateBarcode()
    })
  }
})

// 暴露 ref 供父組件使用
defineExpose({
  imageFrameContainer,
  barcodeContainer
})
</script>
