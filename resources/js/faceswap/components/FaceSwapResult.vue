<template>
  <div class="relative bg-black min-h-screen w-full flex flex-col">
      <!-- Header -->
    <div :class="isKioskMode ? 'py-8' : 'py-4'" class="flex justify-center items-center w-full">
      <img
        :src="imageUrls.header"
        :class="isKioskMode ? 'h-48' : 'h-11'"
        class="object-contain"
        alt="一秒變成大明星"
      />
    </div>
    
    <!-- 分隔線 (僅手機版) -->
    <div v-if="!isKioskMode" class="w-full border-t border-[#EBD8B2] opacity-30 mb-6"></div>

    <!-- Main Content -->
    <div :class="isKioskMode ? 'px-16 py-12 relative' : 'px-6 py-8'" class="flex-1 flex flex-col items-center">
      <!-- Decorative Bars (Kiosk only) -->
      <div v-if="isKioskMode" class="absolute left-2 top-[40%] transform -translate-y-1/2 w-[500px] h-5 bg-gradient-to-r from-[#F773AF] via-[#AC86EB] to-[#FAAC95] -rotate-90 origin-left pointer-events-none z-10"></div>
      <div v-if="isKioskMode" class="absolute right-2 top-[40%] transform -translate-y-1/2 w-[500px] h-5 bg-gradient-to-r from-[#F773AF] via-[#AC86EB] to-[#FAAC95] rotate-90 origin-right pointer-events-none z-10"></div>

      <!-- 載入中狀態 -->
      <div v-if="isLoading" :class="isKioskMode ? 'py-12' : 'py-20'" class="flex flex-col items-center justify-center">
        <!-- Kiosk: 顯示 load.png 圖片 -->
        <img 
          v-if="isKioskMode"
          :src="imageUrls.load"
          alt="載入中"
          class="w-[700px] h-[933px] object-contain mb-8"
        />
        <!-- 載入中文字 -->
        <p :class="isKioskMode ? 'text-3xl' : 'text-sm'" class="text-[#EBD8B2]">圖片生成中，請稍候...</p>
    </div>

      <!-- 生成的圖片 -->
      <div v-else :class="isKioskMode ? 'w-[900px] mb-12' : 'w-full max-w-[335px] mb-8'" class="relative z-20">
        <!-- 背景圖片 - 始終顯示固定的 result.png -->
        <img
          :src="imageUrls.result"
          alt="生成的圖片"
          :class="isKioskMode ? 'w-[900px]' : 'w-full'"
          class="object-contain rounded-lg shadow-lg"
        />
      </div>
          
      <!-- 表單 -->
      <div v-if="!isLoading" :class="isKioskMode ? 'w-[700px] space-y-8' : 'w-full max-w-[335px] space-y-6'" class="relative z-30" style="position: relative;">
        <!-- 真實姓名 (僅手機版) -->
        <div v-if="!isKioskMode" class="relative z-40">
          <label :class="isKioskMode ? 'text-3xl mb-4' : 'text-sm mb-2'" class="block text-[#EBD8B2] font-bold">
            真實姓名<span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="請輸入真實姓名"
            :class="isKioskMode ? 'px-10 py-8 text-3xl' : 'px-4 py-3'"
            class="w-full rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e91e63] relative z-50"
            style="touch-action: manipulation; position: relative;"
            required
              />
            </div>

        <!-- 聯絡電話 -->
        <div class="relative z-40">
          <label :class="isKioskMode ? 'text-3xl mb-4' : 'text-sm mb-2'" class="block text-[#EBD8B2] font-bold">
            聯絡電話<span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.phone"
            type="tel"
            placeholder="請輸入聯絡電話"
            :class="isKioskMode ? 'px-10 py-8 text-3xl' : 'px-4 py-3'"
            class="w-full rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e91e63] relative z-50"
            style="touch-action: manipulation; position: relative;"
            required
                />
              </div>

        <!-- Email (僅手機版) -->
        <div v-if="!isKioskMode" class="relative z-40">
          <label :class="isKioskMode ? 'text-3xl mb-4' : 'text-sm mb-2'" class="block text-[#EBD8B2] font-bold">
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
              ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] hover:shadow-lg text-gray-800 cursor-pointer' 
              : 'bg-[#C7C7C7] text-white cursor-not-allowed'
          ]"
          class="w-full rounded-md font-bold whitespace-nowrap transition-all duration-300 text-center flex items-center justify-center relative z-50"
          style="touch-action: manipulation; position: relative;"
        >
          {{ isSubmitting ? '送出中...' : '送出' }}
        </button>

        <!-- 錯誤訊息 -->
        <div v-if="errorMessage" :class="isKioskMode ? 'text-3xl' : 'text-sm'" class="text-red-400 text-center font-bold">
          {{ errorMessage }}
      </div>

        <!-- 成功訊息 -->
        <div v-if="successMessage" :class="isKioskMode ? 'text-3xl' : 'text-sm'" class="text-[#EBD8B2] text-center font-bold">
          {{ successMessage }}
        </div>
      </div>

      <!-- 底部說明文字 -->
      <div v-if="!isLoading" :class="isKioskMode ? 'mt-12 text-2xl px-16 z-20' : 'mt-8 text-xs px-6'" class="text-[#EBD8B2] text-center leading-relaxed relative">
        此個人資料會提供給PP石墨烯作為<br>
        此次抽獎活動使用與後續行銷推廣
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { imageUrls } from '@/config/imageUrls'
import { roadshowService } from '../../services/roadshowService.js'

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

