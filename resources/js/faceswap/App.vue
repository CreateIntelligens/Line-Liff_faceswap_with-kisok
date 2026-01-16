<template>
  <!-- 表單頁面（獨立頁面，不依賴裝置模式） -->
  <FormPage v-if="showFormPage" />
  
  <!-- 根據裝置模式切換不同的容器樣式 -->
  <div v-else :class="appContainerClass">
    <!-- ==================== Mobile 模式 ==================== -->
    <template v-if="!isKioskMode">
      <!-- Mobile 模式：外層黑色全螢幕容器，內層固定 414px 寬度 -->
      <div class="mobile-wrapper">
        <div class="mobile-content">
          <!-- Face Swap Homepage -->
          <FaceSwapHomepage
            v-if="currentStep === 'faceswap-home'"
            @enter-face-swap="enterFaceSwap"
          />

          <!-- Face Swap Email Input (Mobile only) -->
          <FaceSwapEmailInput
            v-if="currentStep === 'email-input'"
            @next="handleEmailSubmit"
            @back="goBack"
          />

          <!-- Face Swap Template Selection -->
          <FaceSwapTemplateSelection
            v-if="currentStep === 'template-selection'"
            :userUsage="userUsage"
            :userId="userId"
            :isPCMode="isPCMode"
            @next-step="handleTemplateSelection"
            @back="goBack"
          />

          <!-- Face Swap Upload (Mobile) -->
          <FaceSwapUpload
            v-if="currentStep === 'upload'"
            :selectedTemplate="selectedTemplate"
            :userUsage="userUsage"
            :userId="userId"
            :isPCMode="isPCMode"
            @back="goBack"
            @generate="handleGenerate"
            @showHistory="handleShowHistory"
          />

          <!-- Face Swap Result -->
          <FaceSwapResult
            v-if="currentStep === 'result'"
            :taskId="taskId"
            :userId="userId"
            :selectedTemplate="selectedTemplate"
            :userUsage="userUsage"
            :isPCMode="isPCMode"
            @back="goBack"
            @regenerate="handleRegenerate"
            @download="handleDownload"
            @restart="handleRestart"
          />
        </div>
      </div>
    </template>

    <!-- ==================== Kiosk 模式 (1080x1920) ==================== -->
    <template v-else>
      <!-- Kiosk Homepage -->
      <KioskHomepage
        v-if="currentStep === 'faceswap-home'"
        @enter-face-swap="enterFaceSwap"
      />

      <!-- Kiosk Template Selection -->
      <FaceSwapTemplateSelection
        v-if="currentStep === 'template-selection'"
        :userUsage="userUsage"
        :userId="userId"
        :isPCMode="isPCMode"
        :isKioskMode="isKioskMode"
        @next-step="handleTemplateSelection"
        @back="goBack"
      />

      <!-- Kiosk Character Selection - 已廢棄,不再使用 -->
      <!-- <FaceSwapCharacterSelection
        v-if="currentStep === 'character-selection'"
        :selectedTemplate="selectedTemplate"
        :isKioskMode="isKioskMode"
        @next-step="handleCharacterSelection"
        @back="goBack"
      /> -->

      <!-- Kiosk Camera Capture (串流服務) -->
      <FaceSwapCameraCapture
        v-if="currentStep === 'upload'"
        :selectedTemplate="selectedTemplate"
        :selectedCharacter="selectedCharacter"
        :isKioskMode="isKioskMode"
        @captured="handleCameraCapture"
        @generate="handleCameraGenerate"
        @back="goBack"
      />

      <!-- Kiosk Result -->
      <FaceSwapResult
        v-if="currentStep === 'result'"
        :taskId="taskId"
        :userId="userId"
        :selectedTemplate="selectedTemplate"
        :userUsage="userUsage"
        :isPCMode="isPCMode"
        :isKioskMode="true"
        @back="goBack"
        @regenerate="handleRegenerate"
        @download="handleDownload"
        @restart="handleRestart"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount, nextTick } from 'vue'
