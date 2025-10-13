/**
 * LIFF 服務模組
 * 處理 LINE LIFF 相關的操作
 */

// 使用全域配置 window.endpoint

class LiffService {
  constructor() {
    this.isInitialized = false
    this.userId = null
    this.userProfile = null
    this.liffId = null
    this.basicId = null
  }

  /**
   * 完整的 LIFF 初始化流程（包含登入驗證）
   * @param {Object} options - 配置選項
   * @param {string} options.userId - 用戶 ID 響應式變數
   * @returns {Promise<Object>} 初始化結果
   */
  async initializeLiff(options = {}) {
    console.log('=== LIFF 初始化開始 ===')
    
    // 檢查是否要啟用 LIFF 功能
    if (!window.endpoint?.enableLiff) {
      console.log('🔧 LIFF 功能已關閉')
      
      // 使用模擬用戶 ID
      const mockUserId = 'dev_user_' + Date.now()
      console.log('🎭 使用模擬用戶 ID:', mockUserId)
      
      // 設置模擬用戶
      this.userId = mockUserId
      this.isInitialized = true
      
      if (options.userId) {
        options.userId.value = mockUserId
      }
      
      return {
        success: true,
        isLoggedIn: true,
        isFriend: true,
        userId: mockUserId,
        message: 'LIFF 功能已關閉，使用模擬用戶'
      }
    }
    
    // 優先從 window.endpoint 獲取 LIFF ID 和 Basic ID
    let liffId = window.endpoint?.liffId
    let basicId = window.endpoint?.basicId
    
    // 備用方案：從全域變數獲取
    if (!liffId) liffId = window.LIFF_ID
    if (!basicId) basicId = window.LINE_BASIC_ID
    
    // 如果已經有配置，跳過 API 調用
    if (liffId && basicId) {
      console.log('✅ 已從配置獲取 LIFF ID 和 Basic ID，跳過 API 調用')
    }
    
    // 如果全域變數沒有，則通過 API 獲取（僅在需要時）
    if (!liffId || !basicId) {
      console.log('嘗試從 API 獲取 LIFF ID 和 Basic ID')
      try {
        const response = await fetch('/api/mbti/liff-id')
        
        // 檢查響應狀態
        if (!response.ok) {
          console.log(`API 端點返回狀態: ${response.status} ${response.statusText}`)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        if (data.status === 'success') {
          if (!liffId) {
            liffId = data.liff_id
            console.log('從 API 獲取到 LIFF ID:', liffId)
          }
          if (!basicId) {
            basicId = data.basic_id
            console.log('從 API 獲取到 Basic ID:', basicId)
          }
        }
      } catch (error) {
        console.log('無法從 API 獲取 LIFF ID 和 Basic ID，使用預設值')
        console.log('錯誤詳情:', error.message)
      }
    }
    
    // 最後的備用方案：使用預設值
    if (!liffId) {
      liffId = '2006948092-pExnvWML'
      console.log('使用預設 LIFF ID:', liffId)
    } else {
      console.log('使用動態 LIFF ID:', liffId)
    }
    
    // Basic ID 是可選的，如果沒有則跳過
    if (basicId) {
      console.log('使用動態 Basic ID:', basicId)
    } else {
      console.log('未設置 Basic ID，跳過相關功能')
    }

    // 保存到實例變數
    this.liffId = liffId
    this.basicId = basicId

    try {
      // 初始化 LIFF
      await liff.init({ liffId })
      
      if (!liff.isLoggedIn()) {
        console.log('用戶未登入 LIFF，重定向至登入頁面')
        
        // 檢查是否在 LINE 應用內
        const isInClient = liff.isInClient()
        
        if (isInClient) {
          // 在 LINE 應用內，執行登入重定向
          console.log('在 LINE 應用內，執行登入重定向')
          // 可以指定登入後重定向的網址
          const redirectUrl = window.location.origin + window.location.pathname
          console.log('🔗 登入後重定向到:', redirectUrl)
          liff.login({ redirectUri: redirectUrl })
          return {
            success: false,
            isLoggedIn: false,
            message: '用戶未登入，已重定向至登入頁面'
          }
        } else {
          // 在瀏覽器中，也嘗試 LINE 登入
          console.log('🌐 在瀏覽器中，嘗試 LINE 登入')
          console.log('💡 提示：在瀏覽器中登入會跳轉到 LINE 登入頁面')
          console.log('💡 提示：登入成功後會返回您的應用')
          
          // 在瀏覽器中調用 liff.login() 會跳轉到 LINE 登入頁面
          // 可以指定登入後重定向的網址
          const redirectUrl = window.location.origin + window.location.pathname
          console.log('🔗 登入後重定向到:', redirectUrl)
          liff.login({ redirectUri: redirectUrl })
          
          return {
            success: false,
            isLoggedIn: false,
            isFriend: false,
            userId: null,
            message: '在瀏覽器中嘗試 LINE 登入，已跳轉到登入頁面'
          }
        }
      }
      
      // 獲取用戶 ID
      const context = liff.getContext()
      const decodedToken = liff.getDecodedIDToken()
      window.uid = context.userId || decodedToken.sub
      
      if (options.userId) {
        options.userId.value = window.uid
      }
      
      this.userId = window.uid
      console.log('成功獲取用戶 ID:', this.userId)
      
      // 檢查好友關係
      const friendship = await liff.getFriendship()
      if (!friendship.friendFlag) {
        console.log('用戶未加入好友')
        let localmbtiType = ''
        let externalUserId = ''
        const urlParams = new URLSearchParams(window.location.search)
        
        // 這裡可以添加處理未加入好友的邏輯
        return {
          success: true,
          isLoggedIn: true,
          isFriend: false,
          userId: this.userId,
          message: '用戶已登入但未加入好友'
        }
      }
      
      // 用戶已登入且是好友
      this.isInitialized = true
      console.log('✅ LIFF 初始化完成，用戶已登入且是好友')
      
      return {
        success: true,
        isLoggedIn: true,
        isFriend: true,
        userId: this.userId,
        message: 'LIFF 初始化成功'
      }
      
    } catch (error) {
      console.error('❌ LIFF 初始化失敗:', error)
      return {
        success: false,
        error: error.message,
        message: 'LIFF 初始化失敗'
      }
    }
  }

  /**
   * 初始化 LIFF（原有方法，保持向後兼容）
   * @param {string} liffId - LIFF ID
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initialize(liffId = null) {
    try {
      // 檢查是否在 LIFF 環境中
      if (typeof liff === 'undefined') {
        console.log('⚠️ 不在 LIFF 環境中')
        return false
      }

      const targetLiffId = liffId || this.liffId || '2006948092-pExnvWML'
      if (!targetLiffId || targetLiffId === 'YOUR_LIFF_ID') {
        console.warn('⚠️ LIFF ID 未設置，請在配置中設置正確的 LIFF ID')
        return false
      }

      console.log('🔧 開始初始化 LIFF...', targetLiffId)
      await liff.init({ liffId: targetLiffId })
      
      this.isInitialized = true
      console.log('✅ LIFF 初始化成功')
      
      return true
    } catch (error) {
      console.error('❌ LIFF 初始化失敗:', error)
      return false
    }
  }

  /**
   * 檢查用戶是否已登入
   * @returns {boolean} 是否已登入
   */
  isLoggedIn() {
    if (!this.isInitialized || typeof liff === 'undefined') {
      return false
    }
    return liff.isLoggedIn()
  }

  /**
   * 獲取用戶資料
   * @returns {Promise<Object|null>} 用戶資料或 null
   */
  async getUserProfile() {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ LIFF 尚未初始化')
        return null
      }

      if (!this.isLoggedIn()) {
        console.log('⚠️ 用戶未登入')
        return null
      }

      const profile = await liff.getProfile()
      this.userProfile = profile
      this.userId = profile.userId
      
      console.log('👤 用戶資料已獲取:', profile)
      return profile
    } catch (error) {
      console.error('❌ 獲取用戶資料失敗:', error)
      return null
    }
  }

  /**
   * 獲取用戶 ID
   * @returns {string|null} 用戶 ID 或 null
   */
  getUserId() {
    return this.userId
  }

  /**
   * 登入
   * @param {string} redirectUri - 登入後重定向的 URI
   */
  login(redirectUri = null) {
    if (!this.isInitialized || typeof liff === 'undefined') {
      console.warn('⚠️ LIFF 尚未初始化')
      return
    }

    if (redirectUri) {
      liff.login({ redirectUri })
    } else {
      liff.login()
    }
  }

  /**
   * 登出
   */
  logout() {
    if (!this.isInitialized || typeof liff === 'undefined') {
      console.warn('⚠️ LIFF 尚未初始化')
      return
    }

    liff.logout()
  }

  /**
   * 獲取 LIFF 環境資訊
   * @returns {Object} LIFF 環境資訊
   */
  getEnvironment() {
    if (!this.isInitialized || typeof liff === 'undefined') {
      return null
    }

    return {
      os: liff.getOS(),
      language: liff.getLanguage(),
      version: liff.getVersion(),
      lineVersion: liff.getLineVersion(),
      isInClient: liff.isInClient(),
      isLoggedIn: liff.isLoggedIn()
    }
  }

  /**
   * 檢查是否在 LINE 應用內
   * @returns {boolean} 是否在 LINE 應用內
   */
  isInClient() {
    if (!this.isInitialized || typeof liff === 'undefined') {
      return false
    }
    return liff.isInClient()
  }

  /**
   * 獲取當前 LIFF 狀態
   * @returns {Object} LIFF 狀態
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isLoggedIn: this.isLoggedIn(),
      userId: this.userId,
      userProfile: this.userProfile,
      environment: this.getEnvironment()
    }
  }

  /**
   * 瀏覽器測試輔助功能
   * @returns {Object} 測試信息
   */
  getBrowserTestInfo() {
    const isInClient = this.isInClient()
    const isLiffAvailable = typeof liff !== 'undefined'
    
    return {
      isInClient,
      isLiffAvailable,
      isBrowser: !isInClient,
      testMode: !isInClient,
      recommendations: {
        browser: '🌐 瀏覽器測試模式：使用訪客 ID 進行功能測試',
        line: '📱 LINE 應用測試：可測試真實登入和用戶資料',
        development: '🔧 開發建議：在瀏覽器中開發，在 LINE 中測試'
      }
    }
  }

  /**
   * 模擬登入（僅用於瀏覽器測試）
   * @param {string} mockUserId - 模擬用戶 ID
   * @returns {Object} 模擬結果
   */
  mockLogin(mockUserId = null) {
    if (this.isInClient()) {
      console.warn('⚠️ 在 LINE 應用內無法使用模擬登入')
      return null
    }

    const userId = mockUserId || 'mock_user_' + Date.now()
    this.userId = userId
    this.isInitialized = true
    
    console.log('🎭 模擬登入成功，用戶 ID:', userId)
    console.log('💡 這僅用於瀏覽器測試，不會影響真實的 LIFF 功能')
    
    return {
      success: true,
      isLoggedIn: true,
      isFriend: true,
      userId: userId,
      message: '模擬登入成功（僅用於瀏覽器測試）'
    }
  }
}

// 創建單例實例
export const liffService = new LiffService()
export default liffService
