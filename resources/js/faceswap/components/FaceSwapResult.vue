<template>
  <!-- History Page -->
  <FaceSwapHistory
    v-if="showHistoryPage"
    :userId="props.userId"
    :userUsage="userUsage"
    :isPCMode="isPCMode"
    :isKioskMode="isKioskMode"
    @back="showHistoryPage = false"
  />

  <!-- Main Result Page -->
  <div v-if="!showHistoryPage" class="relative min-h-screen w-full flex flex-col" :style="{ backgroundImage: `url(${imageUrls.pageBg})`, backgroundSize: isKioskMode ? 'cover' : '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }" style="pointer-events: auto; position: relative; z-index: 1;">
      <!-- Header -->
    <div
      :class="[
        isKioskMode ? 'pt-20 pb-12 px-16 flex items-center justify-center' : 'py-4 px-5 grid grid-cols-[auto_1fr_auto] items-center',
        'gap-2 w-full font-bold'
      ]"
      :style="isKioskMode ? 'min-height: 8rem;' : 'min-height: 5rem; overflow: visible;'"
    >
      <!-- Home icon (非歷史頁使用 home_icon) -->
      <button
        :style="isKioskMode ? 'width: 87px; height: 87px; cursor: pointer !important; border: none; background: none; padding: 0; flex-shrink: 0; pointer-events: auto !important; position: relative; z-index: 20;' : 'width: 26px; height: 26px; cursor: pointer !important; border: none; background: none; padding: 0; flex-shrink: 0; pointer-events: auto !important; position: relative; z-index: 20;'"
        @click.stop="goBack"
        @mousedown.stop
        @touchstart.stop
      >
        <img
          :src="imageUrls.homeIcon"
          alt="Home"
          :style="isKioskMode ? 'width: 87px; height: 87px; object-fit: contain;' : 'width: 26px; height: 26px; object-fit: contain;'"
        />
      </button>

      <!-- Title (手機版置中，Kiosk 模式保持原樣) -->
      <img
        v-if="!isKioskMode"
        :src="imageUrls.header"
        class="h-11 object-contain justify-self-center"
        alt="大同寶寶賀新年"
        style="min-width: 0; max-width: 100%;"
      />
      <img
        v-else
        :src="imageUrls.header"
        class="h-40 object-contain"
        alt="大同寶寶賀新年"
      />

      <!-- Usage counter (手機版靠右，Kiosk 模式不顯示) -->
      <UsageCounter v-if="!isPCMode && !isKioskMode" :currentCount="userUsage" :maxLimit="4" />
    </div>

    <!-- Subtitle: Title3 image (only for kiosk mode) -->
    <div v-if="isKioskMode" class="flex justify-center items-center mt-8 mb-6">
      <img
        :src="imageUrls.kiosk3"
        class="h-auto object-contain"
        alt="生成結果"
      />
    </div>

    <!-- Main Content -->
    <div :class="isKioskMode ? 'px-16 py-12 relative' : 'px-6 py-8'" class="flex-1 flex flex-col items-center" style="pointer-events: auto;">

      <!-- 載入中狀態 -->
      <div v-if="isLoading && !isFailed" :class="isKioskMode ? 'py-12' : 'py-20'" class="flex flex-col items-center justify-center">
        <!-- Kiosk: 顯示 loader.mp4 影片 -->
        <video 
          v-if="isKioskMode"
          :src="imageUrls.loaderVideo"
          class="w-[700px] h-[933px] object-contain mb-8"
          autoplay
          loop
          muted
          playsinline
        />
        <!-- 載入中文字 -->
        <p :class="isKioskMode ? 'text-3xl' : 'text-sm'" class="text-[#A90205]">圖片生成中，請稍候...</p>
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
      <div v-else-if="!isLoading && !isFailed && isKioskMode" class="flex flex-col items-center w-full" style="position: relative; z-index: 10; pointer-events: auto;">
        <!-- 圖片框架（包含邊框和條碼） -->
        <div class="w-full max-w-4xl mb-12" style="pointer-events: auto;">
          <FaceSwapImageFrame 
            ref="imageFrameRef"
            :imageUrl="generatedImageUrl || originalImageUrl"
            :couponCode="couponCode"
            :isKioskMode="true"
            containerClass="mb-0"
          />
        </div>
        
        <!-- 按鈕區域 -->
        <div class="flex gap-6 w-full max-w-4xl" style="position: relative; z-index: 20; pointer-events: auto;">
          <button 
            @click.stop="handleRestart"
            @mousedown.stop
            @touchstart.stop
            class="flex-1 py-6 text-4xl font-bold rounded-md transition-all duration-300 hover:opacity-90 active:opacity-80 cursor-pointer"
            style="background-color: #A90205; color: #FBEFC2; touch-action: manipulation; pointer-events: auto; position: relative; z-index: 30;"
          >
            再玩一次
          </button>
          <button 
            @click.stop="handleSaveImage"
            @mousedown.stop
            @touchstart.stop
            :disabled="isSavingImage"
            class="flex-1 py-6 text-4xl font-bold rounded-md transition-all duration-300 hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative"
            style="background-color: #FF7824; color: #FBEFC2; touch-action: manipulation; pointer-events: auto; position: relative; z-index: 30;"
          >
            <img 
              src="/resources/images/coin_icon.png" 
              alt=""
              class="absolute pointer-events-none"
              :style="`top: 0; right: 0; width: 123px; height: 123px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;`"
            />
            {{ isSavingImage ? '處理中...' : '收藏圖片' }}
          </button>
        </div>
      </div>
          
      <!-- LIFF 模式：生成結果顯示 -->
      <div v-else-if="!isLoading && !isFailed && !isKioskMode" class="w-full max-w-[335px] flex flex-col">
        <!-- 圖片框架（包含邊框和條碼） -->
        <div class="w-full mb-6">
          <FaceSwapImageFrame 
            ref="imageFrameRefMobile"
            :imageUrl="generatedImageUrl || originalImageUrl"
            :couponCode="couponCode"
            :isKioskMode="false"
            containerClass="mb-0"
            @image-load="handleImageLoad"
            @image-error="handleImageError"
          />
        </div>
        
        <!-- 按鈕區域 - 左右排列 -->
        <div class="flex gap-3 mb-2" style="pointer-events: auto; position: relative; z-index: 10;">
          <!-- 重新生成按鈕 -->
          <button
            @click.stop="handleRegenerate"
            @mousedown.stop
            @touchstart.stop
            class="flex-1 py-3.5 rounded-md font-bold text-[#FBEFC2] transition-all duration-300 hover:bg-[#FF7824] active:bg-[#FF7824]"
            style="background-color: #FF7824; touch-action: manipulation; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;"
          >
            重新生成
          </button>
          
          <!-- 下載圖片按鈕 -->
          <button
            @click.stop="handleDownload"
            @mousedown.stop
            @touchstart.stop
            :disabled="isDownloading"
            class="flex-1 py-3.5 rounded-md font-bold text-[#FBEFC2] transition-all duration-300 hover:bg-[#FF7824] active:bg-[#FF7824] relative disabled:opacity-50 disabled:cursor-not-allowed"
            style="background-color: #FF7824; touch-action: manipulation; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;"
          >
            <img 
              src="/resources/images/coin_icon.png" 
              alt=""
              class="absolute pointer-events-none"
              style="top: 0; right: 0; width: 42px; height: 42px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;"
            />
            {{ isDownloading ? '處理中...' : '下載圖片' }}
          </button>
        </div>

        <!-- 圖片生成紀錄按鈕 -->
        <div
          v-if="!isPCMode && !isKioskMode"
          class="text-base font-bold text-center text-[#A90205] cursor-pointer hover:opacity-80 transition-opacity mb-8"
          data-name="圖片生成紀錄"
          style="pointer-events: auto; position: relative; z-index: 10; cursor: pointer !important;"
          @click.stop="handleShowHistory"
          @mousedown.stop
          @touchstart.stop
        >
          圖片生成紀錄
        </div>

        <!-- 使用辦法及注意事項 -->
        <div class="w-full rounded-md mb-4" style="pointer-events: auto;">
          <div class="text-[#A90205] font-bold text-sm mb-1">
            使用辦法及注意事項：
          </div>
          <div class="text-[13px] font-bold text-[#A90205]">
            <div>1. 單筆消費滿1,000元可折抵100元，下述商品不列入折抵使用：福利品、出清品、特價品、資訊周邊商品及非大同品牌之液晶/空調/冰箱/洗衣機。</div>
            <div>2. 優惠條碼使用期間為2026.1.23~2026.3.31</div>
            <div>3. 本活動優惠條碼可於全台大同3C直營門市使用</div>
            <div>4. 每個優惠條碼僅能使用一次，請妥善保存</div>
            <div>5. 大同3C保有本活動之解釋、修改、調整、終止等相關權利</div>
          </div>
        </div>
      </div>
          
      <!-- 表單（僅 LIFF 模式顯示，且送出成功後隱藏） - 已廢棄，改為上方按鈕區塊 -->
      <div v-if="false" :class="isKioskMode ? 'w-[700px] space-y-8' : 'w-full max-w-[335px] space-y-6'" class="relative z-30" style="position: relative; pointer-events: auto;">
        <!-- 真實姓名 (僅手機版) -->
        <div v-if="!isKioskMode" class="relative z-40" style="pointer-events: auto;">
          <label :class="isKioskMode ? 'text-3xl mb-4' : 'text-sm mb-2'" class="block text-[#A90205] font-bold">
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
          <label :class="isKioskMode ? 'text-3xl mb-4' : 'text-sm mb-2'" class="block text-[#A90205] font-bold">
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
          <label :class="isKioskMode ? 'text-3xl mb-4' : 'text-sm mb-2'" class="block text-[#A90205] font-bold">
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
              ? 'text-[#FBEFC2] cursor-pointer hover:bg-[#FF7824] active:bg-[#FF7824]' 
              : 'text-[#FBEFC2] cursor-not-allowed'
          ]"
          class="w-full rounded-md font-bold whitespace-nowrap transition-all duration-300 text-center flex items-center justify-center relative z-50"
          :style="(isFormValid && !isSubmitting) ? 'background-color: #FF7824; position: relative; pointer-events: auto !important; cursor: pointer !important; touch-action: manipulation;' : 'background-color: #D84729; position: relative; pointer-events: auto !important; cursor: pointer !important; touch-action: manipulation;'"
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

    <!-- QR Code 彈窗（Kiosk 模式使用） -->
    <QRCodeModal 
      v-if="isKioskMode"
      :isVisible="showQRCodeModal"
      :imageUrl="fullImageUrl"
      @close="showQRCodeModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { imageUrls } from '@/config/imageUrls'