import FaceSwapHomepage from './components/FaceSwapHomepage.vue'
import FaceSwapEmailInput from './components/FaceSwapEmailInput.vue'
import FaceSwapTemplateSelection from './components/FaceSwapTemplateSelection.vue'
import FaceSwapCharacterSelection from './components/FaceSwapCharacterSelection.vue'
import FaceSwapUpload from './components/FaceSwapUpload.vue'
import FaceSwapCameraCapture from './components/FaceSwapCameraCapture.vue'
import FaceSwapResult from './components/FaceSwapResult.vue'
import FormPage from './components/FormPage.vue'
import { roadshowService } from '../services/roadshowService.js'
import { deviceService } from '../services/deviceService.js'

// Kiosk 專用組件
import KioskHomepage from './components/kiosk/KioskHomepage.vue'
// import KioskTemplateSelection from './components/kiosk/KioskTemplateSelection.vue'
// import KioskCameraCapture from './components/kiosk/KioskCameraCapture.vue'
// import KioskResult from './components/kiosk/KioskResult.vue'

// 狀態
const taskId = ref('')
const userId = ref('') // 等待裝置服務初始化
const currentStep = ref('faceswap-home') // 初始狀態設定為換臉首頁
const selectedTemplate = ref('')
const selectedCharacter = ref('') // Kiosk 模式下選擇的角色
const isInitialized = ref(false)
const userUsage = ref(0) // 用戶已生成的圖片數量

// 檢查 URL 參數，如果 to_form=true 則顯示表單頁面
const urlParams = new URLSearchParams(window.location.search)
const toForm = urlParams.get('to_form')
// 支援多種格式：true, True, TRUE, 1
const showFormPage = ref(toForm === 'true' || toForm === 'True' || toForm === 'TRUE' || toForm === '1')

// 調試日誌 - 總是輸出，方便診斷
console.log('🔍 URL 參數檢查:')
console.log('  - 完整 URL:', window.location.href)
console.log('  - 完整 search:', window.location.search)
console.log('  - to_form 參數值:', toForm)
console.log('  - showFormPage 值:', showFormPage.value)
if (toForm) {
  console.log('✅ 檢測到 to_form 參數，將顯示表單頁面')
} else {
  console.log('ℹ️ 未檢測到 to_form 參數，將顯示正常頁面')
}

// 裝置模式: 'kiosk' | 'mobile'
const deviceMode = ref('mobile')

// 保持向後兼容，isPCMode 現在改為 isKioskMode
const isKioskMode = ref(false)
// 保留 isPCMode 作為 isKioskMode 的別名，讓現有組件能正常運作
const isPCMode = isKioskMode

// 根據裝置模式計算容器樣式
const appContainerClass = computed(() => {
  if (isKioskMode.value) {
    // Kiosk 模式：固定 1080x1920 尺寸，置中顯示
    return 'app app-kiosk'
  }
  // Mobile 模式：響應式全螢幕
  return 'app app-mobile'
})

// 裝置初始化函數
function initializeDevice() {
  console.log('🔧 開始初始化裝置服務...')
  
  // 使用裝置服務初始化
  const result = deviceService.initialize({ userId })
  
  if (result.success) {
    deviceMode.value = result.deviceMode
    isKioskMode.value = result.isKiosk
    console.log('✅ 裝置服務初始化完成')
    console.log('  - 裝置模式:', deviceMode.value)
    console.log('  - 用戶 ID:', userId.value)
  }
}

// 偵測裝置模式（保留此函數供組件使用）
function detectDeviceMode() {
  return deviceService.detectDeviceMode()
}