// 表單數據
const formData = ref({
  name: '',
  phone: '',
  email: ''
})

// 生成的圖片 URL
const generatedImageUrl = ref('')

// UI 狀態
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
// 初始不顯示 loading，等檢查任務狀態後再決定
const isLoading = ref(false)

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
  
  await checkTaskStatus()
})

// 檢查任務狀態
async function checkTaskStatus() {
  if (!props.taskId) {
    errorMessage.value = '缺少任務 ID'
    isLoading.value = false
    return
  }
  
  try {
    errorMessage.value = ''
    
    const result = await roadshowService.checkTaskStatus(props.taskId)
    
    // 檢查是否為錯誤響應
    if (result && result.success === false && result.error) {
      errorMessage.value = result.error.message || '檢查任務狀態失敗'
      isLoading.value = false
      return
    }
    
    // 嘗試從不同層級提取任務數據
    let taskData = null
    if (result) {
      taskData = result.data?.result || result.result || result.data || result
      
      // 處理任務狀態
      if (taskData.status === 'completed' && taskData.images && taskData.images.length > 0) {
        generatedImageUrl.value = taskData.images[0]
        isLoading.value = false
        return
      } else if (taskData.status === 'failed') {
        const errorMsg = taskData.error_message || taskData.error || taskData.message || '任務處理失敗'
        errorMessage.value = errorMsg
        isLoading.value = false
        return
      } else if (taskData.status === 'pending' || taskData.status === 'processing') {
        // 還在處理中，顯示 loading 並在 3 秒後重試
        isLoading.value = true
        setTimeout(checkTaskStatus, 3000)
        return
      }
    } else {
      errorMessage.value = '無法獲取任務狀態'
      isLoading.value = false
      return
    }
  } catch (err) {
    errorMessage.value = '網路錯誤，請檢查連線'
    isLoading.value = false
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
      smsParams = {
        phone: formData.value.phone,
        img_url: generatedImageUrl.value,
        fromKiosk: true
      }
    } else {
      // 手機版：傳送所有欄位
      smsParams = {
        name: formData.value.name,
        phone: formData.value.phone,
        email: formData.value.email,
        img_url: generatedImageUrl.value
      }
    }
    
    // 調用後端 API 發送簡訊
    const response = await roadshowService.sendSMS(smsParams)
    
    if (response.success) {
      // 使用 API 返回的訊息或預設訊息
      const message = response.data?.message || '簡訊發送成功'
      successMessage.value = `✅ ${message}`
      
      // 3秒後回到首頁
      setTimeout(() => {
        emit('restart')
      }, 3000)
    } else {
      // API 返回錯誤
      const errorMsg = response.error?.message || '送出失敗，請稍後再試'
      errorMessage.value = errorMsg
    }
    
  } catch (error) {
    errorMessage.value = '送出失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}
</script>