import { appConfig, getLiffUrl } from '@/config/appConfig'
import { roadshowService } from '../../services/roadshowService.js'
import QRCode from 'qrcode'
import FaceSwapHistory from './FaceSwapHistory.vue'
import UsageCounter from './UsageCounter.vue'
import FaceSwapImageFrame from './FaceSwapImageFrame.vue'
import QRCodeModal from './QRCodeModal.vue'
import { useScreenshot } from '@/composables/useScreenshot.js'

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
// 圖片載入錯誤狀態
const imageLoadError = ref(false)

// 圖片框架 ref
const imageFrameRef = ref(null) // Kiosk 模式使用
const imageFrameRefMobile = ref(null) // 手機版使用

// 收藏圖片相關
const isSavingImage = ref(false)
const showQRCodeModal = ref(false)
const fullImageUrl = ref('')

// 下載圖片相關
const isDownloading = ref(false)

// Coupon Code 相關
const couponCode = ref('')

// 使用截圖 composable
const { captureScreenshot, compressImage, smartUploadImage, downloadToLocal, showMessage } = useScreenshot()

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
  
  // 如果已經是絕對路徑（http:// 或 https://），直接使用，不做任何處理
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('✅ 使用絕對路徑（後端提供）:', imageUrl)
    fullUrl = imageUrl
  } else if (imageUrl.startsWith('/')) {
    // 如果圖片 URL 是相對路徑，添加 API 基礎 URL
    const baseURL = window.endpoint?.baseURL || 'https://line.uat.tatung2025.aitago.tw/api';
    fullUrl = `${baseURL.replace('/api', '')}${imageUrl}`
    console.log('🖼️ 相對路徑轉換為完整 URL:', fullUrl)
  } else if (imageUrl.includes('://')) {
    // 處理其他協議（如 data:、blob: 等）
    console.log('✅ 使用其他協議 URL:', imageUrl)
    fullUrl = imageUrl
  } else if (imageUrl.includes('.') && !imageUrl.startsWith('/')) {
    // 處理沒有協議但包含域名的 URL（如：line.uat.tatung2025.aitago.tw/static/...）
    // 這種情況需要加上 https://
    fullUrl = `https://${imageUrl}`
    console.log('🖼️ 檢測到無協議的域名 URL，添加 https://:', fullUrl)
  }
  
  // 後端明確要求：直接使用絕對路徑，不需要添加任何前綴或代理
  // 如果已經是絕對路徑（http:// 或 https://），直接返回，不做任何處理
  if (fullUrl.startsWith('http://') || fullUrl.startsWith('https://')) {
    console.log('✅ 直接使用後端提供的絕對路徑（不經過代理）:', fullUrl)
    return fullUrl
  }
  
  // 檢查是否啟用圖片處理 API（僅用於非絕對路徑的情況）
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
      console.log('📋 原始響應數據:', JSON.stringify(result, null, 2))
      taskData = result.data?.result || result.result || result.data || result
      console.log('📋 提取的任務數據:', JSON.stringify(taskData, null, 2))
      
      // 處理任務狀態
      if (taskData.status === 'completed' && taskData.images && taskData.images.length > 0) {
        const rawImage = taskData.images[0]
        console.log('🖼️ 從響應中提取的圖片 URL:', rawImage)
        
        // 1. 處理原始圖片 URL（確保是絕對路徑，用於發簡訊）
        // 如果已經是絕對路徑，直接使用；如果是相對路徑，補上基礎域名
        if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
          // 後端提供的絕對路徑，直接使用
          originalImageUrl.value = rawImage
          console.log('✅ 使用後端提供的絕對路徑（原始）:', rawImage)
        } else if (rawImage.startsWith('/')) {
          // 相對路徑，補上基礎域名
          const baseURL = window.endpoint?.baseURL || 'https://line.uat.tatung2025.aitago.tw/api';
          originalImageUrl.value = `${baseURL.replace('/api', '')}${rawImage}`
          console.log('🖼️ 相對路徑轉換為完整 URL（原始）:', originalImageUrl.value)
        } else if (rawImage.includes('.') && !rawImage.startsWith('/') && rawImage.includes('tatung')) {
          // 處理沒有協議但包含域名的 URL（如：line.uat.tatung2025.aitago.tw/static/...）
          originalImageUrl.value = `https://${rawImage}`
          console.log('🖼️ 檢測到無協議的域名 URL（原始），添加 https://:', originalImageUrl.value)
        } else {
          originalImageUrl.value = rawImage
        }
        
        // 2. 處理顯示圖片 URL（加上 imageProcessApi，用於畫面顯示）
        const processedUrl = processImageUrl(rawImage)
        generatedImageUrl.value = processedUrl || originalImageUrl.value // 如果處理失敗降級使用原始圖
        
        // 重置圖片載入錯誤狀態
        imageLoadError.value = false
        
        // 提取 coupon_code
        if (taskData.coupon_code) {
          couponCode.value = taskData.coupon_code
          console.log('🎫 提取到 coupon_code:', couponCode.value)
        } else {
          console.warn('⚠️ 未找到 coupon_code')
          couponCode.value = ''
        }
        
        // 詳細日誌
        console.log('📸 圖片 URL 處理完成:')
        console.log('  - 原始路徑:', rawImage)
        console.log('  - 原始 URL (用於簡訊):', originalImageUrl.value)
        console.log('  - 顯示 URL (用於畫面):', generatedImageUrl.value)
        console.log('  - 是否為絕對路徑:', rawImage.startsWith('http://') || rawImage.startsWith('https://'))
        
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

