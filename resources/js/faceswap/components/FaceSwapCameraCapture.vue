<template>
  <div class="relative min-h-screen w-full flex flex-col" style="background-color: #333333;">
    <!-- Header -->
    <div :class="isKioskMode ? 'pt-16 pb-12' : 'py-4'" class="flex gap-5 justify-center items-center px-12 w-full font-bold">
      <h1 :class="isKioskMode ? 'text-5xl' : 'text-2xl'" class="font-bold text-white">標題</h1>
    </div>

    <div :class="isKioskMode ? 'mt-16 max-w-[878px]' : 'mt-14 max-w-[338px]'" class="w-full mx-auto">
      <div class="flex flex-col w-full">
        <!-- Step indicator -->
        <div :class="isKioskMode ? 'justify-center' : ''" class="flex gap-2.5 items-center font-bold whitespace-nowrap mb-6">
          <div :class="isKioskMode ? 'text-3xl' : 'text-base'" class="text-white">
            <span class="text-4xl font-bold text-black">3</span>
          </div>
          
          <div :class="isKioskMode ? 'text-5xl' : 'text-base'" class="self-stretch my-auto text-white">
            {{
              cameraState === 'countdown' ? '拍照倒數中，請勿移動' :
              cameraState === 'captured' ? '請確認照片' :
              cameraState === 'preview' ? '需使用單人清晰正面照' :
              '需使用單人清晰正面照'
            }}
          </div>
        </div>

        <!-- Camera Area -->
        <div :class="isKioskMode ? 'mt-12' : 'mt-9'" class="w-full">
          <div :class="isKioskMode ? 'h-[936px]' : 'h-[360px]'" class="bg-black rounded-lg overflow-hidden relative">
        <!-- Camera Preview State (showing loading while camera initializes) -->
        <div v-if="cameraState === 'idle'" class="flex flex-col items-center justify-center h-full">
          <!-- Kiosk: 顯示 load.png -->
          <img 
            v-if="isKioskMode"
            :src="imageUrls.load"
            alt="載入中"
            class="w-[600px] h-[800px] object-contain mb-8"
          />
          <div :class="isKioskMode ? 'text-2xl' : 'text-sm'" class="text-gray-300">正在開啟相機...</div>
        </div>

        <!-- Camera Stream -->
        <video v-if="cameraState === 'preview' || cameraState === 'countdown'"
               ref="videoElement"
               :class="isKioskMode ? 'border-4' : 'border-2'"
               class="w-full h-full object-cover border-gray-400 rounded-lg -scale-x-100"
               autoplay
               playsinline>
        </video>

        <!-- Countdown Overlay -->
        <div v-if="cameraState === 'countdown'"
             class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div :class="isKioskMode ? 'text-[20rem]' : 'text-9xl'" class="font-bold text-white animate-pulse">
            {{ countdownNumber }}
          </div>
        </div>

        <!-- Captured Photo -->
        <img v-if="cameraState === 'captured'"
             :src="capturedImage"
             :class="isKioskMode ? 'border-4' : 'border-2'"
             class="w-full h-full object-cover border-gray-400 rounded-lg"
             alt="Captured photo">

        <!-- Loading State -->
        <div v-if="cameraState === 'loading'" class="flex flex-col items-center justify-center h-full">
          <!-- 顯示 load.png 圖片 -->
          <img
            :src="imageUrls.load"
            alt="處理中"
            :class="isKioskMode ? 'w-[700px] h-[933px] mb-16' : 'w-[300px] h-[400px] mb-6'"
            class="object-contain"
          />
          <div :class="isKioskMode ? 'text-4xl mb-6' : 'text-lg mb-2'" class="text-gray-600 font-bold">照片生成中，請稍後</div>
        </div>
          </div>
        </div>

        <!-- Countdown Instructions - Show only during countdown -->
        <div v-if="cameraState === 'countdown'" :class="isKioskMode ? 'mt-12 mb-12' : 'mt-8 mb-8'">
          <div class="text-center text-gray-800 space-y-2">
            <div :class="isKioskMode ? 'text-3xl' : 'text-lg'">請在五秒內確認你的位置</div>
            <div :class="isKioskMode ? 'text-3xl' : 'text-lg'">並保持畫面內僅有一人</div>
            <div :class="isKioskMode ? 'text-3xl' : 'text-lg'">五官清晰無遮擋</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="cameraState !== 'countdown'" :class="isKioskMode ? 'mt-12' : 'mt-8'" class="self-end w-full text-base font-bold whitespace-nowrap rounded-md">
          <div :class="isKioskMode ? 'gap-8' : 'gap-3'" class="flex">
            <!-- Back Button (重選IP) - Only show when not captured -->
            <button v-if="cameraState !== 'captured'"
                    :class="isKioskMode ? 'h-[72px]' : 'h-11'"
                    class="flex-1 flex justify-center items-center rounded-md cursor-pointer hover:bg-gray-200 transition-all duration-300 bg-gray-100 border-2 border-gray-300"
                    style="touch-action: manipulation;"
                    @click="goBack"
                    @touchend.prevent="goBack">
              <div :class="isKioskMode ? 'text-3xl' : 'text-base'" class="font-noto-sans-tc font-bold text-gray-800">
                重選IP
              </div>
            </button>

            <!-- Take Photo Button (開始拍照) when preview is ready -->
            <button v-if="cameraState === 'preview'"
                    :class="isKioskMode ? 'h-[72px]' : 'h-11'"
                    class="flex-1 flex justify-center items-center rounded-md cursor-pointer transition-all duration-300"
                    style="background: linear-gradient(to bottom, #CCCCCC 0%, #999999 100%); touch-action: manipulation;"
                    @click="startCountdown"
                    @touchend.prevent="startCountdown">
              <div :class="isKioskMode ? 'text-3xl' : 'text-base'" class="font-noto-sans-tc font-bold text-[#0E0E0E]">
                開始拍照
              </div>
            </button>

            <!-- Retake Photo Button when captured -->
            <button v-if="cameraState === 'captured'"
                    :class="isKioskMode ? 'h-[72px]' : 'h-11'"
                    class="flex-1 flex justify-center items-center rounded-md cursor-pointer transition-all duration-300"
                    style="background: linear-gradient(to bottom, #CCCCCC 0%, #999999 100%); touch-action: manipulation;"
                    @click="retakePhoto"
                    @touchend.prevent="retakePhoto">
              <div :class="isKioskMode ? 'text-3xl' : 'text-base'" class="font-noto-sans-tc font-bold text-[#0E0E0E]">
                再拍一次
              </div>
            </button>

            <!-- Next Step Button -->
            <button v-if="cameraState === 'captured'"
                    :class="isKioskMode ? 'h-[72px]' : 'h-11'"
                    class="flex-1 flex justify-center items-center rounded-md cursor-pointer transition-all duration-300"
                    style="background: linear-gradient(to bottom, #CCCCCC 0%, #999999 100%); touch-action: manipulation;"
                    @click="nextStep"
                    @touchend.prevent="nextStep">
              <div :class="isKioskMode ? 'text-3xl' : 'text-base'" class="font-noto-sans-tc font-bold text-[#0E0E0E]">
                下一步
              </div>
            </button>
          </div>
        </div>

        <!-- Instructions Below Buttons - Only show when not captured and not countdown -->
        <div v-if="cameraState !== 'captured' && cameraState !== 'countdown'" :class="isKioskMode ? 'mt-12' : 'mt-9'" class="text-base font-bold">
          <div :class="isKioskMode ? 'p-10' : 'p-4'" class="bg-gray-100 border-2 border-gray-300 rounded-lg">
            <div :class="isKioskMode ? 'text-2xl space-y-4' : 'text-sm space-y-2'" class="text-gray-800 text-left">
              <div>1. 點擊後會有5秒準備期，請在5秒內擺好姿勢</div>
              <div>2. 請保持畫面人物面向，避免多人以上亂識</div>
              <div>3. 請避免頭髮或帽子遮擋五官，避免過髮等遮擋</div>
              <div>4. 請勿晃動，以免因照片模糊而影響生成品質</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { imageUrls } from '../../config/imageUrls.js'

