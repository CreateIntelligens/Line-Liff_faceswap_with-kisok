/**
 * 裝置模式 Composable
 * 提供響應式的裝置模式狀態
 */
import { ref, readonly, onMounted, onUnmounted } from 'vue'
import { deviceService } from '../services/deviceService.js'

// 全局狀態（單例）
const deviceMode = ref('mobile')
const isKioskMode = ref(false)
const isMobileMode = ref(true)
const screenWidth = ref(0)
const screenHeight = ref(0)
let isInitialized = false

/**
 * 使用裝置模式
 * @returns {Object} 裝置模式相關狀態和方法
 */
export function useDeviceMode() {
  // 初始化函數
  const initialize = () => {
    if (!isInitialized) {
      const mode = deviceService.detectDeviceMode()
      deviceMode.value = mode
      isKioskMode.value = mode === 'kiosk'
      isMobileMode.value = mode === 'mobile'
      screenWidth.value = window.innerWidth
      screenHeight.value = window.innerHeight
      isInitialized = true
    }
  }

  // 更新螢幕尺寸
  const updateScreenSize = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
    
    // 重新偵測裝置模式
    const mode = deviceService.detectDeviceMode()
    deviceMode.value = mode
    isKioskMode.value = mode === 'kiosk'
    isMobileMode.value = mode === 'mobile'
  }

  // 組件掛載時添加監聽器
  onMounted(() => {
    initialize()
    window.addEventListener('resize', updateScreenSize)
  })

  // 組件卸載時移除監聽器
  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize)
  })

  // 手動初始化（用於在 setup 外部使用）
  if (typeof window !== 'undefined' && !isInitialized) {
    initialize()
  }

  return {
    // 狀態（只讀）
    deviceMode: readonly(deviceMode),
    isKioskMode: readonly(isKioskMode),
    isMobileMode: readonly(isMobileMode),
    screenWidth: readonly(screenWidth),
    screenHeight: readonly(screenHeight),
    
    // 方法
    initialize,
    updateScreenSize,
    
    // 直接訪問 deviceService（如果需要）
    getDeviceService: () => deviceService
  }
}

export default useDeviceMode

