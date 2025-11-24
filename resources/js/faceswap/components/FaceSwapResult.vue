<template>
  <div
    class="relative mx-auto my-0 bg-black h-screen w-full lg:h-full lg:w-full lg:flex lg:flex-col lg:px-[5.4%]"
  >
    <!-- QR Code Modal -->
    <QRCodeModal
      :isVisible="showQRCode"
      :imageUrl="qrCodeUrl"
      @close="showQRCode = false"
    />
    <!-- Face Swap History Page -->
    <FaceSwapHistory
      v-if="showHistory"
      :userId="props.userId || 'abc'"
      :userUsage="userUsage"
      :isPCMode="isPCMode"
      @back="showHistory = false"
      @regenerate="handleHistoryRegenerate"
    />
    
    <!-- Main Result Page -->
    <div v-if="!showHistory" class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="flex gap-5 justify-center items-center px-12 pt-12 pb-8 w-full font-bold min-h-20 lg:pt-20 lg:pb-8">
        <img
          :src="imageUrls.header"
          class="h-20 object-contain lg:h-48"
          alt="2025三立集團內容創新發布會"
        />
      </div>

     <!-- 步驟 -->
     <div
      class="flex max-w-full text-base font-bold text-center text-[#EBD8B2] whitespace-nowrap w-[202px] mx-auto lg:w-[404px]"
    >
      <img
        :src="imageUrls.finish"
        class="w-6 h-6 object-contain lg:w-12 lg:h-12"
        alt="Step 1"
      />
      <img
        :src="imageUrls.horizontal"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px] lg:w-[130px]"
      />
      <img
        :src="imageUrls.finish"
        class="w-6 h-6 object-contain lg:w-12 lg:h-12"
        alt="Step 2"
      />
      <img
        :src="imageUrls.horizontal"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px] lg:w-[130px]"
      />
      <img
        :src="imageUrls.finish"
        class="w-6 h-6 object-contain lg:w-12 lg:h-12"
        alt="Step 3"
      />
    </div>
    <!-- 步驟文字 -->
    <div
      class="flex gap-5 justify-between max-w-full text-sm text-center text-[#EBD8B2] w-[218px] mx-auto lg:w-[436px] lg:text-2xl lg:gap-10"
    >
      <div data-name="Step 1">Step 1</div>
      <div data-name="Step 2">Step 2</div>
      <div data-name="Step 3">Step 3</div>
    </div>

      
    <div class="mt-14 w-full max-w-[338px] mx-auto lg:max-w-[90%] lg:mt-14">
      <div class="flex flex-col w-full">
        <div class="flex gap-2.5 items-center font-bold whitespace-nowrap lg:justify-start">
          <div class="self-stretch my-auto text-lg text-[#333333] w-6 h-6 lg:w-12 lg:h-12">
            <img
              :src="imageUrls.step3_inprogress"
              class="w-6 h-6 object-contain lg:w-12 lg:h-12"
              alt="Step 3"
            />
          </div>
          <div class="self-stretch my-auto text-base text-[#EBD8B2] lg:text-3xl">
            生成結果
          </div>
        </div>
        <!-- Main Content -->
        <div class="mt-9 w-full">
          <div class="bg-[#141414] p-6 relative lg:p-12" ref="captureArea">
            <!-- Left Edge Decoration -->
            <div
              class="absolute left-0 top-44 w-[7px] h-[183px] flex-shrink-0"
              style="background: linear-gradient(180deg, #12E5DA 0%, #14E1D6 5.29%, #2FD4D3 11.84%, #3DD0D3 17.92%, #8CCBDA 23.69%, #A5ABC8 28.59%, #BFA2C2 32.33%, #D39BB3 37.03%, #D99BA9 41.51%, #DD9F95 46.52%, #DDA587 50.79%, #DBAC7B 55.81%, #D4B581 60.93%, #CDB78F 66.05%, #B9B6B5 73.09%, #A1B0D5 79.33%, #83A3E6 86.54%, #749CEB 92.31%, #5E90EE 100%);"
            ></div>

            <!-- Right Edge Decoration -->
            <div
              class="absolute right-0 top-10 w-[7px] h-[183px] flex-shrink-0"
              style="background: linear-gradient(180deg, #C1F09C 0%, #B7F3A8 6.56%, #ACF5B5 12.19%, #9EF4D0 20.74%, #A4E5E0 29.06%, #9ED7D3 33.58%, #B0CEEA 37.98%, #BCBDED 41.83%, #CBA4EB 48.08%, #DE97CD 55.29%, #EB9FA2 61.06%, #F2A77B 65.85%, #F9AC55 70.67%, #FCA63B 77.88%, #FC9540 83.65%, #FC7B52 89.9%, #FA6263 93.27%, #F64377 100%);"
            ></div>
          <!-- 載入狀態 -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center h-60 lg:h-[480px]">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EBD8B2] mb-4 lg:h-24 lg:w-24 lg:mb-8"></div>
            <div class="text-[#EBD8B2] text-center">
              <div class="text-lg font-bold mb-2 lg:text-3xl lg:mb-4">{{ loadingMessage }}</div>
              <div class="text-sm lg:text-2xl">{{ loadingSubMessage }}</div>
            </div>
          </div>
          
          <!-- 錯誤狀態 -->
          <div v-else-if="error" class="flex flex-col items-center justify-center h-60 lg:h-[480px]">
            <div class="text-red-400 text-center">
              <div class="text-lg font-bold mb-2 lg:text-3xl lg:mb-4">生成失敗</div>
              <div class="text-sm mb-4 lg:text-2xl lg:mb-8">{{ error }}</div>
              <button
                @click="retryCheckStatus"
                class="px-4 py-2 text-[#333] rounded-md hover:shadow-lg transition-all duration-300 lg:px-8 lg:py-4 lg:text-2xl lg:rounded-xl"
                style="background: radial-gradient(50% 50% at 50% 50%, #FFF8E9 0%, #DEC799 100%); box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);"
              >
                重試
              </button>
            </div>
          </div>
          
          <!-- 結果內容 -->
          <div v-else-if="taskResult" class="space-y-6 relative lg:space-y-12">
            <!-- Header Logo -->
            <div class="flex justify-center">
              <img
                :src="imageUrls.resultHeader"
                class="h-16 object-contain mx-auto lg:h-32"
                alt="標準字"
              />
            </div>

            <!-- Images Section -->
            <div class="space-y-6">
              <!-- Original Image with Star -->
              <div class="relative">
                <!-- <img
                  :src="getTemplateImage(props.selectedTemplate)"
                  :alt="`模板圖片 - ${getTemplateName(props.selectedTemplate)}`"
                  class="w-full object-cover rounded-md"
                /> -->
                <img
                  :src="imageUrls.star"
                  class="absolute -left-4 -bottom-72 w-12 h-12 object-contain"
                  alt="星"
                />
              </div>

              <!-- Result Image with Crown -->
              <div v-if="generatedImages.length > 0">
                <div v-for="(image, index) in generatedImages" :key="index" class="mb-4 relative">
                  <!-- Crown positioned at top-right corner edge -->
                  <img
                    :src="imageUrls.crown"
                    class="absolute -right-4 -top-4 w-12 h-12 object-contain transform -rotate-[14.809deg] z-50 lg:w-24 lg:h-24 lg:-right-8 lg:-top-8"
                    alt="皇冠"
                  />
                  <img
                    class="w-full object-cover rounded-md"
                    :src="image"
                    :alt="`生成結果 ${index + 1}`"
                    @error="handleImageError"
                    @load="handleImageLoad"
                  />
                  <div v-if="imageLoadErrors[image]" class="text-center text-red-400 text-sm mt-2">
                    ⚠️ 圖片載入失敗，請檢查網路連線
                  </div>
                </div>
              </div>
              <div v-else class="w-full h-60 bg-black rounded-md flex items-center justify-center">
                <div class="text-[#EBD8B2] text-center">
                  <div class="text-lg font-bold mb-2">生成中...</div>
                  <div class="text-sm">請稍候，正在處理您的圖片</div>
                </div>
              </div>

               <!-- Bottom Logo and Credit -->
               <div class="flex flex-col items-center">
                 <img
                   :src="imageUrls.logo"
                   class="h-7 object-contain"
                   alt="0815"
                 />
                 <div class="text-center mt-4 text-[#EBD8B2] text-xs font-normal font-noto-sans-tc lg:mt-6">
                   此 AI 服務由創造智能支持，讓你一秒變主角
                 </div>
               </div>
            </div>
          </div>
          </div>

      </div>

      <!-- Usage Counter -->
      <div class="mt-8 mb-8 text-right" style="margin-bottom: unset;padding-right: 30px;">
        <div class="flex justify-end items-center">
          <UsageCounter v-if="!isPCMode" :currentCount="userUsage" :maxLimit="10" />
        </div>
      </div>

        <!-- Action Buttons -->
        <div class="self-end mt-8 w-full text-base font-bold text-white whitespace-nowrap rounded-md lg:text-3xl lg:mt-16">
          <div class="flex gap-3 mb-8 lg:gap-6 lg:mb-16">
            <!-- Regenerate/Restart Button -->
            <button
              class="flex-1 h-11 flex justify-center items-center rounded-md cursor-pointer hover:shadow-lg transition-all duration-300 lg:h-24 lg:text-3xl lg:rounded-xl"
              style="background: radial-gradient(50% 50% at 50% 50%, #FFF8E9 0%, #DEC799 100%); box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);"
              @click="isPCMode ? restart() : regenerate()"
            >
              <div class="font-noto-sans-tc text-base font-bold text-[#333] lg:text-3xl">
                {{ isPCMode ? '重新開始' : '重新生成' }}
              </div>
            </button>

            <!-- Download Button -->
            <button
              class="flex-1 h-11 flex justify-center items-center rounded-md cursor-pointer transition-all duration-300 lg:h-24 lg:text-3xl lg:rounded-xl"
              :class="
                taskResult && taskResult.status === 'completed' && !isDownloading
                  ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] hover:shadow-lg'
                  : 'bg-[#C7C7C7] cursor-not-allowed'
              "
              @click="isPCMode ? downloadToPhone() : downloadToOfficial()"
              :disabled="!taskResult || taskResult.status !== 'completed' || isDownloading"
            >
              <div v-if="isDownloading" class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#333] lg:h-8 lg:w-8"></div>
                <div class="font-noto-sans-tc text-base font-bold text-[#333] lg:text-3xl">
                  處理中...
                </div>
              </div>
              <div v-else class="font-noto-sans-tc text-base font-bold text-[#333] lg:text-3xl">
                {{ isPCMode ? '下載至手機' : '下載至官方帳號' }}
              </div>
            </button>
          </div>
        </div>

        <!-- Generation History Title (Hide in PC mode) -->
        <div v-if="!isPCMode"
          class="mt-9 text-base font-bold text-center text-[#EBD8B2] cursor-pointer hover:text-[#d4c29a] transition-colors lg:text-3xl"
          @click="showHistory = true"
        >
          圖片生成紀錄
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import FaceSwapHistory from './FaceSwapHistory.vue'
import UsageCounter from './UsageCounter.vue'
import QRCodeModal from './QRCodeModal.vue'
import { roadshowService } from '../../services/roadshowService.js'
import { imageUrls } from '@/config/imageUrls'
import { useScreenshot } from '../../composables/useScreenshot.js'

