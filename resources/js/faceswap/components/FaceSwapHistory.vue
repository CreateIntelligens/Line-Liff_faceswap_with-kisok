<template>
  <!-- History Detail Page -->
  <FaceSwapHistoryDetail
    v-if="showDetailPage"
    :historyItem="selectedHistoryItem"
    :userUsage="props.userUsage"
    :userId="props.userId"
    :isPCMode="isPCMode"
    :isKioskMode="isKioskMode"
    @back="closeDetailPage"
    @regenerate="handleRegenerate"
    @download="handleDownload"
  />

  <!-- History List Page -->
  <div v-else :style="{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', backgroundImage: `url(${imageUrls.pageBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }">
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

    <div style="flex: 1; padding: 2rem 1.5rem;">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <div class="text-[#A90205] text-center">
          <div class="text-lg font-bold mb-2">載入中...</div>
          <div class="text-sm text-gray-300">正在獲取您的生成紀錄</div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
        <div class="text-[#A90205] text-center">
          <div class="text-lg font-bold mb-2">載入失敗</div>
          <div class="text-sm text-gray-300 mb-4">{{ error }}</div>
          <button 
            @click="loadUserHistory"
            class="px-6 py-3 text-[#FBEFC2] font-bold rounded-md transition-all duration-300 hover:bg-[#FF7824] active:bg-[#FF7824] relative"
            style="background-color: #FF7824; touch-action: manipulation;"
          >
            <img 
              src="/resources/images/coin_icon.png" 
              alt=""
              class="absolute pointer-events-none"
              style="top: 0; right: 0; width: 42px; height: 42px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;"
            />
            重試
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!historyData || historyData.length === 0" class="flex flex-col items-center justify-center py-12">
        <div class="text-[#A90205] text-center">
          <div class="text-lg font-bold mb-2">尚無生成紀錄</div>
          <div class="text-sm text-gray-300">您還沒有生成過任何圖片</div>
        </div>
      </div>

      <!-- History grid -->
      <div v-else class="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <div 
          v-for="(item, index) in historyData" 
          :key="item.id || index"
          class="flex w-full p-3 items-center gap-2 bg-white border border-[#CCCCCC] rounded-md cursor-pointer hover:shadow-lg transition-all duration-200"
          @click="viewHistoryItem(item)"
        >
          <div class="flex w-full flex-col items-start gap-2">
            <img 
              v-if="getHistoryImage(item)"
              :src="getHistoryImage(item)" 
              :alt="`生成圖片 ${index + 1}`" 
              class="h-32 w-full object-cover rounded"
              @error="handleImageError"
            />
            <div v-else class="h-32 w-full bg-[#F5F5F5] rounded flex items-center justify-center">
              <span class="text-[#999999] text-xs">無圖片</span>
            </div>
            <div class="text-[#666666] font-normal text-xs">
              {{ formatDate(item.created_at || item.date || item.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { roadshowService } from '../../services/roadshowService.js'
import FaceSwapHistoryDetail from './FaceSwapHistoryDetail.vue'
import UsageCounter from './UsageCounter.vue'
import { imageUrls } from '@/config/imageUrls'

const props = defineProps({
  userId: {
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
});

const emit = defineEmits(['back', 'regenerate'])

const historyData = ref([])
const isLoading = ref(false)
const error = ref(null)

// 詳情頁面相關狀態
const showDetailPage = ref(false)
const selectedHistoryItem = ref(null)

// 獲取用戶歷史圖片
async function loadUserHistory() {
  if (!props.userId) {
    error.value = '沒有用戶ID，無法載入歷史';
    return;
  }
  
  try {
    isLoading.value = true;
    error.value = null;
    
    const result = await roadshowService.getUserHistory(props.userId);
    
    // 檢查API返回的數據格式
    let avatars = [];
    
    if (Array.isArray(result)) {
      // 直接返回陣列格式：[{...}, {...}, ...]
      avatars = result;
    } else if (result && result.success) {
      // 標準格式：{ success: true, result: { avatars: [...] } }
      avatars = result.result?.avatars || result.data?.avatars || result.avatars || [];
    } else if (result && typeof result === 'object') {
      // 其他物件格式
      avatars = result.result?.avatars || result.data?.avatars || result.avatars || [];
    }
    
    if (avatars.length > 0) {
      historyData.value = avatars.map(avatar => ({
        id: avatar.task_id || avatar.id,
        image: avatar.image_url || avatar.result_image || avatar.image || avatar.generated_image,
        created_at: avatar.created_at || avatar.created_date || avatar.timestamp,
        template_id: avatar.metadata?.template_id || avatar.template_id,
        status: avatar.status,
        coupon_code: avatar.metadata?.coupon_code || avatar.coupon_code || '',
        metadata: avatar.metadata || {}
      }));
    } else {
      historyData.value = [];
    }
  } catch (err) {
    console.error('❌ 載入歷史失敗:', err);
    error.value = `載入歷史失敗: ${err.message}`;
    // 錯誤時顯示空狀態
    historyData.value = [];
  } finally {
    isLoading.value = false;
  }
}



// 獲取歷史圖片URL，使用新的圖片處理 API
function getHistoryImage(item) {
  if (!item || !item.image) {
    return null; // 沒有圖片時返回 null
  }
  
  let imageUrl = item.image;
  
  // 如果已經是絕對路徑（http:// 或 https://），直接使用
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('✅ 使用絕對路徑（後端提供）:', imageUrl)
    // 保持 imageUrl 為絕對路徑，繼續後續處理
  } else if (imageUrl.startsWith('/')) {
    // 如果圖片URL是相對路徑，添加API基礎URL
    const baseURL = window.endpoint?.baseURL || 'https://line.uat.tatung2025.aitago.tw/api';
    imageUrl = `${baseURL.replace('/api', '')}${imageUrl}`;
    console.log('🖼️ 相對路徑轉換為完整 URL:', imageUrl)
  }
  
  // 後端明確要求：直接使用絕對路徑，不需要添加任何前綴或代理
  // 如果已經是絕對路徑，直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('✅ 直接使用後端提供的絕對路徑（歷史）:', imageUrl)
    return imageUrl
  }
  
  // 僅對非絕對路徑使用圖片處理 API（如果啟用）
  const config = window.endpoint || {};
  const enableImageProcessing = config.enableImageProcessing || false;
  
  if (enableImageProcessing && config.imageProcessApi) {
    try {
      const apiUrl = config.imageProcessApi;
      const params = config.imageProcessParams || { scale: 1.5, format: 'jpg', quality: 85, width: 600, height: 450 };
      
      // 構建查詢參數
      const queryParams = new URLSearchParams();
      queryParams.append('url', imageUrl);
      if (params.scale) queryParams.append('scale', params.scale);
      if (params.format) queryParams.append('format', params.format);
      if (params.quality) queryParams.append('quality', params.quality);
      if (params.width) queryParams.append('width', params.width);
      if (params.height) queryParams.append('height', params.height);
      
      const processedImageUrl = `${apiUrl}?${queryParams.toString()}`;
      console.log('🔄 歷史圖片使用處理 API:', processedImageUrl);
      
      return processedImageUrl;
    } catch (error) {
      console.error('❌ 處理歷史圖片時發生錯誤:', error);
      // 如果處理失敗，返回原始圖片
      return imageUrl;
    }
  }
  
  // 直接返回原始圖片 URL
  return imageUrl;
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) {
    return '未知時間';
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '未知時間';
    }
    
    // 格式化為 YYYY/M/D HH:mm 格式
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('日期格式化錯誤:', error);
    return '未知時間';
  }
}

