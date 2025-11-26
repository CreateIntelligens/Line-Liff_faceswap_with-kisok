<template>
  <div v-if="isVisible" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="close"></div>

    <!-- Modal Content -->
    <div class="relative bg-white bg-opacity-90 rounded-lg p-8 max-w-sm mx-4 z-[10000]">
      <!-- Close button -->
      <button @click="close"
              class="absolute top-4 right-4 text-[#333] hover:text-[#666] transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Title -->
      <div class="text-center mb-6">
        <h3 class="text-xl font-bold text-[#333]">掃描獲取照片</h3>
      </div>

      <!-- QR Code Container -->
      <div class="flex justify-center mb-6">
        <div ref="qrcodeContainer"></div>
      </div>


      <!-- URL Display (for debugging/fallback) -->
      <div v-if="showUrl" class="mt-4 p-3 bg-gray-100 rounded text-xs break-all text-[#666]">
        {{ imageUrl }}
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
        // Generate QR code with solid colors first - scale for PC
        const qrSize = window.innerWidth >= 1024 ? 400 : 200  // PC版放大2倍
        const canvas = await QRCode.toCanvas(props.imageUrl, {
          width: qrSize,
          margin: 1,
          color: {
            dark: '#000000',  // 純黑色，確保結構正確
            light: '#FFFFFF'  // 純白色背景
          }
        })

        // Apply gradient effect to QR code
        applyGradientToCanvas(canvas)

        // Add rounded corners to QR code - scale for PC
        canvas.style.borderRadius = window.innerWidth >= 1024 ? '16px' : '8px'

        qrcodeContainer.value.appendChild(canvas)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
    }
  }
})

function close() {
  emit('close')
}
</script>