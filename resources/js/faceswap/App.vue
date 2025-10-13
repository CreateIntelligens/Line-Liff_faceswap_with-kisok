<template>
  <!-- iphone15 -->
  <div class="app">
    <!-- Face Swap Homepage -->
    <FaceSwapHomepage
      v-if="currentStep === 'faceswap-home'"
      @enter-face-swap="enterFaceSwap"
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

    <!-- Face Swap Character Selection (PC Mode Only) -->
    <FaceSwapCharacterSelection
      v-if="currentStep === 'character-selection' && isPCMode"
      :selectedTemplate="selectedTemplate"
      @next-step="handleCharacterSelection"
      @back="goBack"
    />

    <!-- Face Swap Upload (Mobile/LINE) -->
    <FaceSwapUpload
      v-if="currentStep === 'upload' && !isPCMode"
      :selectedTemplate="selectedTemplate"
      :userUsage="userUsage"
      :userId="userId"
      :isPCMode="isPCMode"
      @back="goBack"
      @generate="handleGenerate"
      @showHistory="handleShowHistory"
    />

    <!-- Face Swap Camera Capture (PC) -->
    <FaceSwapCameraCapture
      v-if="currentStep === 'upload' && isPCMode"
      :selectedTemplate="selectedTemplate"
      :selectedCharacter="selectedCharacter"
      @captured="handleCameraCapture"
      @generate="handleCameraGenerate"
      @back="goBack"
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
</template>

<script setup>
import { ref, onMounted, onBeforeMount, nextTick } from 'vue'
import FaceSwapHomepage from './components/FaceSwapHomepage.vue'
import FaceSwapTemplateSelection from './components/FaceSwapTemplateSelection.vue'
import FaceSwapCharacterSelection from './components/FaceSwapCharacterSelection.vue'
import FaceSwapUpload from './components/FaceSwapUpload.vue'
import FaceSwapCameraCapture from './components/FaceSwapCameraCapture.vue'
import FaceSwapResult from './components/FaceSwapResult.vue'
import { roadshowService } from '../services/roadshowService.js'
import { liffService } from '../services/liffService.js'
// 使用全域配置 window.endpoint

// 狀態
const taskId = ref('')
const userId = ref('') // 改為空字串，等待 LIFF 初始化
const currentStep = ref('faceswap-home') // 初始狀態設定為換臉首頁
const selectedTemplate = ref('')
const selectedCharacter = ref('') // PC模式下選擇的角色
const isInitialized = ref(false)
const userUsage = ref(0) // 用戶已生成的圖片數量
const isLiffInitialized = ref(false)

// PC mode detection
const isPCMode = ref(false)

// LIFF 初始化函數
async function initializeLiff() {
  try {
    console.log('🔧 開始初始化 LIFF...')
    
    // 使用完整的 LIFF 初始化流程
    const result = await liffService.initializeLiff()
    
    if (result.success) {
      if (result.isLoggedIn && result.userId) {
        // 用戶已登入，設置用戶 ID
        userId.value = result.userId
        console.log('✅ LIFF 用戶 ID 已設置:', userId.value)
        console.log('👥 好友狀態:', result.isFriend ? '是好友' : '非好友')
      } else if (!result.isLoggedIn) {
        // 用戶未登入，使用訪客 ID
        console.log('⚠️ 用戶未登入 LIFF，使用訪客模式')
        userId.value = 'guest_' + Date.now()
      }
    } else {
      // LIFF 初始化失敗，使用測試模式
      console.log('⚠️ LIFF 初始化失敗，使用測試模式')
      userId.value = 'abc'
    }
    
    isLiffInitialized.value = true
    console.log('🔧 LIFF 初始化完成，userId:', userId.value)
  } catch (error) {
    console.error('❌ LIFF 初始化過程發生錯誤:', error)
    // 錯誤時使用測試值
    userId.value = 'abc'
    isLiffInitialized.value = true
    console.log('🔧 使用後備 userId:', userId.value)
  }
}

