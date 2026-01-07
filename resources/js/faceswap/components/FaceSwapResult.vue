<template>
  <!-- History Page -->
  <FaceSwapHistory
    v-if="showHistoryPage"
    :userId="props.userId"
    :userUsage="userUsage"
    :isPCMode="isPCMode"
    @back="showHistoryPage = false"
  />

  <!-- Main Result Page -->
  <div v-if="!showHistoryPage" class="relative min-h-screen w-full flex flex-col" style="background-color: #333333;">
      <!-- Header -->
    <div :class="isKioskMode ? 'py-8' : 'py-4'" class="flex justify-center items-center w-full">
      <h1 :class="isKioskMode ? 'text-5xl' : 'text-2xl'" class="font-bold text-white">標題</h1>
    </div>

    <!-- 步驟進度條 (手機版) -->
    <div v-if="!isKioskMode && !isLoading && !isFailed" class="flex max-w-full w-[202px] text-base font-bold text-center text-white whitespace-nowrap mx-auto mt-6">
      <img :src="imageUrls.step1" class="w-6 h-6 object-contain" alt="Step 1">
      <img :src="imageUrls.horizontal" class="w-[65px] object-contain shrink-0 my-auto aspect-[32.26]">
      <img :src="imageUrls.step2_inprogress" class="w-6 h-6 object-contain" alt="Step 2">
      <img :src="imageUrls.horizontal" class="w-[65px] object-contain shrink-0 my-auto aspect-[32.26]">
      <img :src="imageUrls.step3_inprogress" class="w-6 h-6 object-contain" alt="Step 3">
    </div>

    <!-- 步驟文字 (手機版) -->
    <div v-if="!isKioskMode && !isLoading && !isFailed" class="flex justify-between max-w-full w-[218px] text-sm gap-5 text-center text-white mx-auto mt-2 mb-4">
      <div>Step 1</div>
      <div>Step 2</div>
      <div>Step 3</div>
    </div>

    <!-- Main Content -->
    <div :class="isKioskMode ? 'px-16 py-12 relative' : 'px-6 py-8'" class="flex-1 flex flex-col items-center" style="pointer-events: auto;">

      <!-- 載入中狀態 -->
      <div v-if="isLoading && !isFailed" :class="isKioskMode ? 'py-12' : 'py-20'" class="flex flex-col items-center justify-center">
        <!-- Kiosk: 顯示 load.png 圖片 -->
        <img 
          v-if="isKioskMode"
          :src="imageUrls.load"
          alt="載入中"
          class="w-[700px] h-[933px] object-contain mb-8"
        />
        <!-- 載入中文字 -->
        <p :class="isKioskMode ? 'text-3xl' : 'text-sm'" class="text-gray-300">圖片生成中，請稍候...</p>
    </div>

      <!-- 任務失敗錯誤訊息 -->
      <div v-if="isFailed" :class="isKioskMode ? 'py-12' : 'py-20'" class="flex flex-col items-center justify-center">
        <p :class="isKioskMode ? 'text-3xl' : 'text-base'" class="text-red-500 text-center font-bold mb-4">
          {{ errorMessage }}
        </p>
        <p :class="isKioskMode ? 'text-2xl' : 'text-sm'" class="text-gray-300 text-center">
          3秒後將自動返回首頁...
        </p>
      </div>

      <!-- 生成的圖片 (已廢棄，圖片顯示移到 LIFF 模式區塊中) -->
      <!-- <div v-else-if="!isLoading && !isFailed && !isKioskMode">...</div> -->

      <!-- Kiosk 模式：生成成功顯示 -->
      <div v-else-if="!isLoading && !isFailed && isKioskMode" class="flex flex-col items-center w-full">
        <!-- 成功文字 -->
        <div class="text-5xl font-bold text-white mb-16 text-center">
          圖片生成成功！
        </div>
        
        <!-- QR Code -->
        <div class="mb-8">
          <div ref="qrcodeContainer" class="bg-white p-8 rounded-2xl shadow-2xl"></div>
        </div>
        
        <!-- QR Code 說明文字 -->
        <div class="text-3xl text-white text-center mt-8">
          掃描獲得生成結果
        </div>
      </div>
          
      <!-- LIFF 模式：生成結果顯示 -->
      <div v-else-if="!isLoading && !isFailed && !isKioskMode" class="w-full max-w-[335px] flex flex-col">
        <!-- 生成的圖片 -->
        <div class="mb-6">
          <img
            :src="generatedImageUrl || imageUrls.result"
            alt="生成的圖片"
            class="w-full object-contain rounded-lg"
          />
        </div>
        
        <!-- 按鈕區域 - 左右排列 -->
        <div class="flex gap-3 mb-3">
          <!-- 重新生成按鈕 -->
          <button
            @click="handleRegenerate"
            class="flex-1 py-3.5 rounded-md font-bold text-[#0E0E0E] transition-all duration-300"
            style="background: linear-gradient(to bottom, #CCCCCC 0%, #999999 100%);"
          >
            重新生成
          </button>
          
          <!-- 下載至官方版號按鈕 -->
          <button
            @click="handleDownload"
            class="flex-1 py-3.5 rounded-md font-bold text-[#0E0E0E] transition-all duration-300"
            style="background: linear-gradient(to bottom, #CCCCCC 0%, #999999 100%);"
          >
            下載至官方版號
          </button>
        </div>
        
        <!-- 圖片生成紀錄連結 -->
        <div 
          class="text-center text-white text-base font-bold cursor-pointer hover:opacity-80 transition-opacity mb-6"
          @click="handleShowHistory"
        >
          圖片生成紀錄
        </div>
        
        <!-- Barcode 預留區域 -->
        <div class="w-full h-20 bg-gray-700 rounded-md flex items-center justify-center mb-3">
          <span class="text-gray-400 text-sm">barcode</span>
        </div>
        
        <!-- Barcode 說明文字 -->
        <div class="text-center text-white text-sm">
          掃描條碼
        </div>
      </div>
          
      <!-- 表單（僅 LIFF 模式顯示，且送出成功後隱藏） - 已廢棄，改為上方按鈕區塊 -->
      <div v-if="false" :class="isKioskMode ? 'w-[700px] space-y-8' : 'w-full max-w-[335px] space-y-6'" class="relative z-30" style="position: relative; pointer-events: auto;">
        <!-- 真實姓名 (僅手機版) -->
        <div v-if="!isKioskMode" class="relative z-40" style="pointer-events: auto;">
          <label :class="isKioskMode ? 'text-3xl mb-4' : 'text-sm mb-2'" class="block text-white font-bold">
            真實姓名<span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="請輸入真實姓名"
            :class="isKioskMode ? 'px-10 py-8 text-3xl' : 'px-4 py-3'"
            class="w-full rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e91e63] relative z-50"
            style="touch-action: manipulation; position: relative; pointer-events: auto;"
            required
              />
            </div>

        <!-- 聯絡電話 -->
        <div class="relative z-40" style="pointer-events: auto;">
          <label :class="isKioskMode ? 'text-3xl mb-4' : 'text-sm mb-2'" class="block text-white font-bold">
            聯絡電話<span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.phone"
            type="tel"
            placeholder="請輸入聯絡電話"
            :class="isKioskMode ? 'px-10 py-8 text-3xl' : 'px-4 py-3'"
            class="w-full rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e91e63] relative z-50"
            style="position: relative !important; z-index: 9999 !important; pointer-events: auto !important; cursor: text !important; touch-action: auto !important;"
            @click.stop
            @mousedown.stop
            @touchstart.stop
            required
                />
              </div>

        <!-- Email (僅手機版) -->
        <div v-if="!isKioskMode" class="relative z-40">
          <label :class="isKioskMode ? 'text-3xl mb-4' : 'text-sm mb-2'" class="block text-white font-bold">
            Email
          </label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="請輸入 Email"
            :class="isKioskMode ? 'px-10 py-8 text-3xl' : 'px-4 py-3'"
            class="w-full rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e91e63] relative z-50"
            style="touch-action: manipulation; position: relative;"
          />
              </div>

        <!-- 送出按鈕 -->
        <button
          type="button"
          @click="handleSubmit"
          @touchstart.prevent="handleSubmit"
          :disabled="!isFormValid || isSubmitting"
          :class="[
            isKioskMode ? 'py-8 text-4xl !mt-20' : 'py-3.5',
            isFormValid && !isSubmitting 
              ? 'text-[#0E0E0E] cursor-pointer' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
          class="w-full rounded-md font-bold whitespace-nowrap transition-all duration-300 text-center flex items-center justify-center relative z-50"
          :style="(isFormValid && !isSubmitting) ? 'background: linear-gradient(to bottom, #CCCCCC 0%, #999999 100%); position: relative; pointer-events: auto !important; cursor: pointer !important;' : 'position: relative; pointer-events: auto !important; cursor: pointer !important;'"
        >
          {{ isSubmitting ? '送出中...' : '送出' }}
        </button>

        <!-- 錯誤訊息 -->
        <div v-if="errorMessage" :class="isKioskMode ? 'text-3xl' : 'text-sm'" class="text-red-500 text-center font-bold">
          {{ errorMessage }}
      </div>

        <!-- 成功訊息 -->
        <div v-if="successMessage" :class="isKioskMode ? 'text-3xl' : 'text-sm'" class="text-green-600 text-center font-bold">
          {{ successMessage }}
        </div>
      </div>
      
      <!-- 底部說明文字 - 已移除 -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { imageUrls } from '@/config/imageUrls'