// Define props
const props = defineProps({
  taskId: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    default: ''
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
  }
});

// Define emits for parent component communication
const emit = defineEmits(['restart', 'back', 'regenerate', 'download'])

// State for showing history page
const showHistory = ref(false)

// 任務相關狀態
const isLoading = ref(false)
const error = ref(null)
const taskResult = ref(null)
const generatedImages = ref([])
const imageLoadErrors = ref({})

// 載入狀態訊息
const loadingMessage = ref('檢查任務狀態...')
const loadingSubMessage = ref('請稍候')

// 截圖相關狀態
const captureArea = ref(null)
const isDownloading = ref(false)

// QR Code modal state
const showQRCode = ref(false)
const qrCodeUrl = ref('')

// 使用截圖 composable
const { captureScreenshot, compressImage, downloadToLocal, smartUploadImage, sendViaLiff, showMessage } = useScreenshot()

// 監聽taskId變化
watch(() => props.taskId, (newTaskId) => {
  if (newTaskId) {
    checkTaskStatus()
  }
}, { immediate: true })

// 監聽selectedTemplate變化，處理顯示歷史的請求
watch(() => props.selectedTemplate, (newTemplate) => {
  if (newTemplate === 'show_history') {
    // 設置顯示歷史
    showHistory.value = true
  }
}, { immediate: true })