// 處理返回
function goBack() {
  emit('back')
}

// 處理關閉並回到首頁
function handleCloseAndRestart() {
  emit('restart')
}

// 處理重新開始（Kiosk 模式）
function handleRestart() {
  emit('restart')
}

// 處理收藏圖片（Kiosk 模式）
async function handleSaveImage() {
  if (isSavingImage.value || !imageFrameRef.value) {
    return
  }

  try {
    isSavingImage.value = true
    console.log('📸 開始截圖並上傳完整圖片...')
    
    // 檢查圖片 URL 是否存在
    const currentImageUrl = generatedImageUrl.value || originalImageUrl.value
    if (!currentImageUrl) {
      throw new Error('沒有可用的圖片 URL')
    }
    console.log('🖼️ 當前圖片 URL:', currentImageUrl)

    // 獲取圖片框架容器
    const container = imageFrameRef.value.imageFrameContainer
    if (!container) {
      throw new Error('找不到截圖區域')
    }
    
    // 檢查容器內的圖片元素
    const imgElement = container.querySelector('img')
    if (imgElement) {
      console.log('🖼️ 容器內圖片元素:', {
        src: imgElement.src,
        complete: imgElement.complete,
        naturalWidth: imgElement.naturalWidth,
        naturalHeight: imgElement.naturalHeight,
        isPlaceholder: imgElement.src.includes('AI 生成圖片')
      })
      
      // 如果圖片還沒載入完成，等待載入
      if (!imgElement.complete || imgElement.naturalWidth === 0) {
        console.log('⏳ 等待圖片載入完成...')
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('⏰ 圖片載入超時，繼續截圖')
            resolve()
          }, 10000)
          
          imgElement.onload = () => {
            clearTimeout(timeout)
            console.log('✅ 圖片載入完成')
            resolve()
          }
          imgElement.onerror = () => {
            clearTimeout(timeout)
            console.error('❌ 圖片載入失敗')
            resolve()
          }
        })
      }
    }

    // 1. 截圖整個區域（包含邊框和條碼）
    const canvas = await captureScreenshot(container)
    console.log('✅ 截圖完成，Canvas 尺寸:', canvas.width, 'x', canvas.height)

    // 2. 轉換為 Blob
    const blob = await compressImage(canvas)
    console.log('✅ 圖片處理完成，大小:', (blob.size / 1024 / 1024).toFixed(2) + 'MB')

    // 3. 上傳到伺服器
    const uploadedUrl = await smartUploadImage(blob, props.userId, `faceswap-kiosk-${props.taskId}`)
    console.log('✅ 圖片上傳完成:', uploadedUrl)

    // 4. 設置完整圖片 URL 並顯示 QR Code 彈窗
    fullImageUrl.value = uploadedUrl
    showQRCodeModal.value = true

    showMessage('圖片已準備完成，請掃描 QR Code 獲取', 'success')

  } catch (error) {
    console.error('❌ 收藏圖片流程失敗:', error)
    showMessage(`處理失敗: ${error.message}`, 'error')
  } finally {
    isSavingImage.value = false
  }
}

