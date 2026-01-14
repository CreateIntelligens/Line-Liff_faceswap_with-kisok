<template>
  <div class="relative min-h-screen w-full flex flex-col" :style="{ backgroundImage: `url(${imageUrls.pageBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }">
    <!-- Header -->
    <div class="py-4 flex justify-center items-center w-full">
      <img
        :src="imageUrls.header"
        class="h-11 object-contain"
        alt="一秒變成大明星"
      />
    </div>
    
    <!-- 分隔線 -->
    <div class="w-full border-t border-gray-400 opacity-30 mb-6"></div>

    <!-- Main Content -->
    <div class="px-6 py-8 flex-1 flex flex-col items-center">
      <!-- 圖片 with 訊息覆蓋 -->
      <div class="w-full max-w-[335px] mb-8 relative z-20">
        <!-- 背景圖片 - 顯示 prize.png -->
        <img
          :src="imageUrls.prize"
          alt="表單頁面"
          class="w-full object-contain rounded-lg shadow-lg"
        />
      </div>
          
      <!-- 表單 -->
      <div class="w-full max-w-[335px] space-y-6 relative z-30" style="position: relative;">
        <!-- 真實姓名 -->
        <div class="relative z-40">
          <label class="block text-sm mb-2 text-[#A90205] font-bold">
            真實姓名<span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="請輸入真實姓名"
            class="w-full px-4 py-3 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e91e63] relative z-50"
            style="touch-action: manipulation; position: relative;"
            required
          />
        </div>

        <!-- 聯絡電話 -->
        <div class="relative z-40">
          <label class="block text-sm mb-2 text-[#A90205] font-bold">
            聯絡電話<span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.phone"
            type="tel"
            placeholder="請輸入聯絡電話"
            class="w-full px-4 py-3 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e91e63] relative z-50"
            style="touch-action: manipulation; position: relative;"
            required
          />
        </div>

        <!-- Email -->
        <div class="relative z-40">
          <label class="block text-sm mb-2 text-[#A90205] font-bold">
            Email
          </label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="請輸入 Email"
            class="w-full px-4 py-3 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e91e63] relative z-50"
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
            'py-3.5 w-full rounded-md font-bold whitespace-nowrap transition-all duration-300 text-center flex items-center justify-center relative z-50',
            isFormValid && !isSubmitting 
              ? 'text-[#FBEFC2] cursor-pointer hover:bg-[#FF7824] active:bg-[#FF7824]' 
              : 'text-[#FBEFC2] cursor-not-allowed'
          ]"
          :style="isFormValid && !isSubmitting ? 'background-color: #FF7824; touch-action: manipulation; position: relative;' : 'background-color: #D84729; touch-action: manipulation; position: relative;'"
        >
          {{ isSubmitting ? '送出中...' : '送出' }}
        </button>

        <!-- 錯誤訊息 -->
        <div v-if="errorMessage" class="text-sm text-red-400 text-center font-bold">
          {{ errorMessage }}
        </div>

        <!-- 成功訊息 -->
        <div v-if="successMessage" class="text-sm text-[#A90205] text-center font-bold">
          {{ successMessage }}
        </div>
      </div>

      <!-- 底部說明文字 -->
      <div class="mt-8 text-xs px-6 text-gray-300 text-center leading-relaxed relative">
        此個人資料會提供給PP石墨烯作為<br>
        此次抽獎活動使用與後續行銷推廣
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { imageUrls } from '@/config/imageUrls'
import { roadshowService } from '../../services/roadshowService.js'

// 表單數據
const formData = ref({
  name: '',
  phone: '',
  email: ''
})

// UI 狀態
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 表單驗證
const isFormValid = computed(() => {
  return formData.value.name.trim() !== '' && 
         formData.value.phone.trim() !== '' &&
         /^09\d{8}$/.test(formData.value.phone.trim())
})

// 處理表單送出
async function handleSubmit() {
  if (!isFormValid.value || isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''
    
    // 調用後端 API 提交表單
    const response = await roadshowService.saveForm({
      name: formData.value.name,
      phone: formData.value.phone,
      email: formData.value.email
    })
    
    if (response.success) {
      // 使用 API 返回的訊息或預設訊息
      const message = response.data?.message || '表單提交成功！'
      successMessage.value = `✅ ${message}`
      
      // 3秒後可以關閉或重新整理
      setTimeout(() => {
        // 可以選擇關閉視窗或顯示其他訊息
        window.close()
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