// 主要初始化函數
async function initializeApp() {
  console.log('=== 換臉應用程序初始化開始 ===')

  try {
    // 如果顯示表單頁面，直接返回，不執行其他初始化
    if (showFormPage.value) {
      console.log('📋 表單頁面模式，跳過其他初始化')
      isInitialized.value = true
      console.log('=== 表單模式初始化完成 ===')
      return
    }
    
    // 檢查 URL 參數，用於測試/預覽特定步驟
    const urlParams = new URLSearchParams(window.location.search)
    const stepParam = urlParams.get('step')
    const testTaskId = urlParams.get('taskId')
    
    // 重置所有狀態，確保重整後是乾淨的狀態
    currentStep.value = 'faceswap-home'
    selectedTemplate.value = ''
    taskId.value = ''
    
    // 如果有 URL 參數，設置對應的步驟（用於測試/預覽）
    if (stepParam) {
      console.log('🔍 檢測到 URL 參數 step:', stepParam)
      
      const validSteps = ['faceswap-home', 'email-input', 'template-selection', 'character-selection', 'upload', 'result']
      if (validSteps.includes(stepParam)) {
        currentStep.value = stepParam
        
        // 如果是結果頁，需要設置測試用的 taskId 和模板
        if (stepParam === 'result') {
          taskId.value = testTaskId || 'test-task-preview'
          selectedTemplate.value = 'play' // 測試用預設模板
          console.log('📋 測試模式：結果頁，taskId:', taskId.value)
          
          // 測試模式下直接返回，不繼續後續初始化
          isInitialized.value = true
          console.log('=== 測試模式初始化完成 ===')
          return
        }
      }
    }
    
    // 檢查用戶 ID
    if (!userId.value) {
      console.log('用戶 ID 未設置，顯示臉部交換首頁')
      return
    }
    
    // 查詢歷史 avatars（僅用於更新用戶使用量，不改變頁面狀態）
    if (userId.value) {
      try {
        console.log(`查詢用戶 ${userId.value} 的歷史 avatars`)
        const data = await roadshowService.getUserHistory(userId.value)
        
        // 使用與FaceSwapHistory相同的相容性檢查
        let avatars = [];
        
        if (Array.isArray(data)) {
          // 如果直接返回陣列
          avatars = data;
        } else if (data && typeof data === 'object') {
          // 如果是物件格式
          avatars = data.result?.avatars || data.data?.avatars || data.avatars || [];
        }
        
        // 更新用戶使用量
        userUsage.value = avatars.length
        console.log('📊 用戶使用量已更新:', userUsage.value)
        
        // 重整後總是回到首頁，不自動跳轉到結果頁面
        console.log('重整後回到首頁')
      } catch (e) {
        console.error('查詢歷史 avatars 時發生錯誤:', e)
        // 錯誤時保持首頁狀態
      }
    }
  } catch (error) {
    console.error('初始化過程發生錯誤:', error)
    // 錯誤時保持首頁狀態
  }
  
  isInitialized.value = true
  console.log('=== 換臉應用程序初始化完成 ===')
}

// 添加一個單獨的函數來刷新用戶使用量
async function refreshUserUsage() {
  try {
    const data = await roadshowService.getUserHistory(userId.value)
    
    // 使用與FaceSwapHistory相同的相容性檢查
    let avatars = [];
    
    if (Array.isArray(data)) {
      // 如果直接返回陣列
      avatars = data;
    } else if (data && typeof data === 'object') {
      // 如果是物件格式
      avatars = data.result?.avatars || data.data?.avatars || data.avatars || [];
    }
    
    // 更新用戶使用量
    userUsage.value = avatars.length
    return avatars.length
  } catch (error) {
    console.error('❌ 刷新用戶使用量失敗:', error)
    return 0
  }
}

// 在掛載前執行初始化
onBeforeMount(async () => {
  initializeDevice() // 先初始化裝置服務
  await initializeApp() // 再初始化應用程序
})

// 組件掛載後的額外處理
onMounted(async () => {
  console.log('Vue 組件已掛載，應用當前狀態:', {
    currentStep: currentStep.value,
    userId: userId.value,
    deviceMode: deviceMode.value,
    isKioskMode: isKioskMode.value,
    taskId: taskId.value,
    userUsage: userUsage.value
  })
  
  // 組件掛載後，再次刷新用戶使用量以確保數據準確
  if (userId.value && isInitialized.value) {
    await refreshUserUsage()
  }
})