// 監聽 userUsage 變化
watch(() => props.userUsage, (newUsage, oldUsage) => {
  // 用戶使用量變化時的處理邏輯
}, { immediate: true })

// 檢查任務狀態
async function checkTaskStatus() {
  if (!props.taskId) {
    console.warn('⚠️ 沒有taskId，無法檢查狀態')
    return
  }
  
  try {
    isLoading.value = true
    error.value = null
    loadingMessage.value = '檢查任務狀態...'
    loadingSubMessage.value = '請稍候'
    
    const result = await roadshowService.checkTaskStatus(props.taskId)
    
    if (result && (result.success || result.status === 'completed' || result.status === 'pending' || result.status === 'processing')) {
      // 根據 API 返回的數據結構處理
      const taskData = result.data || result.result || result;
      taskResult.value = taskData;
      
      // 根據狀態處理
      handleTaskStatus(taskData);
    } else {
      error.value = result?.error?.message || '檢查任務狀態失敗';
      console.error('❌ 檢查任務狀態失敗:', result?.error);
    }
  } catch (err) {
    error.value = '網路錯誤，請檢查連線'
    console.error('❌ 檢查任務狀態時發生錯誤:', err)
  } finally {
    isLoading.value = false
  }
}

// 處理任務狀態
async function handleTaskStatus(data) {
  const status = data.status
  console.log(`📊 任務狀態: ${status}`)
  
  switch (status) {
    case 'pending':
      loadingMessage.value = '任務等待中'
      loadingSubMessage.value = '正在排隊處理...'
      // 延遲後再次檢查
      setTimeout(checkTaskStatus, 3000)
      break
      
    case 'processing':
      loadingMessage.value = '正在處理中'
      loadingSubMessage.value = '請稍候，正在生成您的頭像...'
      // 延遲後再次檢查
      setTimeout(checkTaskStatus, 2000)
      break
      
    case 'completed':
      loadingMessage.value = '生成完成！'
      loadingSubMessage.value = ''
      // 使用新的 API 處理生成的圖片，將生成出來的圖片用參數的方式帶入
      if (data.images && data.images.length > 0) {
        console.log('🖼️ 原始生成的圖片:', data.images)

        // 檢測是否為 ngrok HTTPS 環境，避免 Mixed Content 問題
        const isNgrokHttps = window.location.hostname.includes('ngrok') && window.location.protocol === 'https:';
        const config = window.endpoint || {};
        const enableImageProcessing = config.enableImageProcessing !== false;

        if (isNgrokHttps) {
          console.log('🔧 偵測到 ngrok HTTPS 環境，跳過圖片處理 API 以避免 Mixed Content 問題');
          console.log('📸 直接使用原始 AI 生成圖片');
          generatedImages.value = data.images;
        } else if (!enableImageProcessing) {
          console.log('🔧 圖片處理功能已停用，使用原始圖片');
          generatedImages.value = data.images;
        } else {
          // 使用新的 API 處理每張生成的圖片
          const processedImages = []
          for (const imageUrl of data.images) {
            try {
              // 從全局配置獲取圖片處理 API 設置
              const apiUrl = config.imageProcessApi || 'https://stg-api.fanpokka.ai/api/static-resource';
              const params = config.imageProcessParams || { scale: 2, format: 'jpg', quality: 90, width: 800, height: 600 };

              // 構建查詢參數
              const queryParams = new URLSearchParams();
              queryParams.append('url', imageUrl);
              if (params.scale) queryParams.append('scale', params.scale);
              if (params.format) queryParams.append('format', params.format);
              if (params.quality) queryParams.append('quality', params.quality);
              if (params.width) queryParams.append('width', params.width);
              if (params.height) queryParams.append('height', params.height);

              const processedImageUrl = `${apiUrl}?${queryParams.toString()}`;

              console.log('🔄 使用圖片處理 API:', processedImageUrl);
              console.log('⚙️ 使用配置參數:', params);
              processedImages.push(processedImageUrl);

            } catch (error) {
              console.error('❌ 處理圖片時發生錯誤:', error);
              // 如果處理失敗，使用原始圖片
              processedImages.push(imageUrl);
            }
          }

          // 更新生成的圖片為處理後的圖片
          generatedImages.value = processedImages
          console.log('🖼️ 處理後的圖片:', processedImages)
        }
      }
      break
      
    case 'failed':
      error.value = '任務處理失敗，請重新生成'
      console.error('❌ 任務處理失敗')
      break
      
    default:
      error.value = '未知的任務狀態'
      console.warn('❓ 未知的任務狀態:', status)
  }
}