// 處理圖片載入錯誤
function handleImageError(event) {
  const imageUrl = event.target.src;
  console.warn('❌ 圖片載入失敗:', imageUrl);
  
  // 避免無限迴圈：檢查是否已經是預設圖片或錯誤圖片
  if (imageUrl.includes('default_history.png') || imageUrl.includes('data:image/svg+xml')) {
    console.log('🔄 已經是預設圖片，停止重試');
    return;
  }
  
  // 設置一個簡單的 SVG 預設圖片，避免網路請求
  const defaultSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpLHotKU8L3RleHQ+Cjwvc3ZnPgo=';
  event.target.src = defaultSvg;
  
  // 記錄錯誤，但不重試
  console.log('🔄 設置預設 SVG 圖片，避免無限迴圈');
}

// 查看歷史項目詳情
function viewHistoryItem(item) {
  console.log('查看歷史項目:', item)
  selectedHistoryItem.value = item
  showDetailPage.value = true
}

// 關閉詳情頁面
function closeDetailPage() {
  showDetailPage.value = false
  selectedHistoryItem.value = null
}

function goBack() {
  emit('back')
}

// 處理重新生成
function handleRegenerate(historyItem) {
  console.log('🔄 從歷史詳情重新生成:', historyItem)
  // 關閉詳情頁面
  closeDetailPage()
  // 發送重新生成事件到父組件
  emit('regenerate')
}

// 處理下載
function handleDownload() {
  // 下載事件由 FaceSwapHistoryDetail 組件處理
  console.log('📥 下載事件已由詳情頁面處理')
}

// 監視 userId 變化
watch(() => props.userId, (newUserId, oldUserId) => {
  if (newUserId && newUserId !== oldUserId && newUserId !== '') {
    loadUserHistory();
  }
}, { immediate: false }); // 改為 false，避免無限迴圈

// 組件掛載時載入歷史
onMounted(() => {
  if (props.userId && props.userId !== '') {
    loadUserHistory();
  } else {
    error.value = '沒有用戶ID，無法載入歷史';
  }
});
</script>
