<template>
  <div class="relative mx-auto my-0 bg-black h-screen w-full lg:h-full lg:w-full lg:flex lg:flex-col lg:px-[5.4%]">
    <!-- Header -->
    <div class="flex gap-5 justify-center items-center px-12 pt-12 pb-8 w-full font-bold min-h-20 lg:pt-20 lg:pb-8">
      <img
        :src="imageUrls.header"
        class="h-20 object-contain lg:h-48"
        alt="2025三立集團內容創新發布會"
      />
    </div>

    <!-- 步驟進度條 -->
    <div class="flex max-w-full text-base font-bold text-center text-[#EBD8B2] whitespace-nowrap w-[202px] mx-auto lg:w-[404px]">
      <img :src="imageUrls.step1" class="w-6 h-6 object-contain lg:w-12 lg:h-12" alt="Step 1">
      <img :src="imageUrls.horizontal" class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px] lg:w-[130px]">
      <img :src="imageUrls.step2_inprogress" class="w-6 h-6 object-contain lg:w-12 lg:h-12" alt="Step 2">
      <img :src="imageUrls.horizontal" class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px] lg:w-[130px]">
      <img :src="imageUrls.step3_inactive" class="w-6 h-6 object-contain lg:w-12 lg:h-12" alt="Step 3">
    </div>

    <!-- 步驟文字 -->
    <div class="flex gap-5 justify-between max-w-full text-sm text-center text-[#EBD8B2] w-[218px] mx-auto lg:w-[436px] lg:text-2xl lg:gap-10">
      <div>Step 1</div>
      <div>Step 2</div>
      <div>Step 3</div>
    </div>

    <div class="mt-14 w-full max-w-[338px] mx-auto lg:max-w-[90%] lg:mt-14">
      <div class="flex flex-col w-full">
        <!-- Step indicator -->
        <div class="flex gap-2.5 items-center font-bold whitespace-nowrap lg:justify-start">
          <div class="self-stretch my-auto text-lg text-[#333333] w-6 h-6 lg:w-12 lg:h-12">
            <img
              :src="imageUrls.step2_inprogress"
              class="w-6 h-6 object-contain lg:w-12 lg:h-12"
              alt="Step 2"
            />
          </div>
          <div class="self-stretch my-auto text-base text-[#EBD8B2] lg:text-3xl">
            {{
              cameraState === 'countdown' ? '拍照倒數中，請勿移動' :
              cameraState === 'captured' ? '請確認照片' :
              cameraState === 'preview' ? '需使用單人清晰正面照' :
              '需使用單人清晰正面照'
            }}
          </div>
        </div>

        <!-- Camera Area -->
        <div class="mt-9 w-full">
          <div class="bg-black rounded-lg overflow-hidden relative h-[360px] lg:h-[900px] lg:rounded-xl">
        <!-- Camera Preview State (showing loading while camera initializes) -->
        <div v-if="cameraState === 'idle'" class="flex flex-col items-center justify-center h-full">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#666] mb-4"></div>
          <div class="text-[#666] text-sm">正在開啟相機...</div>
        </div>

        <!-- Camera Stream -->
        <video v-if="cameraState === 'preview' || cameraState === 'countdown'"
               ref="videoElement"
               class="w-full h-full object-cover border-2 border-[#EBD8B2] rounded-lg"
               autoplay
               playsinline>
        </video>

        <!-- Countdown Overlay -->
        <div v-if="cameraState === 'countdown'"
             class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div class="text-9xl font-bold text-white animate-pulse lg:text-[200px]">
            {{ countdownNumber }}
          </div>
        </div>

        <!-- Captured Photo -->
        <img v-if="cameraState === 'captured'"
             :src="capturedImage"
             class="w-full h-full object-cover border-2 border-[#EBD8B2] rounded-lg"
             alt="Captured photo">

        <!-- Loading State -->
        <div v-if="cameraState === 'loading'" class="flex flex-col items-center justify-center h-full">
          <video
            src="https://storage.googleapis.com/fanpokka/prod/2025%20Road%20Show%20Faceswap%20V1%2020251002.mov"
            autoplay
            loop
            muted
            playsinline
            class="w-56 h-56 mb-6 object-contain lg:w-[600px] lg:h-[600px]"
          ></video>
          <div class="text-[#EBD8B2] text-lg font-bold mb-2 lg:text-3xl">照片生成中，請稍後</div>
        </div>
          </div>
        </div>

        <!-- Countdown Instructions - Show only during countdown -->
        <div v-if="cameraState === 'countdown'" class="mt-8 mb-8">
          <div class="text-center text-white space-y-2 lg:space-y-4">
            <div class="text-lg lg:text-3xl">請在五秒內確認你的位置</div>
            <div class="text-lg lg:text-3xl">並保持畫面內僅有一人</div>
            <div class="text-lg lg:text-3xl">五官清晰無遮擋</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="cameraState !== 'countdown'" class="self-end mt-8 w-full text-base font-bold text-white whitespace-nowrap rounded-md lg:text-3xl lg:mt-16">
          <div class="flex gap-3 lg:gap-6">
            <!-- Back Button (重選IP) - Only show when not captured -->
            <button v-if="cameraState !== 'captured'"
                    class="flex-1 h-11 flex justify-center items-center rounded-md cursor-pointer hover:shadow-lg transition-all duration-300 lg:h-24 lg:text-3xl lg:rounded-xl"
                    style="background: radial-gradient(50% 50% at 50% 50%, #FFF8E9 0%, #DEC799 100%); box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);"
                    @click="goBack">
              <div class="font-noto-sans-tc text-base font-bold text-[#333] lg:text-3xl">
                重選IP
              </div>
            </button>

            <!-- Take Photo Button (開始拍照) when preview is ready -->
            <button v-if="cameraState === 'preview'"
                    class="flex-1 h-11 flex justify-center items-center rounded-md cursor-pointer transition-all duration-300 bg-gradient-to-r from-[#EE95FF] via-[#F192FF] via-[#B9B9FB] to-[#AFCBF7] hover:shadow-lg lg:h-24 lg:text-3xl lg:rounded-xl"
                    @click="startCountdown">
              <div class="font-noto-sans-tc text-base font-bold text-[#333] lg:text-3xl">
                開始拍照
              </div>
            </button>

            <!-- Retake Photo Button when captured -->
            <button v-if="cameraState === 'captured'"
                    class="flex-1 h-11 flex justify-center items-center rounded-md cursor-pointer hover:shadow-lg transition-all duration-300 lg:h-24 lg:text-3xl lg:rounded-xl"
                    style="background: radial-gradient(50% 50% at 50% 50%, #FFF8E9 0%, #DEC799 100%); box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);"
                    @click="retakePhoto">
              <div class="font-noto-sans-tc text-base font-bold text-[#333] lg:text-3xl">
                再拍一次
              </div>
            </button>

            <!-- Next Step Button -->
            <button v-if="cameraState === 'captured'"
                    class="flex-1 h-11 flex justify-center items-center rounded-md cursor-pointer transition-all duration-300 bg-gradient-to-r from-[#EE95FF] via-[#F192FF] via-[#B9B9FB] to-[#AFCBF7] hover:shadow-lg lg:h-24 lg:text-3xl lg:rounded-xl"
                    @click="nextStep">
              <div class="font-noto-sans-tc text-base font-bold text-[#333] lg:text-3xl">
                下一步
              </div>
            </button>
          </div>
        </div>

        <!-- Instructions Below Buttons - Only show when not captured and not countdown -->
        <div v-if="cameraState !== 'captured' && cameraState !== 'countdown'" class="mt-9 text-base font-bold text-[#EBD8B2] lg:text-3xl">
          <div class="bg-black rounded-lg p-4 lg:p-8">
            <div class="text-white text-sm space-y-2 lg:text-2xl lg:space-y-4 text-left">
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

  const canvas = document.createElement('canvas')
  canvas.width = videoElement.value.videoWidth
  canvas.height = videoElement.value.videoHeight

  const ctx = canvas.getContext('2d')
  ctx.drawImage(videoElement.value, 0, 0)

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