const props = defineProps({
  selectedTemplate: {
    type: String,
    default: ''
  },
  selectedCharacter: {
    type: String,
    default: ''
  },
  isKioskMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['captured', 'generate', 'back'])

// Camera states: idle, preview, countdown, captured, loading
const cameraState = ref('idle')  // Will be set to preview after camera starts
const videoElement = ref(null)
const capturedImage = ref('')
const countdownNumber = ref(5)
const stream = ref(null)


// Start camera and preview
async function startCamera(autoStart = false) {
  try {
    // Get user media
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      }
    })

    cameraState.value = 'preview'

    // Wait for next tick to ensure video element is rendered
    await new Promise(resolve => setTimeout(resolve, 100))

    if (videoElement.value) {
      videoElement.value.srcObject = stream.value
      // Only start countdown if not auto-starting (user clicked button)
      if (!autoStart) {
        setTimeout(startCountdown, 1000)
      }
    }
  } catch (error) {
    console.error('Error accessing camera:', error)
    alert('無法存取相機，請確保已授予相機權限')
  }
}

// Start countdown
function startCountdown() {
  cameraState.value = 'countdown'
  countdownNumber.value = 5

  const interval = setInterval(() => {
    countdownNumber.value--
    if (countdownNumber.value <= 0) {
      clearInterval(interval)
      capturePhoto()
    }
  }, 1000)
}

