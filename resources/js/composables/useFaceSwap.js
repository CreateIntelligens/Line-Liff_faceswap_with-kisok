/**
 * 換臉核心業務邏輯 Composable
 * 封裝換臉相關的 API 調用和狀態管理
 */
import { ref, readonly, computed } from 'vue'
import { roadshowService } from '../services/roadshowService.js'

// 模板 ID 映射（新 API 使用數字 ID）
const TEMPLATE_ID_MAP = {
  'play': '7',     // 財運亨通馬上發 → 財神大同寶寶 (id: 7)
  'wife': '4',     // 強棒出擊馬力夯 → 打棒球的大同寶寶 (id: 4)
  'love': '6',     // 山珍海味馬不停 → 拿電鍋的大同寶寶 (id: 6)
  'super': '5'     // 心想事成馬上有 → 擲筊大同寶寶 (id: 5)
}

// 角色對應的 face index
const CHARACTER_FACE_INDEX = {
  'play': {
    default: 1 // 吳宗憲在中間
  },
  'wife': {
    'character1': 0,
    'character2': 1,
    'character3': 2
  },
  'love': {
    'character1': 0,
    'character2': 1
  },
  'super': {
    'character1': 0,
    'character2': 1,
    'character3': 2
  }
}

/**
 * 使用換臉功能
 * @returns {Object} 換臉相關狀態和方法
 */
