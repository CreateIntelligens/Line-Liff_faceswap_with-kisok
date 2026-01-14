<template>
  <div
    class="relative min-h-screen w-full px-5"
    :style="{ backgroundImage: `url(${imageUrls.pageBg})`, backgroundSize: 'cover', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat' }"
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
    <div class="flex flex-col items-center pt-8 pb-16">
      <!-- 上方提示圖：請輸入您的 Email -->
      <div class="w-full flex justify-center mb-6">
        <img
          :src="imageUrls.placeemail"
          class="w-full max-w-[320px] h-6 object-contain"
          alt="請輸入您的 Email"
        />
      </div>

      <!-- Email 輸入框 -->
      <div class="w-full max-w-[320px] mb-8">
        <input
          v-model="email"
          type="email"
          placeholder="請輸入 Email"
          class="w-full px-4 py-3 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A90205] border-2 border-gray-300"
          style="touch-action: manipulation;"
          @keyup.enter="handleNext"
        />
        <!-- 錯誤訊息 -->
        <div v-if="errorMessage" class="mt-2 text-sm text-red-500 text-center font-bold">
          {{ errorMessage }}
        </div>
      </div>

      <!-- 下一步按鈕 -->
      <button
        type="button"
        @click="handleNext"
        @touchend.prevent="handleNext"
        :disabled="!isEmailValid || isSubmitting"
        :class="[
          isEmailValid && !isSubmitting
            ? 'text-[#FBEFC2] cursor-pointer hover:bg-[#FF7824] active:bg-[#FF7824]'
            : 'text-[#FBEFC2] cursor-not-allowed'
        ]"
        class="w-full max-w-[320px] h-11 mt-4 rounded-md font-bold whitespace-nowrap transition-all duration-300 text-center flex items-center justify-center"
        :style="(isEmailValid && !isSubmitting) ? 'background-color: #FF7824; touch-action: manipulation;' : 'background-color: #D84729; touch-action: manipulation;'"
      >
        {{ isSubmitting ? '處理中...' : '下一步' }}
      </button>

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
import { ref, computed } from 'vue'
import { imageUrls } from '@/config/imageUrls'

const emit = defineEmits(['next', 'back'])

const email = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

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