// 進入臉部交換工具
function enterFaceSwap() {
  // 手機版：先進入 email 輸入頁面
  // Kiosk 版：直接進入模板選擇
  if (!isKioskMode.value) {
    currentStep.value = 'email-input'
  } else {
    currentStep.value = 'template-selection'
  }
}

// 處理 Email 提交
function handleEmailSubmit(data) {
  // 暫時將 email 儲存在 sessionStorage（等後端 API 確認後再實作提交邏輯）
  if (data.email) {
    sessionStorage.setItem('faceswap_email', data.email)
    console.log('📧 Email 已儲存:', data.email)
  }
  
  // 進入模板選擇頁面
  currentStep.value = 'template-selection'
}

// 處理模板選擇
function handleTemplateSelection(data) {
  selectedTemplate.value = data.selectedTemplate
  // Mobile 和 Kiosk 模式都直接進入上傳步驟,不再有人物選擇
  currentStep.value = 'upload'
}

// 處理人物選擇 (Kiosk 模式) - 已廢棄,不再使用
// function handleCharacterSelection(data) {
//   selectedTemplate.value = data.selectedTemplate
//   selectedCharacter.value = data.selectedCharacter
//   currentStep.value = 'upload'
// }

// Handle camera capture (Kiosk mode)
function handleCameraCapture(imageFile) {
  console.log('📷 相機拍照完成', imageFile)
}

// Handle camera generate (Kiosk mode)
async function handleCameraGenerate(imageFile) {
  console.log('📤 開始生成（相機模式）')

  try {
    const templateId = selectedTemplate.value

    // Create FormData
    const formData = new FormData()
    formData.append('userId', userId.value || 'abc') // 修正參數名為 userId
    
    // 從 sessionStorage 讀取 email（手機版流程中輸入的 email，Kiosk 模式可能為空）
    const email = sessionStorage.getItem('faceswap_email') || '';
    if (email) {
      formData.append('email', email);
      console.log('📧 已添加 Email 到 FormData (Kiosk):', email);
    }
    
    formData.append('file', imageFile)

    // 將字符串模板ID轉換為新 API 格式 (4,5,6,7)
    const templateIdMap = {
      'play': '1',     // 財運亨通馬上發 → 左上 (id: 1)
      'love': '2',     // 山珍海味馬不停 → 左下 (id: 2)
      'super': '3',    // 心想事成馬上有 → 右下 (id: 3)
      'wife': '4'      // 強棒出擊馬力夯 → 右上 (id: 4)
    };
    const numericTemplateId = templateIdMap[templateId] || '1';
    formData.append('template_id', numericTemplateId)
    
    // 添加必填的 userName 參數（新 API 要求）
    formData.append('userName', userId.value || 'User')

    // 根據選擇的角色計算 target_face_index（與LINE模式一致）
    function getFaceIndex(templateId, characterId) {
      if (templateId === 'play') {
        // 模板1 (綜藝玩很大)：吳宗憲在中間，face_index = 1
        return 1;
      } else if (templateId === 'wife') {
        // 模板2 (犀利人妻)：3個人都支援換臉
        const wifeMapping = { 'character1': 0, 'character2': 1, 'character3': 2 };
        return wifeMapping[characterId] || 0;
      } else if (templateId === 'love') {
        // 模板3 (命中註定我愛你)：2個人都支援換臉
        const loveMapping = { 'character1': 0, 'character2': 1 };
        return loveMapping[characterId] || 0;
      } else if (templateId === 'super') {
        // 模板4 (超級夜總會)：3個人都支援換臉
        const superMapping = { 'character1': 0, 'character2': 1, 'character3': 2 };
        return superMapping[characterId] || 0;
      }
      return 0;
    }

    const targetFaceIndex = getFaceIndex(templateId, selectedCharacter.value)
    formData.append('target_face_index', targetFaceIndex)
    formData.append('userInfo', `選擇的角色: ${selectedCharacter.value}`)

    // Call API
    const result = await roadshowService.generateAvatar(formData)

    if (result && (result.success || result.status === 'success')) {
      console.log('✅ 生成任務已提交:', result.result)
      taskId.value = String(result.result?.task_id || result.result?.id || result.result) // 確保為字符串

      // Navigate to result page
      await nextTick()
      currentStep.value = 'result'
    } else if (result && result.error) {
      console.error('❌ 生成失敗:', result.error)
      alert(result.error.message || result.error || '生成失敗，請重試')
    } else {
      console.error('❌ 生成失敗:', result)
      alert('生成失敗，請重試')
    }
  } catch (error) {
    console.error('❌ 生成過程發生錯誤:', error)
    alert('生成失敗，請重試')
  }
}

