<template>
  <div :style="{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', backgroundImage: `url(${imageUrls.pageBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }">
    <!-- Header -->
    <div
      :class="isKioskMode ? 'pt-20 pb-12' : 'py-4'"
      class="flex items-center justify-center gap-4 px-5 w-full font-bold"
      :style="isKioskMode ? 'min-height: 8rem;' : 'min-height: 5rem;'"
    >
      <!-- Back icon (歷史相關頁使用 back.png) -->
      <button
        :style="isKioskMode ? 'width: 87px; height: 87px; cursor: pointer; border: none; background: none; padding: 0;' : 'width: 26px; height: 26px; cursor: pointer; border: none; background: none; padding: 0;'"
        @click="goBack"
      >
        <img
          :src="imageUrls.back"
          alt="Back"
          :style="isKioskMode ? 'width: 87px; height: 87px; object-fit: contain;' : 'width: 26px; height: 26px; object-fit: contain;'"
        />
      </button>

      <!-- Title -->
      <img
        :src="imageUrls.history"
        :style="isKioskMode ? 'height: 2rem; object-fit: contain;' : 'height: 2.8rem; object-fit: contain;'"
        alt="圖片生成紀錄"
      />

      <!-- Usage counter -->
      <UsageCounter v-if="!isPCMode" :currentCount="userUsage" />
    </div>

    <!-- Sub Header with Title -->
    <div style="display: flex; justify-content: flex-start; align-items: center; padding: 1.5rem 1.25rem;">
      <!-- Title -->
      <img
        :src="imageUrls.title3"
        alt="生成結果"
        style="height: 1.6rem; object-fit: contain;"
      />
    </div>

    <!-- Main Content -->
    <div style="flex: 1; padding: 0 1.5rem 2rem 1.5rem;">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <div class="text-[#A90205] text-center">
          <div class="text-lg font-bold mb-2">載入中...</div>
          <div class="text-sm text-gray-300">正在獲取生成詳情</div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
        <div class="text-[#A90205] text-center">
          <div class="text-lg font-bold mb-2">載入失敗</div>
          <div class="text-sm text-gray-300 mb-4">{{ error }}</div>
          <button 
            @click="loadHistoryDetail"
            class="px-6 py-3 text-[#FBEFC2] font-bold rounded-md transition-all duration-300 hover:bg-[#FF7824] active:bg-[#FF7824]"
            style="background-color: #FF7824; touch-action: manipulation;"
          >
            重試
          </button>
        </div>
      </div>

      <!-- Detail Content -->
      <div v-else-if="historyDetail" class="flex flex-col items-center max-w-md mx-auto">
        <!-- Image Frame Container (使用 FaceSwapImageFrame 組件) -->
        <div class="w-full mb-6">
          <FaceSwapImageFrame
            ref="imageFrameContainer"
            :imageUrl="getHistoryImage(historyDetail)"
            :couponCode="historyDetail.couponCode || ''"
            :isKioskMode="false"
            containerClass="mb-0"
            @image-load="handleImageLoad"
            @image-error="handleImageError"
          />
        </div>

        <!-- Action Buttons -->
        <div class="w-full flex gap-3 mb-8">
          <!-- Regenerate Button -->
          <button 
            class="flex-1 py-3.5 rounded-md font-bold text-[#FBEFC2] transition-all duration-300 hover:bg-[#FF7824] active:bg-[#FF7824]"
            style="background-color: #FF7824; touch-action: manipulation;"
            @click="handleRegenerate"
          >
            重新生成
          </button>
          
          <!-- Download Button -->
          <button 
            class="flex-1 py-3.5 rounded-md font-bold text-[#FBEFC2] transition-all duration-300 hover:bg-[#FF7824] active:bg-[#FF7824] relative"
            :class="historyDetail && historyDetail.status === 'completed' && !isDownloading ? '' : 'cursor-not-allowed'"
            :style="historyDetail && historyDetail.status === 'completed' && !isDownloading ? 'background-color: #FF7824; touch-action: manipulation;' : 'background-color: #D84729; touch-action: manipulation;'"
            @click="handleDownload"
            :disabled="!historyDetail || historyDetail.status !== 'completed' || isDownloading"
          >
            <img 
              src="/resources/images/coin_icon.png" 
              alt=""
              class="absolute pointer-events-none"
              :style="isKioskMode ? 'top: 0; right: 0; width: 123px; height: 123px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;' : 'top: 0; right: 0; width: 42px; height: 42px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;'"
            />
            {{ isDownloading ? '處理中...' : '下載圖片' }}
          </button>
        </div>

        <!-- Usage Instructions -->
        <div class="w-full rounded-md mb-4">
          <div class="text-[#A90205] font-bold text-sm mb-1">
            使用辦法及注意事項：
          </div>
          <div class="text-[13px] font-bold text-[#A90205]">
            <div>1. 單筆消費滿1,000元可享100元折價</div>
            <div>2. 優惠條碼使用期間為2026.1.23~2026.3.31</div>
            <div>3. 本活動優惠條碼可於全台大同3C直營門市使用</div>
            <div>4. 每個優惠條碼僅能使用一次,請妥善保存</div>
            <div>5. 部分商品不列入消費滿額計算,請以門市現場公告為準</div>
            <div>6. 大同3C保有本活動之解釋、修改、調整、終止等相關權利</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { roadshowService } from '../../services/roadshowService.js'