export function useFaceSwap() {
  // 狀態
  const isLoading = ref(false)
  const error = ref(null)
  const taskId = ref('')
  const taskStatus = ref(null)
  const resultImage = ref('')
  const userHistory = ref([])
  const userUsage = ref(0)

  // 計算屬性
  const isCompleted = computed(() => taskStatus.value?.status === 'completed')
  const isFailed = computed(() => taskStatus.value?.status === 'failed')
  const isPending = computed(() => taskStatus.value?.status === 'pending' || taskStatus.value?.status === 'processing')

  /**
   * 獲取 face index
   * @param {string} templateId - 模板 ID
   * @param {string} characterId - 角色 ID
   * @returns {number} face index
   */
  const getFaceIndex = (templateId, characterId) => {
    const mapping = CHARACTER_FACE_INDEX[templateId]
    if (!mapping) return 0
    
    if (typeof mapping === 'number') {
      return mapping
    }
    
    if (mapping.default !== undefined && !characterId) {
      return mapping.default
    }
    
    return mapping[characterId] ?? 0
  }

  /**
   * 生成換臉頭像
   * @param {Object} params - 生成參數
   * @param {File} params.file - 用戶照片
   * @param {string} params.templateId - 模板 ID (play, wife, love, super)
   * @param {string} params.characterId - 角色 ID (character1, character2, etc.)
   * @param {string} params.userId - 用戶 ID
   * @param {string} params.userName - 用戶名稱（新 API 必填參數）
   * @returns {Promise<Object>} 生成結果
   */
  const generateAvatar = async ({ file, templateId, characterId, userId, userName }) => {
    isLoading.value = true
    error.value = null
    
    try {
      const formData = new FormData()
      formData.append('userId', userId)
      formData.append('file', file)
      
      // 轉換模板 ID 為新 API 格式 (4, 5, 6, 7)
      const numericTemplateId = TEMPLATE_ID_MAP[templateId] || '7'
      formData.append('template_id', numericTemplateId)
      
      // 添加必填的 userName 參數
      formData.append('userName', userName || userId || '用戶')
      
      // 計算 face index (可選參數，如果需要的話)
      const targetFaceIndex = getFaceIndex(templateId, characterId)
      if (targetFaceIndex !== undefined && targetFaceIndex !== null) {
        formData.append('target_face_index', targetFaceIndex)
      }
      
      // 添加額外信息
      if (characterId) {
        formData.append('userInfo', `選擇的角色: ${characterId}`)
      }
      
      console.log('🎭 開始生成換臉頭像:', {
        templateId,
        numericTemplateId,
        characterId,
        targetFaceIndex,
        userId
      })
      
      const result = await roadshowService.generateAvatar(formData)
      
      if (result && (result.success || result.status === 'success')) {
        taskId.value = result.result?.task_id || result.result?.id || result.result
        console.log('✅ 生成任務已提交:', taskId.value)
        
        return {
          success: true,
          taskId: taskId.value
        }
      } else {
        const errorMsg = result?.error?.message || result?.error || '生成失敗'
        throw new Error(errorMsg)
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ 生成失敗:', err)
      return {
        success: false,
        error: err.message
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 檢查任務狀態
   * @param {string} id - 任務 ID
   * @returns {Promise<Object>} 任務狀態
   */
  const checkStatus = async (id = null) => {
    const checkId = id || taskId.value
    if (!checkId) {
      return { success: false, error: '沒有任務 ID' }
    }
    
    try {
      const result = await roadshowService.checkTaskStatus(checkId)
      
      if (result && !result.error) {
        taskStatus.value = result.result || result
        
        if (taskStatus.value.status === 'completed' && taskStatus.value.result_image) {
          resultImage.value = taskStatus.value.result_image
        }
        
        return {
          success: true,
          status: taskStatus.value
        }
      } else {
        throw new Error(result?.error?.message || '檢查狀態失敗')
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ 檢查狀態失敗:', err)
      return {
        success: false,
        error: err.message
      }
    }
  }

  /**
   * 獲取用戶歷史記錄
   * @param {string} userId - 用戶 ID
   * @returns {Promise<Object>} 歷史記錄
   */
  const getHistory = async (userId) => {
    if (!userId) {
      return { success: false, error: '沒有用戶 ID' }
    }
    
    try {
      const data = await roadshowService.getUserHistory(userId)
      
      // 處理不同的返回格式
      let avatars = []
      if (Array.isArray(data)) {
        avatars = data
      } else if (data && typeof data === 'object') {
        avatars = data.result?.avatars || data.data?.avatars || data.avatars || []
      }
      
      userHistory.value = avatars
      userUsage.value = avatars.length
      
      return {
        success: true,
        avatars,
        count: avatars.length
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ 獲取歷史失敗:', err)
      return {
        success: false,
        error: err.message
      }
    }
  }

  /**
   * 上傳結果圖片到 GCS
   * @param {Object} params - 上傳參數
   * @returns {Promise<Object>} 上傳結果
   */
  const uploadResultToGCS = async (params) => {
    try {
      const result = await roadshowService.uploadToGCS(params)
      return result
    } catch (err) {
      error.value = err.message
      console.error('❌ 上傳到 GCS 失敗:', err)
      return {
        success: false,
        error: err.message
      }
    }
  }

  /**
   * 發送結果通知
   * @param {Object} params - 通知參數
   * @returns {Promise<Object>} 發送結果
   */
  const sendNotification = async (params) => {
    try {
      const result = await roadshowService.sendResultNotification(params)
      return result
    } catch (err) {
      error.value = err.message
      console.error('❌ 發送通知失敗:', err)
      return {
        success: false,
        error: err.message
      }
    }
  }

  /**
   * 重置狀態
   */
  const reset = () => {
    taskId.value = ''
    taskStatus.value = null
    resultImage.value = ''
    error.value = null
    isLoading.value = false
  }

  return {
    // 狀態（只讀）
    isLoading: readonly(isLoading),
    error: readonly(error),
    taskId: readonly(taskId),
    taskStatus: readonly(taskStatus),
    resultImage: readonly(resultImage),
    userHistory: readonly(userHistory),
    userUsage: readonly(userUsage),
    
    // 計算屬性
    isCompleted,
    isFailed,
    isPending,
    
    // 方法
    generateAvatar,
    checkStatus,
    getHistory,
    uploadResultToGCS,
    sendNotification,
    reset,
    
    // 工具函數
    getFaceIndex,
    
    // 常量
    TEMPLATE_ID_MAP,
    CHARACTER_FACE_INDEX
  }
}

export default useFaceSwap