// 處理生成請求
function handleGenerate(data) {
  // 保存任務ID和模板信息
  taskId.value = data.taskId
  // 保存選擇的模板ID（從data中獲取）
  if (data.selectedTemplate) {
    selectedTemplate.value = data.selectedTemplate
  }
  
  // 更新用戶使用量（生成新圖片後數量+1）
  userUsage.value += 1
  
  // 生成完成後，也從服務器刷新一次以確保數據準確
  setTimeout(async () => {
    await refreshUserUsage()
  }, 1000)
  
  // 生成完成後導航到結果頁面
  currentStep.value = 'result'
}

// 處理重新生成
function handleRegenerate() {
  // 返回到模板選擇步驟重新開始
  currentStep.value = 'template-selection'
}

// 處理下載到官方帳號
function handleDownload() {
  // 在這裡可以調用下載 API
}

// Handle restart (Kiosk mode)
function handleRestart() {
  console.log('🔄 重新開始（Kiosk 模式）')
  // Reset to homepage
  currentStep.value = 'faceswap-home'
  taskId.value = ''
  selectedTemplate.value = ''
}

// 處理顯示歷史頁面
async function handleShowHistory() {
  // 確保userId有值
  if (!userId.value) {
    initializeDevice()
    if (!userId.value) {
      userId.value = deviceService.generateUserId(deviceMode.value)
    }
  }
  
  // 跳轉到結果頁面，然後顯示歷史
  currentStep.value = 'result'
  // 設置一個標記，讓結果頁面知道要顯示歷史
  // 我們可以通過修改selectedTemplate來傳遞這個信息
  selectedTemplate.value = 'show_history'
}

// 返回上一步
function goBack() {
  if (currentStep.value === 'email-input') {
    // 從 email 輸入頁面返回首頁
    currentStep.value = 'faceswap-home'
  } else if (currentStep.value === 'template-selection') {
    // 手機版：從模板選擇返回 email 輸入頁面
    // Kiosk 版：從模板選擇返回首頁
    if (!isKioskMode.value) {
      currentStep.value = 'email-input'
    } else {
      currentStep.value = 'faceswap-home'
    }
  } else if (currentStep.value === 'upload') {
    // Mobile 和 Kiosk 模式都回到模板選擇
    currentStep.value = 'template-selection'
  } else if (currentStep.value === 'result') {
    currentStep.value = 'upload'
  }
}

</script>

<style scoped>
.app {
  font-family: 'Noto Sans TC', 'Inter', sans-serif;
  overflow-x: hidden;
  background-color: #ffffff;
}

/* Mobile 模式：響應式全螢幕 */
.app-mobile {
  min-height: 100vh;
  width: 100%;
}

/* Mobile 外層容器：全螢幕背景，內容置中 */
.mobile-wrapper {
  min-height: 100vh;
  width: 100%;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
}

/* Mobile 內層容器：固定最大寬度 414px（iPhone 尺寸） */
.mobile-content {
  width: 100%;
  max-width: 414px;
  min-height: 100vh;
  background-color: #ffffff;
  overflow-x: hidden; /* 防止內容溢出 */
}

/* Kiosk 模式：固定 1080x1920 尺寸 */
.app-kiosk {
  width: 1080px;
  height: 1920px;
  margin: 0 auto;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 當螢幕不是精確 1080x1920 時，Kiosk 模式置中顯示 */
@media not all and (width: 1080px) and (height: 1920px) {
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  
  #vue-root {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  
  .app-kiosk {
    /* 在非標準尺寸螢幕上置中 */
    margin: 0;
  }
}
</style>