import UsageCounter from './UsageCounter.vue'
import FaceSwapImageFrame from './FaceSwapImageFrame.vue'
import { imageUrls } from '@/config/imageUrls'

const props = defineProps({
  historyItem: {
    type: Object,
    default: null
  },
  userUsage: {
    type: Number,
    default: 0
  },
  userId: {
    type: String,
    default: ''
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

const emit = defineEmits(['back', 'regenerate', 'download'])

const isLoading = ref(false)
const error = ref(null)
const historyDetail = ref(null)
const imageLoadError = ref(false)
const isDownloading = ref(false)

// Refs for download functionality
const imageFrameContainer = ref(null)

// 監聽 historyItem 變化
watch(() => props.historyItem, async (newItem) => {
  if (newItem) {
    console.log('🔄 FaceSwapHistoryDetail - 接收到歷史項目:', newItem)
    await loadHistoryDetail()
  }
}, { immediate: true })

// 載入歷史詳情
async function loadHistoryDetail() {
  if (!props.historyItem) {
    error.value = '沒有歷史項目數據'
    return
  }

  try {
    isLoading.value = true
    error.value = null
    
    console.log('📥 開始載入歷史詳情:', props.historyItem)
    
    // 直接使用傳入的歷史項目數據
    historyDetail.value = {
      ...props.historyItem,
      // 確保圖片URL正確
      image: getHistoryImage(props.historyItem),
      // 提取 coupon_code（從 metadata.coupon_code 或 coupon_code）
      couponCode: props.historyItem.metadata?.coupon_code || props.historyItem.coupon_code || ''
    }
    
    console.log('✅ 歷史詳情載入完成:', historyDetail.value)
    console.log('🎫 提取到 coupon_code:', historyDetail.value.couponCode)
    
  } catch (err) {
    console.error('❌ 載入歷史詳情失敗:', err)
    error.value = `載入失敗: ${err.message}`
  } finally {
    isLoading.value = false
  }
}

// 獲取歷史圖片URL
function getHistoryImage(item) {
  if (!item) {
    console.log('❌ 沒有歷史項目數據')
    return null
  }
  
  console.log('🖼️ 處理歷史圖片，原始數據:', item)
  
  // 嘗試多個可能的圖片字段
  const imageUrl = item.image || item.image_url || item.result_image || item.generated_image
  
  if (!imageUrl) {
    console.log('❌ 沒有找到圖片URL')
    return null
  }
  
  console.log('🖼️ 找到圖片URL:', imageUrl)
  
  let fullUrl = imageUrl;
  
  // 如果已經是絕對路徑（http:// 或 https://），直接使用
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('✅ 使用絕對路徑（後端提供）:', imageUrl)
    fullUrl = imageUrl
  } else if (imageUrl.startsWith('/')) {
    // 如果圖片URL是相對路徑，添加API基礎URL
    const baseURL = window.endpoint?.baseURL || 'https://line.uat.tatung2025.aitago.tw/api';
    fullUrl = `${baseURL.replace('/api', '')}${imageUrl}`
    console.log('🖼️ 相對路徑轉換為完整 URL:', fullUrl)
  }
  
  // 後端明確要求：直接使用絕對路徑，不需要添加任何前綴或代理
  // 如果已經是絕對路徑，直接返回
  if (fullUrl.startsWith('http://') || fullUrl.startsWith('https://')) {
    console.log('✅ 直接使用後端提供的絕對路徑（歷史詳情）:', fullUrl)
    return fullUrl
  }
  
  // 僅對非絕對路徑使用圖片處理 API（如果啟用）
  const config = window.endpoint || {};
  const enableImageProcessing = config.enableImageProcessing || false;
  
  if (enableImageProcessing && config.imageProcessApi) {
    try {
      console.log('🔄 使用新 API 處理歷史圖片:', fullUrl)
      
      const apiUrl = config.imageProcessApi;
      const params = config.imageProcessParams || { scale: 1.5, format: 'jpg', quality: 85, width: 600, height: 450 };
      
      // 構建查詢參數
      const queryParams = new URLSearchParams();
      queryParams.append('url', fullUrl);
      if (params.scale) queryParams.append('scale', params.scale);
      if (params.format) queryParams.append('format', params.format);
      if (params.quality) queryParams.append('quality', params.quality);
      if (params.width) queryParams.append('width', params.width);
      if (params.height) queryParams.append('height', params.height);
      
      const processedImageUrl = `${apiUrl}?${queryParams.toString()}`;
      console.log('✅ 歷史圖片處理 API URL:', processedImageUrl);
      
      return processedImageUrl;
    } catch (error) {
      console.error('❌ 處理歷史圖片時發生錯誤:', error)
      // 如果處理失敗，返回原始圖片
      return fullUrl
    }
  }
  
  // 直接返回原始圖片 URL
  return fullUrl
}

// 處理圖片載入成功
function handleImageLoad(event) {
  imageLoadError.value = false
  console.log('✅ 圖片載入成功:', event.target.src)
}

// 處理圖片載入錯誤
function handleImageError(event) {
  const imageUrl = event.target.src
  imageLoadError.value = true
  console.warn('❌ 圖片載入失敗:', imageUrl)
}


// 返回
function goBack() {
  emit('back')
}

// 處理重新生成
function handleRegenerate() {
  console.log('🔄 重新生成歷史項目')
  emit('regenerate', historyDetail.value)
}

// 處理下載（暫時只下載圖片，條碼功能後續添加）
async function handleDownload() {
  if (!historyDetail.value || historyDetail.value.status !== 'completed') {
    console.warn('⚠️ 歷史項目尚未完成，無法下載')
    return
  }

  if (isDownloading.value) {
    console.log('⏳ 正在處理中，請稍候...')
    return
  }

  try {
    isDownloading.value = true
    console.log('📥 開始下載歷史項目圖片')
    
    // 暫時只下載圖片本身，後續會改為下載包含條碼的完整畫面
    const imageUrl = getHistoryImage(historyDetail.value)
    if (imageUrl) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `faceswap_${historyDetail.value.id || 'detail'}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log('✅ 下載完成')
    }
    
  } catch (error) {
    console.error('❌ 下載流程失敗:', error)
  } finally {
    isDownloading.value = false
  }
}

// 組件掛載時載入詳情
onMounted(() => {
  if (props.historyItem) {
    loadHistoryDetail()
  }
})
</script>