// 重試檢查狀態
function retryCheckStatus() {
  // PC模式下返回拍照頁，LINE LIFF模式下返回上傳頁
  if (props.isPCMode) {
    // PC模式：返回拍照頁
    emit('back')
  } else {
    // LINE LIFF模式：返回上傳頁
    emit('back')
  }
}

// Handle regenerate button click
function regenerate() {
  console.log('🔄 重新生成')
  emit('regenerate')
}

// Handle restart for PC mode
function restart() {
  console.log('🔄 重新開始')
  emit('restart')
}

// Handle download to phone (PC mode - show QR code)
async function downloadToPhone() {
  console.log('📱 下載至手機')

  if (isDownloading.value || !taskResult.value || !generatedImages.value.length) return

  isDownloading.value = true

  try {
    console.log('📥 開始截圖上傳流程')

    // Capture screenshot
    const canvas = await captureScreenshot(captureArea.value)
    console.log('✅ 截圖完成')

    // Convert to blob (PC 模式)
    const blob = await compressImage(canvas, true)
    console.log('✅ 圖片處理完成')

    // Upload image to get URL
    const filename = `faceswap-result-${props.userId || 'user'}-${Date.now()}.png`;
    const imageUrl = await smartUploadImage(blob, props.userId, filename)
    console.log('✅ 圖片上傳完成:', imageUrl)

    // Set QR code URL and show modal
    qrCodeUrl.value = imageUrl
    showQRCode.value = true

    showMessage('請掃描 QR Code 下載圖片', 'success')
  } catch (error) {
    console.error('❌ 下載至手機失敗:', error)
    showMessage('處理失敗，請重試', 'error')
  } finally {
    isDownloading.value = false
  }
}