// Detect if running in PC mode
function detectPCMode() {
  // 1. 如果enableLiff為false，強制進入PC模式
  if (!window.endpoint?.enableLiff) {
    return true
  }

  // 2. Check URL parameter
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('mode') === 'pc') {
    return true
  }

  // 3. Check if not in LIFF environment and screen is wide
  if (!window.liff && window.innerWidth >= 768) {
    return true
  }

  return false
}

// 主要初始化函數
async function initializeApp() {
  console.log('=== 換臉應用程序初始化開始 ===')

  try {
    // 重置所有狀態，確保重整後是乾淨的狀態
    currentStep.value = 'faceswap-home'
    selectedTemplate.value = ''
    taskId.value = ''
    
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
  await initializeLiff() // 先初始化 LIFF
  await initializeApp() // 再初始化應用程序
})

// 組件掛載後的額外處理
onMounted(async () => {
  // Detect PC mode
  isPCMode.value = detectPCMode()
  console.log('💻 PC模式:', isPCMode.value)

  console.log('Vue 組件已掛載，應用當前狀態:', {
    currentStep: currentStep.value,
    userId: userId.value,
    isPCMode: isPCMode.value,
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
  currentStep.value = 'template-selection'
}

// 處理模板選擇
function handleTemplateSelection(data) {
  selectedTemplate.value = data.selectedTemplate

  // PC模式下先進入人物選擇步驟，LINE模式直接進入上傳步驟
  if (isPCMode.value) {
    currentStep.value = 'character-selection'
  } else {
    currentStep.value = 'upload'
  }
}

// 處理人物選擇 (PC模式)
function handleCharacterSelection(data) {
  selectedTemplate.value = data.selectedTemplate
  selectedCharacter.value = data.selectedCharacter
  currentStep.value = 'upload'
}

// Handle camera capture (PC mode)
function handleCameraCapture(imageFile) {
  console.log('📷 相機拍照完成', imageFile)
}

// Handle camera generate (PC mode)
async function handleCameraGenerate(imageFile) {
  console.log('📤 開始生成（相機模式）')

  try {
    const templateId = selectedTemplate.value

    // Create FormData
    const formData = new FormData()
    formData.append('userId', userId.value || 'abc') // 修正參數名為 userId
    formData.append('file', imageFile)

    // 將字符串模板ID轉換為對應的數字ID (1,2,3,4)
    const templateIdMap = {
      'play': '1',     // 綜藝玩很大 → 模板 1
      'wife': '2',     // 犀利人妻 → 模板 2
      'love': '3',     // 命中註定我愛你 → 模板 3
      'super': '4'     // 超級夜總會 → 模板 4
    };
    const numericTemplateId = templateIdMap[templateId] || '1';
    formData.append('template_id', numericTemplateId)

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
      taskId.value = result.result?.task_id || result.result?.id || result.result

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

// Handle restart (PC mode)
function handleRestart() {
  console.log('🔄 重新開始（PC模式）')
  // Reset to homepage
  currentStep.value = 'faceswap-home'
  taskId.value = ''
  selectedTemplate.value = ''
}

// 處理顯示歷史頁面
async function handleShowHistory() {
  // 確保userId有值
  if (!userId.value) {
    await initializeLiff()
    if (!userId.value) {
      userId.value = 'abc'
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
  if (currentStep.value === 'template-selection') {
    currentStep.value = 'faceswap-home'
  } else if (currentStep.value === 'character-selection') {
    currentStep.value = 'template-selection'
  } else if (currentStep.value === 'upload') {
    // PC模式下從相機回到人物選擇，LINE模式回到模板選擇
    if (isPCMode.value) {
      currentStep.value = 'character-selection'
    } else {
      currentStep.value = 'template-selection'
    }
  } else if (currentStep.value === 'result') {
    currentStep.value = 'upload'
  }
}

</script>

<style scoped>
.app {
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  background-color: #000000;
  min-height: 100vh;
}

.conversation-id-screen {
  width: 100vw;
  height: 100vh;
  min-height: 932px;
  background: #5E60FE;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
</style>
