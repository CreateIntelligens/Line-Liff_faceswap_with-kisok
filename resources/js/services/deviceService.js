/**
 * 裝置服務模組
 * 處理裝置模式偵測和用戶 ID 管理
 */

class DeviceService {
  constructor() {
    this.deviceMode = null
    this.userId = null
    this.isInitialized = false
  }

  /**
   * 偵測裝置模式
   * @returns {'kiosk' | 'mobile'} 裝置模式
   */
  detectDeviceMode() {
    // 1. 檢查配置中是否強制指定模式
    const configMode = window.endpoint?.deviceMode
    if (configMode === 'kiosk') {
      console.log('📱 裝置模式: kiosk (配置強制)')
      return 'kiosk'
    }
    if (configMode === 'mobile') {
      console.log('📱 裝置模式: mobile (配置強制)')
      return 'mobile'
    }

    // 2. 檢查 URL 參數
    const urlParams = new URLSearchParams(window.location.search)
    const urlMode = urlParams.get('mode')
    if (urlMode === 'kiosk') {
      console.log('📱 裝置模式: kiosk (URL 參數)')
      return 'kiosk'
    }
    if (urlMode === 'mobile') {
      console.log('📱 裝置模式: mobile (URL 參數)')
      return 'mobile'
    }

    // 3. 自動偵測：精確匹配 1080x1920 為 Kiosk 模式
    const width = window.innerWidth || window.screen.width
    const height = window.innerHeight || window.screen.height

    if (width === 1080 && height === 1920) {
      console.log(`📱 裝置模式: kiosk (偵測到解析度 ${width}x${height})`)
      return 'kiosk'
    }

    // 4. 其他所有情況使用 mobile 模式
    console.log(`📱 裝置模式: mobile (解析度 ${width}x${height})`)
    return 'mobile'
  }

  /**
   * 生成用戶 ID
   * @param {'kiosk' | 'mobile'} deviceMode - 裝置模式
   * @returns {string} 用戶 ID
   */
  generateUserId(deviceMode) {
    if (deviceMode === 'kiosk') {
      // Kiosk 模式：使用固定 ID 或配置中的 kioskId
      const kioskId = window.endpoint?.kioskId || 'kiosk_001'
      console.log('👤 使用 Kiosk 用戶 ID:', kioskId)
      return kioskId
    }

    // Mobile 模式：檢查 sessionStorage 是否已有 userId
    let userId = sessionStorage.getItem('faceswap_userId')
    
    if (!userId) {
      // 生成新的 session ID
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      userId = `mobile_${timestamp}_${random}`
      sessionStorage.setItem('faceswap_userId', userId)
      console.log('👤 生成新的 Mobile 用戶 ID:', userId)
    } else {
      console.log('👤 使用已存在的 Mobile 用戶 ID:', userId)
    }

    return userId
  }

  /**
   * 初始化裝置服務
   * @param {Object} options - 配置選項
   * @param {Object} options.userId - 用戶 ID 響應式變數 (ref)
   * @returns {Object} 初始化結果
   */
  initialize(options = {}) {
    console.log('=== 裝置服務初始化開始 ===')

    // 偵測裝置模式
    this.deviceMode = this.detectDeviceMode()

    // 生成用戶 ID
    this.userId = this.generateUserId(this.deviceMode)

    // 如果有傳入響應式變數，更新它
    if (options.userId) {
      options.userId.value = this.userId
    }

    this.isInitialized = true

    console.log('✅ 裝置服務初始化完成')
    console.log('  - 裝置模式:', this.deviceMode)
    console.log('  - 用戶 ID:', this.userId)

    return {
      success: true,
      deviceMode: this.deviceMode,
      userId: this.userId,
      isKiosk: this.deviceMode === 'kiosk',
      isMobile: this.deviceMode === 'mobile'
    }
  }

  /**
   * 獲取當前裝置模式
   * @returns {'kiosk' | 'mobile' | null}
   */
  getDeviceMode() {
    return this.deviceMode
  }

  /**
   * 獲取用戶 ID
   * @returns {string | null}
   */
  getUserId() {
    return this.userId
  }

  /**
   * 檢查是否為 Kiosk 模式
   * @returns {boolean}
   */
  isKioskMode() {
    return this.deviceMode === 'kiosk'
  }

  /**
   * 檢查是否為 Mobile 模式
   * @returns {boolean}
   */
  isMobileMode() {
    return this.deviceMode === 'mobile'
  }

  /**
   * 獲取裝置狀態
   * @returns {Object}
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      deviceMode: this.deviceMode,
      userId: this.userId,
      isKiosk: this.isKioskMode(),
      isMobile: this.isMobileMode(),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    }
  }

  /**
   * 清除 session（僅 Mobile 模式有效）
   */
  clearSession() {
    if (this.deviceMode === 'mobile') {
      sessionStorage.removeItem('faceswap_userId')
      this.userId = null
      console.log('🗑️ Mobile session 已清除')
    }
  }
}

// 創建單例實例
export const deviceService = new DeviceService()
export default deviceService