import { appConfig, getLiffUrl } from '@/config/appConfig'
import { roadshowService } from '../../services/roadshowService.js'
import QRCode from 'qrcode'
import FaceSwapHistory from './FaceSwapHistory.vue'

const props = defineProps({
  taskId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  selectedTemplate: {
    type: String,
    default: ''
  },
  userUsage: {
    type: Number,
    default: 0
  },
  isPCMode: {
    type: Boolean,
    default: false
  },
  isKioskMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['back', 'regenerate', 'download', 'restart'])

// 控制歷史頁面顯示
const showHistoryPage = ref(false)

// 表單數據
const formData = ref({
  name: '',
  phone: '',
  email: ''
})

// 生成的圖片 URL（處理後的 URL，用於顯示）
const generatedImageUrl = ref('')
// 原始圖片 URL（用於簡訊發送）
const originalImageUrl = ref('')

// UI 狀態
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
// 初始顯示 loading，避免表單閃現，等檢查任務狀態後再決定
const isLoading = ref(true)
// 任務失敗狀態
const isFailed = ref(false)
// 控制是否顯示結果圖片頁面（送出成功後）
const showResultImage = ref(false)

// QR Code 相關
const qrcodeContainer = ref(null)
const qrcodeUrl = ref('')

// 表單驗證
const isFormValid = computed(() => {
  // Kiosk 模式：只驗證電話
  if (props.isKioskMode) {
    return formData.value.phone.trim() !== '' &&
           /^09\d{8}$/.test(formData.value.phone.trim())
  }
  // 手機版：驗證姓名和電話
  return formData.value.name.trim() !== '' && 
         formData.value.phone.trim() !== '' &&
         /^09\d{8}$/.test(formData.value.phone.trim())
})

// 組件掛載時檢查任務狀態
onMounted(async () => {
  // 如果是測試模式，直接顯示預覽
  if (props.taskId === 'test-task-preview') {
    isLoading.value = false
    generatedImageUrl.value = '' // 使用預設的 result.png
    return
  }
  
  // 開始檢查任務狀態時先顯示 loading，避免表單閃現
  isLoading.value = true
  await checkTaskStatus()
})

// 處理圖片 URL，使用 imageProcessApi
function processImageUrl(imageUrl) {
  if (!imageUrl) {
    console.log('❌ 沒有圖片 URL')
    return null
  }
  
  console.log('🖼️ 處理圖片 URL，原始 URL:', imageUrl)
  
  let fullUrl = imageUrl
  
  // 如果圖片 URL 是相對路徑，添加 API 基礎 URL
  if (imageUrl.startsWith('/')) {
    const baseURL = window.endpoint?.baseURL || 'https://line.uat.tatung2025.aitago.tw/api';
    fullUrl = `${baseURL.replace('/api', '')}${imageUrl}`
    console.log('🖼️ 完整圖片 URL:', fullUrl)
  }
  
  // 檢查是否啟用圖片處理 API
  const config = window.endpoint || {}
  const enableImageProcessing = config.enableImageProcessing || false
  
  if (enableImageProcessing && config.imageProcessApi) {
    try {
      console.log('🔄 使用 imageProcessApi 處理圖片:', fullUrl)
      
      const apiUrl = config.imageProcessApi
      const params = config.imageProcessParams || { scale: 1.5, format: 'jpg', quality: 85, width: 600, height: 450 }
      
      // 構建查詢參數
      const queryParams = new URLSearchParams()
      queryParams.append('url', fullUrl)
      if (params.scale) queryParams.append('scale', params.scale)
      if (params.format) queryParams.append('format', params.format)
      if (params.quality) queryParams.append('quality', params.quality)
      if (params.width) queryParams.append('width', params.width)
      if (params.height) queryParams.append('height', params.height)
      
      const processedImageUrl = `${apiUrl}?${queryParams.toString()}`
      console.log('✅ 圖片處理 API URL:', processedImageUrl)
      
      return processedImageUrl
    } catch (error) {
      console.error('❌ 處理圖片時發生錯誤:', error)
      // 如果處理失敗，返回原始圖片 URL
      return fullUrl
    }
  } else {
    // 不使用圖片處理 API，直接返回完整 URL
    console.log('✅ 直接使用圖片 URL:', fullUrl)
    return fullUrl
  }
}

// 檢查任務狀態
async function checkTaskStatus() {
  if (!props.taskId) {
    console.error('❌ [CheckTaskStatus Error]: 缺少任務 ID')
    isFailed.value = true
    isLoading.value = false
    errorMessage.value = '系統忙碌中，將返回首頁'
    setTimeout(() => {
      emit('restart')
    }, 3000)
    return
  }
  
  try {
    errorMessage.value = ''
    // 確保在檢查期間顯示 loading
    isLoading.value = true
    
    const result = await roadshowService.checkTaskStatus(props.taskId)
    
    // 檢查是否為錯誤響應
    if (result && result.success === false && result.error) {
      // 詳細錯誤
      console.error('❌ [CheckTaskStatus Error]:', result.error)
      // 畫面顯示錯誤訊息
      isFailed.value = true
      isLoading.value = false
      errorMessage.value = '系統忙碌中，將返回首頁'
      setTimeout(() => {
        emit('restart')
      }, 3000)
      return
    }
    
    // 嘗試從不同層級提取任務數據
    let taskData = null
    if (result) {
      taskData = result.data?.result || result.result || result.data || result
      
      // 處理任務狀態
      if (taskData.status === 'completed' && taskData.images && taskData.images.length > 0) {
        const rawImage = taskData.images[0]
        
        // 1. 處理原始圖片 URL（確保是絕對路徑，用於發簡訊）
        // 如果是相對路徑，補上基礎域名
        if (rawImage.startsWith('/')) {
          const baseURL = window.endpoint?.baseURL || 'https://line.uat.tatung2025.aitago.tw/api';
          originalImageUrl.value = `${baseURL.replace('/api', '')}${rawImage}`
        } else {
          originalImageUrl.value = rawImage
        }
        
        // 2. 處理顯示圖片 URL（加上 imageProcessApi，用於畫面顯示）
        const processedUrl = processImageUrl(rawImage)
        generatedImageUrl.value = processedUrl || originalImageUrl.value // 如果處理失敗降級使用原始圖
        
        isLoading.value = false
        return
      } else if (taskData.status === 'failed') {
        // 任務失敗：顯示錯誤訊息，3秒後跳轉回首頁
        isFailed.value = true
        isLoading.value = false
        errorMessage.value = '換臉處理失敗：在目標圖片中沒有偵測到臉部'
        console.error('❌ 任務處理失敗:', errorMessage.value)
        // 3秒後自動跳轉回首頁
        setTimeout(() => {
          emit('restart')
        }, 3000)
        return
      } else if (taskData.status === 'pending' || taskData.status === 'processing') {
        // 還在處理中，顯示 loading 並在 3 秒後重試
        isLoading.value = true
        setTimeout(checkTaskStatus, 3000)
        return
      }
    } else {
      // 詳細錯誤
      console.error('❌ [CheckTaskStatus Error]: 無法獲取任務狀態，result:', result)
      // 畫面顯示錯誤訊息
      isFailed.value = true
      isLoading.value = false
      errorMessage.value = '系統忙碌中，將返回首頁'
      setTimeout(() => {
        emit('restart')
      }, 3000)
      return
    }
  } catch (err) {
    // 詳細錯誤
    console.error('❌ [CheckTaskStatus Error]:', err)
    // 畫面顯示錯誤訊息
    isFailed.value = true
    isLoading.value = false
    errorMessage.value = '系統忙碌中，將返回首頁'
    setTimeout(() => {
      emit('restart')
    }, 3000)
  }
}

// 處理表單送出
async function handleSubmit() {
  if (!isFormValid.value || isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''
    
    // 根據模式決定傳送的參數
    let smsParams
    if (props.isKioskMode) {
      // Kiosk 模式：只傳電話和圖片 URL，加上 fromKiosk 標記
      // 使用原始圖片 URL，而不是處理後的 API URL
      smsParams = {
        phone: formData.value.phone,
        img_url: originalImageUrl.value || generatedImageUrl.value,
        fromKiosk: true
      }
    } else {
      // 手機版：傳送所有欄位
      // 使用原始圖片 URL，而不是處理後的 API URL
      smsParams = {
        name: formData.value.name,
        phone: formData.value.phone,
        email: formData.value.email,
        img_url: originalImageUrl.value || generatedImageUrl.value
      }
    }
    
    // 調用後端 API 發送簡訊
    const response = await roadshowService.sendSMS(smsParams)
    
    if (response.success) {
      // 使用 API 返回的訊息或預設訊息
      const message = response.data?.message || '簡訊發送成功'
      successMessage.value = `✅ ${message}`
      
      // 切換到結果顯示模式，顯示生成的圖片
      showResultImage.value = true
    } else {
      // API 返回錯誤
      // 詳細錯誤
      console.error('❌ [Submit Error]:', response.error)
      // 畫面顯示錯誤訊息（不直接顯示 error.message）
      errorMessage.value = '網路連線異常，請稍後再試'
    }
    
  } catch (error) {
    // 詳細錯誤
    console.error('❌ [Submit Error]:', error)
    // 畫面顯示錯誤訊息
    errorMessage.value = '網路連線異常，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}

// 處理關閉並回到首頁
function handleCloseAndRestart() {
  emit('restart')
}

// 處理重新生成
function handleRegenerate() {
  emit('regenerate')
}

// 處理下載
function handleDownload() {
  if (generatedImageUrl.value || originalImageUrl.value) {
    // 創建一個臨時 a 標籤來觸發下載
    const link = document.createElement('a')
    link.href = generatedImageUrl.value || originalImageUrl.value
    link.download = `faceswap_${props.taskId}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    console.log('✅ 下載圖片:', link.href)
  }
}

// 處理分享到 LINE (需要 LIFF SDK)
async function handleShareToLine() {
  try {
    // 檢查 LIFF 是否可用
    if (typeof liff === 'undefined') {
      console.warn('⚠️ LIFF SDK 未載入，無法分享')
      alert('此功能需要在 LINE 中開啟')
      return
    }
    
    // 檢查 LIFF 是否已初始化
    if (!liff.isLoggedIn()) {
      console.warn('⚠️ LIFF 未登入')
      await liff.login()
      return
    }
    
    // 分享圖片到 LINE
    const shareUrl = generatedImageUrl.value || originalImageUrl.value
    if (!shareUrl) {
      alert('沒有可分享的圖片')
      return
    }
    
    await liff.shareTargetPicker([
      {
        type: 'image',
        originalContentUrl: shareUrl,
        previewImageUrl: shareUrl
      }
    ])
    
    console.log('✅ 分享成功')
  } catch (error) {
    console.error('❌ 分享失敗:', error)
    alert('分享失敗，請稍後再試')
  }
}

// 處理顯示歷史
function handleShowHistory() {
  // 顯示歷史頁面
  showHistoryPage.value = true
}

// 生成 QR code
async function generateQRCode() {
  if (!props.taskId || !qrcodeContainer.value) return
  
  try {
    // 使用配置文件中的 LIFF URL
    qrcodeUrl.value = getLiffUrl({
      step: 'result',
      taskId: props.taskId
    })
    console.log('🔗 生成 QR code URL:', qrcodeUrl.value)
    
    // 清空之前的 QR code
    qrcodeContainer.value.innerHTML = ''
    
    // 生成 QR code
    const qrSize = 400 // Kiosk 模式使用較大尺寸
    const canvas = await QRCode.toCanvas(qrcodeUrl.value, {
      width: qrSize,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    // 添加圓角
    canvas.style.borderRadius = '16px'
    
    qrcodeContainer.value.appendChild(canvas)
    console.log('✅ QR code 生成成功')
  } catch (error) {
    console.error('❌ QR code 生成失敗:', error)
  }
}

// 監聽任務完成狀態，在 Kiosk 模式下生成 QR code
watch(() => [isLoading.value, isFailed.value, props.isKioskMode, props.taskId], async () => {
  if (!isLoading.value && !isFailed.value && props.isKioskMode && props.taskId) {
    await nextTick()
    generateQRCode()
  }
}, { immediate: false })

</script>
