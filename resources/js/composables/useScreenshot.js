import html2canvas from 'html2canvas'

export function useScreenshot() {
  // 預載入並轉換跨域圖片為 base64
  async function preloadAndConvertImages(container) {
    const images = container.querySelectorAll('img')
    const originalSrcs = new Map() // 儲存原始 src
    
    const convertPromises = Array.from(images).map(async (img) => {
      // 儲存原始 src
      originalSrcs.set(img, img.src)
      
      // 如果是跨域圖片，嘗試轉換為 base64
      if (img.src.includes('stg-api.fanpokka.ai') || img.src.includes('voice.5gao.ai')) {
        try {
          console.log('🔄 正在轉換跨域圖片:', img.src)
          const base64 = await convertImageToBase64(img.src)
          img.src = base64
          console.log('✅ 跨域圖片已轉換為 base64')
        } catch (error) {
          console.warn('⚠️ 無法轉換處理後的圖片，嘗試使用原始圖片:', error)
          // 如果圖片處理 API 的圖片無法載入，嘗試使用原始圖片
          if (img.src.includes('stg-api.fanpokka.ai')) {
            try {
              // 從處理 API URL 中提取原始圖片 URL
              const urlParams = new URLSearchParams(img.src.split('?')[1])
              const originalUrl = decodeURIComponent(urlParams.get('url') || '')
              if (originalUrl) {
                console.log('🔄 嘗試使用原始圖片 URL:', originalUrl)
                const base64 = await convertImageToBase64(originalUrl)
                img.src = base64
                console.log('✅ 原始圖片已轉換為 base64')
                return // 成功，直接返回
              }
            } catch (originalError) {
              console.warn('⚠️ 原始圖片也無法載入:', originalError)
            }
          }

          // 如果都失敗了，使用佔位符
          console.warn('⚠️ 所有方法都失敗，使用佔位符圖片')
          const width = img.naturalWidth || img.width || 300
          const height = img.naturalHeight || img.height || 200
          img.src = createPlaceholderImage(width, height)
        }
      } else {
        // 確保本地圖片已載入
        if (!img.complete) {
          await new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
            setTimeout(resolve, 3000) // 3秒超時
          })
        }
      }
    })
    
    await Promise.all(convertPromises)
    console.log('🖼️ 圖片預處理完成')
    
    return originalSrcs
  }

  // 恢復原始圖片 src
  function restoreOriginalImages(originalSrcs) {
    originalSrcs.forEach((originalSrc, img) => {
      img.src = originalSrc
    })
    console.log('🔄 已恢復原始圖片 src')
  }

  // 將圖片轉換為 base64
  async function convertImageToBase64(imageUrl) {
    return new Promise((resolve, reject) => {
      // 使用 Image 方法，設置 crossOrigin
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          canvas.width = img.naturalWidth || img.width
          canvas.height = img.naturalHeight || img.height
          
          ctx.drawImage(img, 0, 0)
          
          const base64 = canvas.toDataURL('image/jpeg', 0.9)
          resolve(base64)
        } catch (error) {
          console.warn('Canvas 轉換失敗，嘗試 fetch 方法:', error)
          // 如果 Canvas 方法失敗，嘗試 fetch
          fetchImageAsBase64(imageUrl).then(resolve).catch(reject)
        }
      }
      
      img.onerror = () => {
        console.warn('Image 載入失敗，嘗試 fetch 方法')
        // 如果 Image 方法失敗，嘗試 fetch
        fetchImageAsBase64(imageUrl).then(resolve).catch(reject)
      }
      
      // 設置超時
      setTimeout(() => {
        reject(new Error('圖片載入超時'))
      }, 10000)
      
      img.src = imageUrl
    })
  }

  // 使用 fetch 獲取圖片並轉換為 base64
  async function fetchImageAsBase64(imageUrl) {
    try {
      // 只嘗試有效的 fetch 配置，移除 no-cors（會產生空 blob）
      const fetchConfigs = [
        { mode: 'cors', credentials: 'omit' },
        { credentials: 'omit' },
        {}
      ]

      for (const config of fetchConfigs) {
        try {
          console.log(`🔄 嘗試 fetch 配置:`, config)
          const response = await fetch(imageUrl, config)

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const blob = await response.blob()

          // 檢查 blob 是否有效（避免空 blob）
          if (!blob || blob.size === 0) {
            throw new Error('獲取到空的 blob')
          }

          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              const result = reader.result
              // 檢查 base64 是否有效
              if (!result || result === 'data:application/octet-stream;base64,') {
                reject(new Error('無效的 base64 數據'))
                return
              }
              resolve(result)
            }
            reader.onerror = () => reject(new Error('FileReader 錯誤'))
            reader.readAsDataURL(blob)
          })
        } catch (configError) {
          console.warn(`⚠️ Fetch 配置失敗:`, config, configError.message)
          continue
        }
      }

      throw new Error('所有 fetch 配置都失敗')
    } catch (error) {
      throw new Error(`Fetch 失敗: ${error.message}`)
    }
  }

  // 創建佔位符圖片
  function createPlaceholderImage(width = 300, height = 200) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = width
    canvas.height = height
    
    // 繪製背景
    ctx.fillStyle = '#333333'
    ctx.fillRect(0, 0, width, height)
    
    // 繪製邊框
    ctx.strokeStyle = '#EBD8B2'
    ctx.lineWidth = 3
    ctx.strokeRect(15, 15, width - 30, height - 30)
    
    // 繪製內部背景
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(20, 20, width - 40, height - 40)
    
    // 繪製圖標（簡單的相機圖標）
    const iconSize = Math.min(width, height) * 0.15
    const iconX = width / 2 - iconSize / 2
    const iconY = height / 2 - iconSize / 2 - 10
    
    ctx.strokeStyle = '#EBD8B2'
    ctx.lineWidth = 2
    ctx.strokeRect(iconX, iconY, iconSize, iconSize * 0.7)
    ctx.strokeRect(iconX + iconSize * 0.1, iconY - iconSize * 0.1, iconSize * 0.8, iconSize * 0.2)
    
    // 繪製文字
    ctx.fillStyle = '#EBD8B2'
    ctx.font = `${Math.max(12, width / 20)}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText('AI 生成圖片', width / 2, height / 2 + 20)
    
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  // 等待所有圖片載入完成
  async function waitForAllImagesLoaded(container) {
    const images = container.querySelectorAll('img')
    console.log(`🔄 等待 ${images.length} 張圖片載入完成...`)

    const loadPromises = Array.from(images).map((img, index) => {
      return new Promise((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          console.log(`✅ 圖片 ${index + 1} 已載入`)
          resolve()
        } else {
          const handleLoad = () => {
            console.log(`✅ 圖片 ${index + 1} 載入完成`)
            img.removeEventListener('load', handleLoad)
            img.removeEventListener('error', handleError)
            resolve()
          }

          const handleError = () => {
            console.log(`⚠️ 圖片 ${index + 1} 載入失敗，但繼續處理`)
            img.removeEventListener('load', handleLoad)
            img.removeEventListener('error', handleError)
            resolve()
          }

          img.addEventListener('load', handleLoad)
          img.addEventListener('error', handleError)

          // 5秒超時
          setTimeout(() => {
            console.log(`⏰ 圖片 ${index + 1} 載入超時`)
            img.removeEventListener('load', handleLoad)
            img.removeEventListener('error', handleError)
            resolve()
          }, 5000)
        }
      })
    })

    await Promise.all(loadPromises)
    console.log('✅ 所有圖片載入完成，準備截圖')
  }

  // 截圖功能
  async function captureScreenshot(container) {
    if (!container) {
      throw new Error('找不到截圖區域')
    }

    // 預載入並轉換跨域圖片
    const originalSrcs = await preloadAndConvertImages(container)

    // 等待所有圖片載入完成
    await waitForAllImagesLoaded(container)
    
    // 使用超高解析度配置（取消檔案大小限制後）
    const originalCanvas = await html2canvas(container, {
      backgroundColor: '#141414',  // 使用與頁面相同的背景色
      scale: 2,        // 2 倍解析度，平衡品質與效能
      logging: false,
      useCORS: true,          // 啟用 CORS 支援
      allowTaint: false,      // 避免被視為汙染畫布
      foreignObjectRendering: false, // 關閉，避免黑屏問題
      width: container.scrollWidth,   // 使用完整寬度
      height: container.scrollHeight, // 使用完整高度
      windowWidth: window.innerWidth,  // 保持視窗寬度
      windowHeight: window.innerHeight // 保持視窗高度
    })
    
    // 恢復原始圖片 src
    restoreOriginalImages(originalSrcs)
    
    // 直接使用原始 Canvas，不添加邊距
    const scaleFactor = 1.0  // 使用原始尺寸，不縮放
    const newCanvas = document.createElement('canvas')
    const ctx = newCanvas.getContext('2d')

    // 設定新 Canvas 的尺寸（與原始 Canvas 相同）
    newCanvas.width = originalCanvas.width * scaleFactor
    newCanvas.height = originalCanvas.height * scaleFactor

    // 設定高品質渲染
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // 不填充背景色，保持透明或使用原始背景

    // 直接繪製原始 Canvas，無邊距
    ctx.drawImage(
      originalCanvas,
      0,
      0,
      originalCanvas.width * scaleFactor,
      originalCanvas.height * scaleFactor
    )
    
    return newCanvas
  }

  // 圖片壓縮功能 - 超高品質輸出（無檔案大小限制）
  async function compressImage(canvas, forPC = false) {
    return new Promise((resolve, reject) => {
      try {
        // 現在無檔案大小限制，所有模式都使用最高品質 PNG
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            console.log(`✅ ${forPC ? 'PC' : 'LIFF'} 版超高品質 PNG 成功，大小:`, (pngBlob.size / 1024 / 1024).toFixed(2) + 'MB')
            resolve(pngBlob)
          } else {
            // 備用方案：使用高品質 JPEG
            canvas.toBlob((jpegBlob) => {
              if (jpegBlob) {
                console.log(`✅ ${forPC ? 'PC' : 'LIFF'} 版高品質 JPEG 成功，大小:`, (jpegBlob.size / 1024 / 1024).toFixed(2) + 'MB')
                resolve(jpegBlob)
              } else {
                reject(new Error('無法生成圖片 blob'))
              }
            }, 'image/jpeg', 0.98) // JPEG 格式，98% 極高品質
          }
        }, 'image/png', 1) // PNG 格式，100% 無損品質
      } catch (error) {
        reject(error)
      }
    })
  }

  // 本地測試：下載截圖到本機
  function downloadToLocal(blob, filename = 'screenshot') {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('📥 截圖已下載到本機')
  }

  // PC 版上傳圖片到伺服器（使用 imageUploadApi）
  async function uploadImageForPC(blob, filename = 'screenshot') {
    const formData = new FormData()
    formData.append('file', blob, `${filename}.png`)
    formData.append('type', 'image')

    const response = await fetch(window.endpoint.imageUploadApi, {
      method: 'POST',
      headers: {
        ...window.endpoint.imageUploadHeaders,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `PC版上傳失敗: ${response.status}`)
    }

    const data = await response.json()
    return data.result?.path || data.path || data.data?.url || data.url
  }

  // 上傳圖片到伺服器（LIFF版）
  async function uploadImage(blob, userId = 'abc', filename = 'screenshot') {
    const formData = new FormData()
    formData.append('file', blob, `${filename}.png`)
    formData.append('type', 'image')
    formData.append('uid', userId)

    const response = await fetch(`${window.endpoint.baseURL}/face-swap/files`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `上傳失敗: ${response.status}`)
    }

    const data = await response.json()
    return data.result.path || data.path || data.data?.url
  }

  // 智能上傳圖片 - 統一使用 imageUploadApi
  async function smartUploadImage(blob, userId = 'abc', filename = 'screenshot') {
    // 統一使用 imageUploadApi（移除 LIFF 邏輯）
    console.log('📤 使用統一上傳 API')
    return uploadImageForPC(blob, filename)
  }

  // 直接下載圖片到裝置
  async function downloadImage(imageUrl, filename = 'faceswap-result') {
    try {
      console.log('📥 開始下載圖片:', imageUrl)
      
      // 嘗試獲取圖片
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const blob = await response.blob()
      
      // 創建下載連結
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log('✅ 圖片下載成功')
      return { success: true }
    } catch (error) {
      console.error('❌ 圖片下載失敗:', error)
      
      // 備用方案：直接開啟新視窗
      try {
        window.open(imageUrl, '_blank')
        return { success: true, method: 'new_window' }
      } catch (e) {
        throw new Error(`下載失敗: ${error.message}`)
      }
    }
  }

  // 保留 sendViaLiff 名稱以保持向後兼容，但改為直接下載
  // @deprecated 請使用 downloadImage 替代
  async function sendViaLiff(imageUrl) {
    return downloadImage(imageUrl, 'faceswap-result')
  }

  // 顯示訊息提示
  function showMessage(message, type = 'info') {
    // 創建提示元素
    const messageEl = document.createElement('div')
    messageEl.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md text-white text-sm font-medium transition-all duration-300`
    
    // 根據類型設置樣式
    switch (type) {
      case 'success':
        messageEl.className += ' bg-green-500'
        break
      case 'error':
        messageEl.className += ' bg-red-500'
        break
      case 'info':
      default:
        messageEl.className += ' bg-blue-500'
        break
    }
    
    messageEl.textContent = message
    document.body.appendChild(messageEl)
    
    // 3秒後移除提示
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl)
      }
    }, 3000)
  }

  return {
    captureScreenshot,
    compressImage,
    downloadToLocal,
    uploadImage,
    uploadImageForPC,
    smartUploadImage,
    downloadImage,
    sendViaLiff, // @deprecated 保留向後兼容
    showMessage
  }
}