// Handle regenerate from history
function handleHistoryRegenerate() {
  console.log('🔄 從歷史頁面重新生成')
  // 關閉歷史頁面
  showHistory.value = false
  // 發送重新生成事件到父組件
  emit('regenerate')
}

// Handle download to official account button click
async function downloadToOfficial() {
  if (!taskResult.value || taskResult.value.status !== 'completed') {
    console.warn('⚠️ 任務尚未完成，無法下載')
    showMessage('任務尚未完成，無法下載', 'error')
    return
  }

  if (isDownloading.value) {
    console.log('⏳ 正在處理中，請稍候...')
    return
  }

  try {
    isDownloading.value = true
    console.log('📥 開始下載至官方帳號流程')
    
    // 更新載入狀態
    loadingMessage.value = '正在截圖...'
    loadingSubMessage.value = '請稍候'
    
    // 1. 截圖
    const canvas = await captureScreenshot(captureArea.value)
    console.log('✅ 截圖完成')
    
    // 2. 轉換為 Blob
    loadingMessage.value = '正在處理圖片...'
    const blob = await compressImage(canvas, false)
    console.log('✅ 圖片處理完成')
    
    // 本地測試：先下載到本機確認圖片
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🧪 本地測試模式：下載截圖到本機')
      downloadToLocal(blob, 'faceswap-result')
      showMessage('截圖已下載到本機，請檢查圖片品質', 'success')
      return
    }

    // 3. 上傳到伺服器
    loadingMessage.value = '正在上傳圖片...'
    const filename = `faceswap-result-${props.userId || 'user'}-${Date.now()}.png`;
    const imageUrl = await smartUploadImage(blob, props.userId, filename)
    console.log('✅ 圖片上傳完成:', imageUrl)

    // 5. 透過 LIFF 發送
    loadingMessage.value = '正在發送到官方帳號...'
    await sendViaLiff(imageUrl)
    console.log('✅ 發送完成')
    
    showMessage('圖片已成功發送到官方帳號！', 'success')
    
  } catch (error) {
    console.error('❌ 下載流程失敗:', error)
    showMessage(`下載失敗: ${error.message}`, 'error')
  } finally {
    isDownloading.value = false
    loadingMessage.value = '檢查任務狀態...'
    loadingSubMessage.value = '請稍候'
  }
}


// 組件掛載時檢查狀態
onMounted(() => {
  if (props.taskId) {
    console.log('🚀 組件掛載，開始檢查任務狀態:', props.taskId)
    checkTaskStatus()
  }
})

// 獲取模板圖片URL
function getTemplateImage(templateId) {
  // 根據模板 ID 返回對應的圖片
  const imageMap = {
    'play': imageUrls.play,   // 綜藝玩很大
    'wife': imageUrls.wife,   // 犀利人妻
    'love': imageUrls.love,   // 命中註定我愛你
    'super': imageUrls.super  // 超級夜總會
  };
  
  return imageMap[templateId] || imageUrls.play;
}

// 獲取模板名稱
function getTemplateName(templateId) {
  const nameMap = {
    'play': '綜藝玩很大',
    'wife': '犀利人妻',
    'love': '命中註定我愛你',
    'super': '超級夜總會'
  };
  
  return nameMap[templateId] || '預設模板';
}



// 處理圖片載入錯誤
function handleImageError(event) {
  const imageUrl = event.target.src;
  console.error('❌ 圖片載入失敗:', imageUrl);
  imageLoadErrors.value[imageUrl] = true;
}

// 處理圖片載入成功
function handleImageLoad(event) {
  const imageUrl = event.target.src;
  console.log('✅ 圖片載入成功:', imageUrl);
  if (imageLoadErrors.value[imageUrl]) {
    delete imageLoadErrors.value[imageUrl];
  }
}

// 組件掛載時的調試
onMounted(() => {
  console.log('🚀 FaceSwapResult 組件已掛載')
})
</script>

