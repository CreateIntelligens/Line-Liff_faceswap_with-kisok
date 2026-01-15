<template>
  <div v-if="isVisible" class="fixed inset-0 z-[9999] flex items-start justify-center" style="pointer-events: auto; padding-top: 70%;">
    <!-- Backdrop with gradient effect -->
    <div class="absolute inset-0 bg-black bg-opacity-30" @click="close" style="pointer-events: auto; cursor: pointer;"></div>
    <div class="absolute inset-0" style="background: radial-gradient(circle at center, rgba(255, 248, 220, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%); pointer-events: auto; cursor: pointer;" @click="close"></div>

    <!-- Modal Content - 淺米色背景卡片（正方形，帶透明度） -->
    <div class="relative z-[10000] bg-white/80 rounded-3xl p-10 mx-6 shadow-4xl backdrop-blur-sm" style="width: 750px; height: 750px; pointer-events: auto; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <!-- Close button -->
      <button @click="close"
              class="absolute top-4 right-4 text-[#333] hover:text-[#666] transition-colors z-20 w-8 h-8 flex items-center justify-center cursor-pointer"
              style="pointer-events: auto;">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <!-- Content -->
      <div class="flex flex-col items-center justify-center flex-1 w-full" style="pointer-events: auto;">
        <!-- 掃描提示文字 -->
        <div class="text-[65px] text-[#111111] text-center mb-8">
          掃描獲得生成結果
        </div>
        <!-- QR Code Container -->
        <div class="flex justify-center items-center flex-1">
          <div ref="qrcodeContainer" class="flex justify-center"></div>
        </div>



        <!-- URL Display (for debugging/fallback) -->
        <div v-if="showUrl" class="mt-4 p-3 bg-gray-100 rounded text-xs break-all text-[#666] max-w-full">
          {{ imageUrl }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    required: true
  },
  showUrl: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const qrcodeContainer = ref(null)

// Apply gradient effect to QR code canvas
function applyGradientToCanvas(canvas) {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#9995F8')    // 0% - 淺紫色
  gradient.addColorStop(1, '#BF21FB')    // 100% - 亮紫色

  // Create a temporary canvas for gradient
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')

  // Fill with gradient
  tempCtx.fillStyle = gradient
  tempCtx.fillRect(0, 0, canvas.width, canvas.height)
  const gradientData = tempCtx.getImageData(0, 0, canvas.width, canvas.height)

  // Apply gradient only to dark pixels (QR code squares)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // If pixel is dark (QR code square), replace with gradient color
    if (r < 128 && g < 128 && b < 128) {
      data[i] = gradientData.data[i]       // R
      data[i + 1] = gradientData.data[i + 1] // G
      data[i + 2] = gradientData.data[i + 2] // B
    }
  }

  // Put the modified image data back
  ctx.putImageData(imageData, 0, 0)
}

// Generate QR code when modal becomes visible
watch(() => props.isVisible, async (newVal) => {
  if (newVal && props.imageUrl) {
    await nextTick()
    if (qrcodeContainer.value) {
      // Clear previous QR code
      qrcodeContainer.value.innerHTML = ''

      try {
        // Generate QR code - Kiosk 模式使用較大尺寸
        const qrSize = 400  // Kiosk 模式使用 400px
        const canvas = await QRCode.toCanvas(props.imageUrl, {
          width: qrSize,
          margin: 2,
          color: {
            dark: '#000000',  // 純黑色，確保結構正確
            light: '#FFFFFF'  // 純白色背景
          }
        })

        // 不應用漸變效果，保持純黑色 QR Code（根據 Figma 設計）
        // applyGradientToCanvas(canvas)

        // Add rounded corners
        canvas.style.borderRadius = '12px'

        qrcodeContainer.value.appendChild(canvas)
        console.log('✅ QR Code 生成成功')
      } catch (error) {
        console.error('❌ QR Code 生成失敗:', error)
      }
    }
  }
})

function close() {
  emit('close')
}
</script>