// 處理重新生成
function handleRegenerate() {
  emit('regenerate')
}

// 處理下載（手機版：下載包含背景邊框和條碼的完整圖片）
async function handleDownload() {
  if (isDownloading.value || !imageFrameRefMobile.value) {
    return
  }

  try {
    isDownloading.value = true
    console.log('📸 開始截圖並下載完整圖片...')
    
    // 檢查圖片 URL 是否存在
    const currentImageUrl = generatedImageUrl.value || originalImageUrl.value
    if (!currentImageUrl) {
      throw new Error('沒有可用的圖片 URL')
    }
    console.log('🖼️ 當前圖片 URL:', currentImageUrl)

    // 獲取圖片框架容器
    const container = imageFrameRefMobile.value.imageFrameContainer
    if (!container) {
      throw new Error('找不到截圖區域')
    }
    
    // 檢查容器內的圖片元素
    const imgElement = container.querySelector('img')
    if (imgElement) {
      console.log('🖼️ 容器內圖片元素:', {
        src: imgElement.src,
        complete: imgElement.complete,
        naturalWidth: imgElement.naturalWidth,
        naturalHeight: imgElement.naturalHeight,
        isPlaceholder: imgElement.src.includes('AI 生成圖片')
      })
      
      // 如果圖片還沒載入完成，等待載入
      if (!imgElement.complete || imgElement.naturalWidth === 0) {
        console.log('⏳ 等待圖片載入完成...')
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('⏰ 圖片載入超時，繼續截圖')
            resolve()
          }, 10000)
          
          imgElement.onload = () => {
            clearTimeout(timeout)
            console.log('✅ 圖片載入完成')
            resolve()
          }
          imgElement.onerror = () => {
            clearTimeout(timeout)
            console.error('❌ 圖片載入失敗')
            resolve()
          }
        })
      }
    }

    // 1. 截圖整個區域（包含邊框和條碼）
    const canvas = await captureScreenshot(container)
    console.log('✅ 截圖完成，Canvas 尺寸:', canvas.width, 'x', canvas.height)

    // 2. 轉換為 Blob
    const blob = await compressImage(canvas)
    console.log('✅ 圖片處理完成，大小:', (blob.size / 1024 / 1024).toFixed(2) + 'MB')

    // 3. 直接下載到本機
    downloadToLocal(blob, `faceswap-mobile-${props.taskId}`)
    showMessage('圖片已成功下載！', 'success')
    console.log('✅ 下載完成')

  } catch (error) {
    console.error('❌ 下載圖片流程失敗:', error)
    showMessage(`下載失敗: ${error.message}`, 'error')
  } finally {
    isDownloading.value = false
  }
}

