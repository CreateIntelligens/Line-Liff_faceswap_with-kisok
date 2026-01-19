<template>
  <div
    class="relative min-h-screen w-full px-5"
    :style="{ backgroundImage: `url(${imageUrls.pageBg})`, backgroundSize: '100% 100%', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat' }"
    style="pointer-events: auto; position: relative; z-index: 1;"
  >
    <!-- 上方主標題 -->
    <div class="w-full flex justify-center pt-8 pb-4">
      <img
        :src="imageUrls.maintitle"
        class="w-full max-w-[320px] h-auto object-contain"
        alt="大同寶寶賀新年"
      />
    </div>

    <!-- 中間主要內容：提示圖 + 輸入框 + 按鈕 -->
    <div class="flex flex-col items-center pt-8 pb-16" style="pointer-events: auto; position: relative; z-index: 10;">
      <!-- 上方提示圖：請輸入您的 Email -->
      <div class="w-full flex justify-center mb-6">
        <img
          :src="imageUrls.placeemail"
          class="w-full max-w-[320px] h-6 object-contain"
          alt="請輸入您的 Email"
        />
      </div>

      <!-- Email 輸入框 -->
      <div class="w-full max-w-[320px] mb-8" style="pointer-events: auto; position: relative; z-index: 10;">
        <input
          v-model="email"
          type="email"
          placeholder="請輸入 Email"
          class="w-full px-4 py-3 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A90205] border-2 border-gray-300"
          style="touch-action: manipulation; cursor: text; pointer-events: auto !important; position: relative; z-index: 20;"
          @click.stop
          @mousedown.stop
          @touchstart.stop
          @keyup.enter="handleNext"
        />
        <!-- 錯誤訊息 -->
        <div v-if="errorMessage" class="mt-2 text-sm text-red-500 text-center font-bold">
          {{ errorMessage }}
        </div>
      </div>

      <!-- 下一步按鈕 -->
      <div class="w-full max-w-[320px] mt-4" style="pointer-events: auto; position: relative; z-index: 10;">
        <button
          type="button"
          @click.stop="handleNext"
          @mousedown.stop
          @touchstart.stop
          @touchend.prevent.stop="handleNext"
          :disabled="!isEmailValid || isSubmitting"
          :class="[
            isEmailValid && !isSubmitting
              ? 'text-[#FBEFC2] cursor-pointer hover:bg-[#FF7824] active:bg-[#FF7824]'
              : 'text-[#FBEFC2] cursor-not-allowed'
          ]"
          class="w-full h-11 rounded-md font-bold whitespace-nowrap transition-all duration-300 text-center flex items-center justify-center relative"
          :style="(isEmailValid && !isSubmitting) ? 'background-color: #FF7824; touch-action: manipulation; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;' : 'background-color: #D84729; touch-action: manipulation; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;'"
        >
          <img 
            src="/resources/images/coin_icon.png" 
            alt=""
            class="absolute pointer-events-none"
            style="top: 0; right: 0; width: 42px; height: 42px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;"
          />
          {{ isSubmitting ? '處理中...' : '下一步' }}
        </button>
      </div>

      <!-- Email 使用說明圖：放在按鈕下方 -->
      <div class="w-full flex justify-center mt-20">
        <img
          :src="imageUrls.coupon"
          class="w-full max-w-[360px] h-20 object-contain"
          alt="本 Email 僅限用於寄送優惠碼，未經同意不作任何其他用途"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { imageUrls } from '@/config/imageUrls'

const emit = defineEmits(['next', 'back'])

const email = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

// 恢復 Email 的函數
function restoreEmail() {
  try {
    const savedEmail = sessionStorage.getItem('faceswap_email')
    if (savedEmail && savedEmail.trim() !== '') {
      email.value = savedEmail.trim()
      console.log('📧 從 sessionStorage 恢復 Email:', email.value)
    }
  } catch (error) {
    console.error('❌ 恢復 Email 失敗:', error)
  }
}

// 組件掛載時從 sessionStorage 讀取已保存的 Email
onMounted(() => {
  restoreEmail()
  
  // 監聽頁面可見性變化，當頁面重新可見時恢復 email
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('📧 頁面重新可見，恢復 Email')
      restoreEmail()
    }
  }
  
  // 監聽 storage 事件（當其他標籤頁修改 sessionStorage 時）
  const handleStorageChange = (e) => {
    if (e.key === 'faceswap_email' && e.newValue) {
      console.log('📧 檢測到 sessionStorage 變化，恢復 Email')
      restoreEmail()
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('storage', handleStorageChange)
  
  // 保存清理函數
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('storage', handleStorageChange)
  })
})

// Email 格式驗證
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isEmailValid = computed(() => {
  return email.value.trim() !== '' && emailRegex.test(email.value.trim())
})

// 處理下一步
function handleNext() {
  if (!isEmailValid.value || isSubmitting.value) return

  // 清除之前的錯誤訊息
  errorMessage.value = ''

  // 驗證 email 格式
  if (!emailRegex.test(email.value.trim())) {
    errorMessage.value = '請輸入有效的 Email 格式'
    return
  }

  isSubmitting.value = true

  // 將 email 儲存到 sessionStorage（暫時，等後端 API 確認後再修改）
  sessionStorage.setItem('faceswap_email', email.value.trim())

  // 觸發下一步事件
  setTimeout(() => {
    emit('next', { email: email.value.trim() })
    isSubmitting.value = false
  }, 300)
}
</script>

<style scoped>
/* 確保背景圖片正確顯示 */
.relative {
  position: relative;
}
</style>