// Capture photo
function capturePhoto() {
  if (!videoElement.value) return

  const video = videoElement.value

  // 1. 獲取原始視訊尺寸 (例如 1280x720)
  const videoW = video.videoWidth
  const videoH = video.videoHeight
  const videoRatio = videoW / videoH

  // 2. 獲取螢幕上實際顯示的方框尺寸 (例如 300x400)
  const rect = video.getBoundingClientRect()
  const displayW = rect.width
  const displayH = rect.height
  const displayRatio = displayW / displayH

  // 3. 計算裁切參數 (source x, source y, source width, source height)
  let sx, sy, sWidth, sHeight

  if (videoRatio > displayRatio) {
    // 情況 A：視訊比顯示框更「寬」 (例如視訊 16:9，顯示框 1:1)
    // 邏輯：保留高度，裁掉左右兩邊
    sHeight = videoH
    sWidth = sHeight * displayRatio // 根據顯示比例算出應該保留的寬度
    sy = 0
    sx = (videoW - sWidth) / 2 // 從中間開始裁
  } else {
    // 情況 B：視訊比顯示框更「瘦」 (例如視訊 4:3，顯示框 9:16)
    // 邏輯：保留寬度，裁掉上下兩邊
    sWidth = videoW
    sHeight = sWidth / displayRatio // 根據顯示比例算出應該保留的高度
    sx = 0
    sy = (videoH - sHeight) / 2 // 從中間開始裁
  }

  // 4. 創建 Canvas
  const canvas = document.createElement('canvas')

  // 【關鍵修正】: 設定 Canvas 大小為「裁切後的高解析度尺寸」，而不是螢幕顯示尺寸
  // 這樣可以確保圖片清晰度
  canvas.width = sWidth
  canvas.height = sHeight

  const ctx = canvas.getContext('2d')

  // 5. 執行鏡像翻轉和裁切繪製
  // 先進行鏡像翻轉變換
  ctx.translate(canvas.width, 0) // 將原點移到右邊
  ctx.scale(-1, 1) // 水平翻轉
  
  // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight)
  
  // 重置變換矩陣
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  // 6. 輸出圖片
  capturedImage.value = canvas.toDataURL('image/jpeg', 0.95)
  cameraState.value = 'captured'

  // Stop camera stream
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
}

// Retake photo
function retakePhoto() {
  capturedImage.value = ''
  startCamera()
}

// Next step - show loading then emit
async function nextStep() {
  cameraState.value = 'loading'

  // Convert base64 to blob
  const response = await fetch(capturedImage.value)
  const blob = await response.blob()
  const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })

  // Emit generate event after a short delay to show loading
  setTimeout(() => {
    emit('generate', file)
  }, 2000)
}

// Go back to previous step
function goBack() {
  // Clean up camera stream if active
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  emit('back')
}

// Auto-start camera on mount
onMounted(() => {
  // Automatically start the camera when component mounts
  startCamera(true)
})

// Cleanup on unmount
onUnmounted(() => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped>
@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.animate-spin-reverse {
  animation: spin-reverse 2s linear infinite;
}
</style>