// 處理分享到 LINE (需要 LIFF SDK)
async function handleShareToLine() {
  try {
    // 檢查 LIFF 開關是否啟用
    const enableLiff = window.endpoint?.enableLiff ?? false
    if (!enableLiff) {
      console.warn('⚠️ LIFF 功能已關閉')
      alert('此功能需要在 LINE 中開啟')
      return
    }
    
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

// 處理圖片載入錯誤
async function handleImageError(event) {
  const imageUrl = event.target.src
  imageLoadError.value = true
  console.error('❌ 圖片載入失敗:', imageUrl)
  console.error('❌ 原始圖片 URL:', originalImageUrl.value)
  console.error('❌ 處理後圖片 URL:', generatedImageUrl.value)
  
  // 如果代理 API 失敗，嘗試降級使用原始 URL
  if (imageUrl.includes('stg-api.fanpokka.ai') && originalImageUrl.value && originalImageUrl.value !== imageUrl) {
    console.warn('⚠️ 代理 API 失敗，嘗試降級使用原始 GCS URL')
    console.warn('⚠️ 注意：這可能會因為 CORS 問題而失敗，但至少可以測試原始 URL 是否可訪問')
    
    // 先測試原始 URL 是否可訪問
    try {
      const testResponse = await fetch(originalImageUrl.value, { method: 'HEAD', mode: 'no-cors' })
      console.log('🔍 原始 URL 測試結果（no-cors）:', testResponse)
    } catch (testError) {
      console.warn('⚠️ 原始 URL 測試失敗（預期，因為 CORS）:', testError)
    }
    
    // 延遲一下再嘗試，避免立即重試
    setTimeout(() => {
      if (imageLoadError.value) {
        console.log('🔄 降級：嘗試使用原始 GCS URL:', originalImageUrl.value)
        generatedImageUrl.value = originalImageUrl.value
        imageLoadError.value = false // 重置錯誤狀態，讓圖片重新載入
      }
    }, 1000)
    return
  }
  
  // 診斷可能的問題
  console.error('🔍 診斷資訊:')
  console.error('  - 可能是 CORS 問題（Google Cloud Storage 需要設定 CORS）')
  console.error('  - 可能是圖片檔案不存在')
  console.error('  - 可能是權限問題')
  console.error('  - 可能是代理 API 無法處理該 URL')
  console.error('')
  console.error('📋 請執行以下測試來診斷問題:')
  console.error('  1. 在瀏覽器新分頁打開原始 URL:', originalImageUrl.value)
  console.error('  2. 在瀏覽器新分頁打開代理 URL:', imageUrl)
  console.error('  3. 檢查 Network 標籤中的錯誤詳情')
  console.error('')
  console.error('💡 問題判斷:')
  if (imageUrl.includes('storage.googleapis.com')) {
    console.error('  - 如果原始 URL 可以直接打開 → 後端需要設定 GCS CORS')
    console.error('  - 如果原始 URL 無法打開 → 後端圖片路徑有問題')
  }
  if (imageUrl.includes('stg-api.fanpokka.ai')) {
    console.error('  - 如果代理 URL 無法打開 → 後端代理 API 有問題')
    console.error('  - 如果代理 URL 可以打開但圖片標籤失敗 → 可能是 CORS 或格式問題')
  }
}

// 處理圖片載入成功
function handleImageLoad(event) {
  imageLoadError.value = false
  console.log('✅ 圖片載入成功:', event.target.src)
}

// 監聽任務完成狀態（移除舊的 QR Code 生成邏輯，現在在彈窗中顯示）
// watch(() => [isLoading.value, isFailed.value, props.isKioskMode, props.taskId], async () => {
//   if (!isLoading.value && !isFailed.value && props.isKioskMode && props.taskId) {
//     await nextTick()
//     generateQRCode()
//   }
// }, { immediate: false })

</script>
