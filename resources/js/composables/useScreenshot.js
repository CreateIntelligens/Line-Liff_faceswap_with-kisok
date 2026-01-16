import html2canvas from 'html2canvas'

export function useScreenshot() {
  // 瀏覽器檢測函數
  function detectBrowser() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return { isMobile: false, isIOS: false, isAndroid: false, isLine: false, supportsDownload: false }
    }
    
    const ua = navigator.userAgent || navigator.vendor || window.opera
    const isMobile = /iPhone|iPad|iPod|Android|Mobile|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isAndroid = /Android/i.test(ua)
    const isLine = /Line/i.test(ua) || /LINE/i.test(ua)
    
    // 檢測是否支援 download 屬性（iOS Safari 不支援）
    const supportsDownload = !isIOS || (isAndroid && /Chrome/i.test(ua))
    
    return {
      isMobile,
      isIOS,
      isAndroid,
      isLine,
      supportsDownload,
      isSafari: /Safari/i.test(ua) && !/Chrome/i.test(ua) && !/CriOS/i.test(ua),
      isChrome: /Chrome/i.test(ua) && !/Edge/i.test(ua)
    }
  }

  // 檢查是否為跨域圖片
  function isCrossOriginImage(imageUrl) {
    if (!imageUrl || imageUrl.startsWith('data:')) {
      return false // data URL 不是跨域
    }
    
    try {
      const imgUrl = new URL(imageUrl, window.location.href)
      const currentOrigin = window.location.origin
      
      // 檢查是否為跨域
      if (imgUrl.origin !== currentOrigin) {
        return true
      }
      
      // 檢查常見的跨域域名
      const crossOriginDomains = [
        'stg-api.fanpokka.ai',
        'api.uat.tatung2025.aitago.tw',  // 後端提供的代理 API
        'voice.5gao.ai',
        'storage.googleapis.com',
        'firebasestorage.googleapis.com',
        's3.amazonaws.com',
        'cdn.'
      ]
      
      return crossOriginDomains.some(domain => imageUrl.includes(domain))
    } catch (e) {
      // 如果 URL 解析失敗，檢查是否包含常見的跨域域名
      const crossOriginDomains = [
        'stg-api.fanpokka.ai',
        'api.uat.tatung2025.aitago.tw',  // 後端提供的代理 API
        'voice.5gao.ai',
        'storage.googleapis.com',
        'firebasestorage.googleapis.com',
        's3.amazonaws.com'
      ]
      return crossOriginDomains.some(domain => imageUrl.includes(domain))
    }
  }

  // 使用 imageProcessApi 作為代理轉換圖片
  async function convertImageViaProxy(imageUrl) {
    const config = window.endpoint || {}
    const enableImageProcessing = config.enableImageProcessing || false
    
    if (!enableImageProcessing || !config.imageProcessApi) {
      throw new Error('imageProcessApi 未啟用或未配置')
    }
    
    const apiUrl = config.imageProcessApi
    const params = config.imageProcessParams || { scale: 1.5, format: 'jpg', quality: 85 }
    
    // 構建查詢參數
    const queryParams = new URLSearchParams()
    queryParams.append('url', imageUrl)
    if (params.scale) queryParams.append('scale', params.scale)
    if (params.format) queryParams.append('format', params.format)
    if (params.quality) queryParams.append('quality', params.quality)
    
    const proxyUrl = `${apiUrl}?${queryParams.toString()}`
    console.log('🔄 使用代理 API 轉換圖片:', proxyUrl)
    
    // 使用代理 URL 轉換為 base64
    return await convertImageToBase64(proxyUrl)
  }

  // 從已載入的 img 元素直接提取圖片數據（避免 CORS 問題）
  function extractImageFromLoadedElement(img) {
    try {
      // 檢查圖片是否已載入
      if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
        throw new Error('圖片尚未載入完成')
      }
      
      // 創建 canvas 並繪製圖片
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      
      // 繪製圖片到 canvas（即使圖片是跨域的，如果已經在頁面上顯示，通常可以繪製）
      ctx.drawImage(img, 0, 0)
      
      // 轉換為 base64
      const base64 = canvas.toDataURL('image/jpeg', 0.9)
      
      if (base64 && base64.length > 100) {
        return base64
      } else {
        throw new Error('生成的 base64 無效')
      }
    } catch (error) {
      // 如果 canvas 繪製失敗（可能是因為圖片被標記為 tainted），返回 null
      // 這通常發生在跨域圖片上，即使它們已經在頁面上顯示
      if (error.message.includes('tainted') || error.message.includes('cross-origin')) {
        console.warn('無法從已載入元素提取圖片（tainted canvas）:', error.message)
      } else {
        console.warn('無法從已載入元素提取圖片:', error.message)
      }
      return null
    }
  }

  // 使用後端 API 獲取圖片（通過後端代理，避免 CORS）
  async function fetchImageViaBackend(imageUrl) {
    try {
      const baseURL = window.endpoint?.baseURL || 'https://line.uat.tatung2025.aitago.tw/api'
      // 嘗試使用後端 API 代理獲取圖片
      // 注意：這需要後端支持代理功能
      const proxyUrl = `${baseURL}/proxy-image?url=${encodeURIComponent(imageUrl)}`
      
      console.log('🔄 嘗試使用後端 API 代理獲取圖片:', proxyUrl)
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      
      if (!response.ok) {
        throw new Error(`後端代理失敗: ${response.status}`)
      }
      
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('FileReader 錯誤'))
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.warn('後端 API 代理失敗:', error.message)
      throw error
    }
  }

  // 預載入並轉換跨域圖片為 base64
  async function preloadAndConvertImages(container) {
    const images = container.querySelectorAll('img')
    const originalSrcs = new Map() // 儲存原始 src
    const conversionErrors = [] // 記錄轉換失敗的圖片
    
    const convertPromises = Array.from(images).map(async (img, index) => {
      // 儲存原始 src
      const originalSrc = img.src
      originalSrcs.set(img, originalSrc)
      
      // 跳過佔位符圖片（data URL）
      if (originalSrc.startsWith('data:image') && originalSrc.includes('AI 生成圖片')) {
        console.log(`⚠️ 圖片 ${index + 1} 已經是佔位符，跳過轉換`)
        return
      }
      
      // 檢查是否為跨域圖片（包括所有跨域域名）
      if (isCrossOriginImage(originalSrc)) {
        console.log(`🔄 [圖片 ${index + 1}] 檢測到跨域圖片，開始轉換:`, originalSrc)
        
        // 優先嘗試：如果圖片已經在頁面上載入，直接從 DOM 元素提取
        if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
          console.log(`🔄 [圖片 ${index + 1}] 圖片已載入，嘗試直接從 DOM 元素提取`)
          const base64 = extractImageFromLoadedElement(img)
          if (base64) {
            img.src = base64
            console.log(`✅ [圖片 ${index + 1}] 成功從已載入元素提取為 base64`)
            return
          } else {
            console.warn(`⚠️ [圖片 ${index + 1}] 無法從 DOM 元素提取（tainted canvas），嘗試其他方法`)
          }
        }
        
        // 備用方案：嘗試使用後端 API 代理（如果後端支持）
        try {
          console.log(`🔄 [圖片 ${index + 1}] 嘗試使用後端 API 代理獲取圖片`)
          const base64 = await fetchImageViaBackend(originalSrc)
          if (base64 && base64.startsWith('data:image')) {
            img.src = base64
            console.log(`✅ [圖片 ${index + 1}] 通過後端 API 成功獲取為 base64`)
            return
          }
        } catch (backendError) {
          console.warn(`⚠️ [圖片 ${index + 1}] 後端 API 代理失敗:`, backendError.message)
        }
        
        // 備用方案：嘗試使用代理 API（特別是 storage.googleapis.com）
        if (originalSrc.includes('storage.googleapis.com')) {
          try {
            console.log(`🔄 [圖片 ${index + 1}] 使用代理 API 轉換 storage.googleapis.com 圖片`)
            const base64 = await convertImageViaProxy(originalSrc)
            if (base64 && base64.startsWith('data:image') && !base64.includes('AI 生成圖片')) {
              img.src = base64
              console.log(`✅ [圖片 ${index + 1}] 通過代理 API 成功轉換為 base64`)
              return
            }
          } catch (proxyError) {
            console.warn(`⚠️ [圖片 ${index + 1}] 代理 API 轉換失敗:`, proxyError.message)
          }
        }
        
        // 最後嘗試：直接轉換（通常會失敗，但試試看）
        try {
          const base64 = await convertImageToBase64(originalSrc)
          // 驗證 base64 是否有效（不是佔位符）
          if (base64 && base64.startsWith('data:image') && !base64.includes('AI 生成圖片')) {
            img.src = base64
            console.log(`✅ [圖片 ${index + 1}] 跨域圖片已成功轉換為 base64`)
          } else {
            throw new Error('轉換後的 base64 無效')
          }
        } catch (error) {
          console.error(`❌ [圖片 ${index + 1}] 無法轉換跨域圖片:`, error.message)
          conversionErrors.push({ img, originalSrc, error })
          
          // 如果圖片處理 API 的圖片無法載入，嘗試使用原始圖片
          if (originalSrc.includes('stg-api.fanpokka.ai')) {
            try {
              // 從處理 API URL 中提取原始圖片 URL
              const urlParams = new URLSearchParams(originalSrc.split('?')[1])
              const originalUrl = decodeURIComponent(urlParams.get('url') || '')
              if (originalUrl) {
                console.log(`🔄 [圖片 ${index + 1}] 嘗試使用原始圖片 URL:`, originalUrl)
                // 如果是 storage.googleapis.com，也使用代理
                if (originalUrl.includes('storage.googleapis.com')) {
                  try {
                    const base64 = await convertImageViaProxy(originalUrl)
                    if (base64 && base64.startsWith('data:image') && !base64.includes('AI 生成圖片')) {
                      img.src = base64
                      console.log(`✅ [圖片 ${index + 1}] 通過代理 API 成功轉換原始圖片為 base64`)
                      return
                    }
                  } catch (proxyError) {
                    console.warn(`⚠️ [圖片 ${index + 1}] 代理 API 轉換原始圖片失敗:`, proxyError.message)
                  }
                }
                
                const base64 = await convertImageToBase64(originalUrl)
                if (base64 && base64.startsWith('data:image') && !base64.includes('AI 生成圖片')) {
                  img.src = base64
                  console.log(`✅ [圖片 ${index + 1}] 原始圖片已轉換為 base64`)
                  return // 成功，直接返回
                }
              }
            } catch (originalError) {
              console.error(`❌ [圖片 ${index + 1}] 原始圖片也無法載入:`, originalError)
            }
          }

          // 如果都失敗了，不要使用佔位符，而是保持原始 URL
          // 讓 html2canvas 嘗試直接使用原始 URL（如果 CORS 允許）
          console.warn(`⚠️ [圖片 ${index + 1}] 所有轉換方法都失敗，保持原始 URL，讓 html2canvas 嘗試直接使用`)
          // 不設置佔位符，保持原始 src
        }
      } else {
        // 確保本地圖片已載入
        if (!img.complete || img.naturalWidth === 0) {
          console.log(`🔄 [圖片 ${index + 1}] 等待本地圖片載入...`)
          await new Promise((resolve) => {
            const timeout = setTimeout(() => {
              console.warn(`⏰ [圖片 ${index + 1}] 本地圖片載入超時`)
              resolve()
            }, 5000)
            
            img.onload = () => {
              clearTimeout(timeout)
              console.log(`✅ [圖片 ${index + 1}] 本地圖片載入完成`)
              resolve()
            }
            img.onerror = () => {
              clearTimeout(timeout)
              console.error(`❌ [圖片 ${index + 1}] 本地圖片載入失敗`)
              resolve()
            }
          })
        } else {
          console.log(`✅ [圖片 ${index + 1}] 本地圖片已載入`)
        }
      }
    })
    
    await Promise.all(convertPromises)
    
    // 如果有轉換失敗的圖片，記錄警告
    if (conversionErrors.length > 0) {
      console.warn(`⚠️ 有 ${conversionErrors.length} 張圖片轉換失敗，可能會影響截圖品質`)
      conversionErrors.forEach(({ originalSrc, error }) => {
        console.warn(`  - ${originalSrc}: ${error.message}`)
      })
    }
    
    console.log('🖼️ 圖片預處理完成')
    
    return { originalSrcs, conversionErrors }
  }

  // 恢復原始圖片 src
  function restoreOriginalImages(originalSrcs) {
    originalSrcs.forEach((originalSrc, img) => {
      img.src = originalSrc
    })
    console.log('🔄 已恢復原始圖片 src')
  }

  // 檢查圖片 CORS 設置
  async function checkImageCORS(imageUrl) {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        console.log('✅ 圖片 CORS 檢查通過，可以正常載入')
        resolve({ success: true, canLoad: true })
      }
      
      img.onerror = (error) => {
        console.error('❌ 圖片 CORS 檢查失敗，可能是 CORS 設置問題')
        console.error('   錯誤詳情:', error)
        resolve({ success: false, canLoad: false, error: 'CORS 錯誤' })
      }
      
      setTimeout(() => {
        resolve({ success: false, canLoad: false, error: '超時' })
      }, 5000)
      
      img.src = imageUrl
    })
  }

  // 將圖片轉換為 base64
  async function convertImageToBase64(imageUrl) {
    // 先檢查 CORS
    const corsCheck = await checkImageCORS(imageUrl)
    if (!corsCheck.canLoad) {
      console.warn('⚠️ 圖片 CORS 檢查失敗，但繼續嘗試轉換')
    }
    
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
          if (base64 && base64.length > 100) { // 確保 base64 有效
            resolve(base64)
          } else {
            throw new Error('生成的 base64 無效')
          }
        } catch (error) {
          console.warn('Canvas 轉換失敗，嘗試 fetch 方法:', error)
          // 如果 Canvas 方法失敗，嘗試 fetch
          fetchImageAsBase64(imageUrl).then(resolve).catch(reject)
        }
      }
      
      img.onerror = (error) => {
        console.warn('Image 載入失敗，嘗試 fetch 方法。錯誤:', error)
        // 如果 Image 方法失敗，嘗試 fetch
        fetchImageAsBase64(imageUrl).then(resolve).catch(reject)
      }
      
      // 設置超時
      setTimeout(() => {
        reject(new Error('圖片載入超時（10秒）'))
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

  // 預載入背景圖片
  async function preloadBackgroundImages(container) {
    const backgroundImages = new Set()
    
    // 獲取所有元素的背景圖片
    const allElements = container.querySelectorAll('*')
    allElements.forEach((el) => {
      const bgImage = window.getComputedStyle(el).backgroundImage
      if (bgImage && bgImage !== 'none') {
        // 提取 URL
        const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/)
        if (match && match[1]) {
          const url = match[1]
          if (!url.startsWith('data:')) {
            backgroundImages.add(url)
          }
        }
      }
    })
    
    // 預載入所有背景圖片
    const preloadPromises = Array.from(backgroundImages).map(async (url) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          console.log('✅ 背景圖片已載入:', url)
          resolve()
        }
        img.onerror = () => {
          console.warn('⚠️ 背景圖片載入失敗:', url)
          resolve() // 即使失敗也繼續
        }
        img.src = url
        // 5秒超時
        setTimeout(() => {
          console.log('⏰ 背景圖片載入超時:', url)
          resolve()
        }, 5000)
      })
    })
    
    if (preloadPromises.length > 0) {
      console.log(`🔄 預載入 ${preloadPromises.length} 張背景圖片...`)
      await Promise.all(preloadPromises)
      console.log('✅ 所有背景圖片預載入完成')
    }
  }

  // 等待所有圖片載入完成
  async function waitForAllImagesLoaded(container) {
    // 先預載入背景圖片
    await preloadBackgroundImages(container)
    
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
    
    // 額外等待一小段時間，確保所有渲染完成
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('✅ 所有圖片載入完成，準備截圖')
  }

  // 截圖功能
  async function captureScreenshot(container) {
    if (!container) {
      throw new Error('找不到截圖區域')
    }

    console.log('📸 開始截圖流程...')
    
    // 預載入並轉換跨域圖片
    const { originalSrcs, conversionErrors } = await preloadAndConvertImages(container)

    // 等待所有圖片載入完成
    await waitForAllImagesLoaded(container)
    
    // 獲取所有圖片元素（統一使用一個變數）
    const containerImages = container.querySelectorAll('img')
    
    // 檢查是否有圖片是佔位符
    let hasPlaceholder = false
    containerImages.forEach((img, index) => {
      if (img.src.startsWith('data:image') && img.src.includes('AI 生成圖片')) {
        console.error(`❌ [圖片 ${index + 1}] 檢測到佔位符圖片，截圖可能不完整！`)
        hasPlaceholder = true
      }
    })
    
    if (hasPlaceholder) {
      console.warn('⚠️ 警告：檢測到佔位符圖片，這可能是因為跨域圖片轉換失敗。')
      console.warn('⚠️ 建議檢查：1) 圖片 URL 是否有效 2) 後端 CORS 設置是否正確')
    }
    
    // 使用超高解析度配置（取消檔案大小限制後）
    console.log('📸 開始使用 html2canvas 截圖...')
    
    // 檢查是否有轉換失敗的圖片
    const hasFailedImages = conversionErrors && conversionErrors.length > 0
    if (hasFailedImages) {
      console.warn('⚠️ 檢測到圖片轉換失敗，html2canvas 可能無法正確顯示這些圖片')
      console.warn('⚠️ 建議：請後端在 Google Cloud Storage bucket 中設置 CORS headers')
      console.warn('⚠️ 或者：請後端提供代理 API 端點（例如 /api/proxy-image）')
    }
    
    // 嘗試使用 html2canvas，即使有跨域圖片也嘗試截圖
    // 注意：如果圖片無法載入，html2canvas 可能會顯示空白或錯誤
    // 嘗試先設置圖片的 crossOrigin 屬性（如果可能）
    const originalCrossOrigin = new Map()
    containerImages.forEach((img) => {
      if (img.src && !img.src.startsWith('data:') && !img.crossOrigin) {
        originalCrossOrigin.set(img, img.crossOrigin)
        // 嘗試設置 crossOrigin，即使可能失敗
        try {
          img.crossOrigin = 'anonymous'
        } catch (e) {
          // 忽略錯誤
        }
      }
    })
    
    const originalCanvas = await html2canvas(container, {
      backgroundColor: null,  // 使用透明背景，保持原始背景
      scale: 2,        // 2 倍解析度，平衡品質與效能
      logging: false,
      useCORS: true,          // 嘗試使用 CORS（如果圖片支援）
      allowTaint: true,       // 允許跨域圖片（tainted canvas）作為備用
      foreignObjectRendering: false, // 關閉，避免黑屏問題
      width: container.scrollWidth,   // 使用完整寬度
      height: container.scrollHeight, // 使用完整高度
      windowWidth: window.innerWidth,  // 保持視窗寬度
      windowHeight: window.innerHeight, // 保持視窗高度
      // 忽略圖片載入錯誤，繼續截圖
      ignoreElements: (element) => {
        // 不忽略任何元素，讓 html2canvas 嘗試渲染所有內容
        return false
      }
    })
    
    // 恢復圖片的 crossOrigin 屬性
    originalCrossOrigin.forEach((originalValue, img) => {
      try {
        img.crossOrigin = originalValue
      } catch (e) {
        // 忽略錯誤
      }
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

  // 圖片壓縮功能 - 超高品質輸出（無檔案大小限制，處理 tainted canvas）
  async function compressImage(canvas, forPC = false) {
    return new Promise((resolve, reject) => {
      try {
        // 嘗試使用 toBlob（PNG）
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            console.log(`✅ ${forPC ? 'PC' : 'LIFF'} 版超高品質 PNG 成功，大小:`, (pngBlob.size / 1024 / 1024).toFixed(2) + 'MB')
            resolve(pngBlob)
          } else {
            // 如果 PNG 失敗，嘗試 JPEG
            canvas.toBlob((jpegBlob) => {
              if (jpegBlob) {
                console.log(`✅ ${forPC ? 'PC' : 'LIFF'} 版高品質 JPEG 成功，大小:`, (jpegBlob.size / 1024 / 1024).toFixed(2) + 'MB')
                resolve(jpegBlob)
              } else {
                // 如果 toBlob 都失敗（可能是 tainted canvas），嘗試使用 toDataURL
                console.warn('⚠️ toBlob 失敗，嘗試使用 toDataURL（可能是 tainted canvas）')
                try {
                  const dataUrl = canvas.toDataURL('image/png', 1.0)
                  if (dataUrl && dataUrl.length > 100) {
                    // 將 Data URL 轉換為 Blob
                    const byteString = atob(dataUrl.split(',')[1])
                    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]
                    const ab = new ArrayBuffer(byteString.length)
                    const ia = new Uint8Array(ab)
                    for (let i = 0; i < byteString.length; i++) {
                      ia[i] = byteString.charCodeAt(i)
                    }
                    const blob = new Blob([ab], { type: mimeString })
                    console.log(`✅ 使用 Data URL 轉換成功，大小:`, (blob.size / 1024 / 1024).toFixed(2) + 'MB')
                    resolve(blob)
                  } else {
                    throw new Error('toDataURL 返回無效數據')
                  }
                } catch (dataUrlError) {
                  // 如果 toDataURL 也失敗（tainted canvas），拋出更明確的錯誤
                  console.error('❌ Canvas 是 tainted，無法導出:', dataUrlError)
                  reject(new Error('無法導出圖片：圖片來源有 CORS 限制。請確保圖片服務器設置了正確的 CORS headers，或使用代理 API。'))
                }
              }
            }, 'image/jpeg', 0.98) // JPEG 格式，98% 極高品質
          }
        }, 'image/png', 1) // PNG 格式，100% 無損品質
      } catch (error) {
        // 如果所有方法都失敗，提供更詳細的錯誤信息
        console.error('❌ 圖片壓縮失敗:', error)
        if (error.message && error.message.includes('tainted')) {
          reject(new Error('無法導出圖片：圖片來源有 CORS 限制。請確保圖片服務器設置了正確的 CORS headers。'))
        } else {
          reject(error)
        }
      }
    })
  }

  // 本地測試：下載截圖到本機（支援手機瀏覽器，使用安全的 Data URL 方案）
  function downloadToLocal(blob, filename = 'screenshot') {
    const browser = detectBrowser()
    const timestamp = Date.now()
    const fileExtension = 'png'
    const fullFilename = `${filename}-${timestamp}.${fileExtension}`
    
    console.log('📥 開始下載，瀏覽器資訊:', browser)
    
    // 統一使用 Data URL 方案，避免 Blob URL 的安全問題
    // 將 Blob 轉換為 Data URL（更安全，不會有 insecure 錯誤）
    const reader = new FileReader()
    
    reader.onload = function(e) {
      try {
        const dataUrl = e.target.result
        
        // 檢查是否為 HTTPS 頁面
        const isSecure = window.location.protocol === 'https:'
        
        if (!isSecure && dataUrl.startsWith('data:')) {
          console.warn('⚠️ 非 HTTPS 頁面，但使用 Data URL 應該安全')
        }
        
        // 對於 Android Chrome 且支援 download 的瀏覽器，先嘗試直接下載
        if (browser.supportsDownload && browser.isAndroid && !browser.isLine) {
          try {
            // 創建臨時連結嘗試下載
            const a = document.createElement('a')
            a.href = dataUrl
            a.download = fullFilename
            a.style.display = 'none'
            document.body.appendChild(a)
            
            // 嘗試觸發下載
            a.click()
            
            // 延遲清理
            setTimeout(() => {
              document.body.removeChild(a)
            }, 100)
            
            console.log('✅ 嘗試直接下載（Android Chrome）')
            return
          } catch (downloadError) {
            console.warn('⚠️ 直接下載失敗，使用備用方案:', downloadError)
            // 繼續執行備用方案
          }
        }
        
        // 嘗試使用新視窗顯示圖片
        console.log('📱 嘗試使用新視窗方案顯示圖片')
        
        // 創建新視窗（在異步回調中可能被阻止）
        let newWindow = null
        try {
          newWindow = window.open('', '_blank', 'noopener,noreferrer')
        } catch (e) {
          console.warn('⚠️ window.open 調用失敗:', e)
        }
        
        if (newWindow && !newWindow.closed) {
          // 轉義 HTML 特殊字符
          const escapeHtml = (text) => {
            if (!text) return ''
            return String(text)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;')
          }
          
          const safeFilename = escapeHtml(fullFilename)
          const hintText = browser.isIOS 
            ? '長按圖片，選擇「加入照片」即可保存到相簿' 
            : browser.isLine
            ? '長按圖片，選擇「儲存圖片」或「下載」'
            : '長按圖片，選擇「儲存圖片」或「下載」'
          
          // 使用安全的 HTML 寫入方式
          newWindow.document.open()
          newWindow.document.write(
            '<!DOCTYPE html>\n' +
            '<html lang="zh-Hant">\n' +
            '<head>\n' +
            '  <meta charset="UTF-8">\n' +
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
            '  <meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: blob:; img-src \'self\' data: blob:;">\n' +
            '  <title>' + safeFilename + '</title>\n' +
            '  <style>\n' +
            '    * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '    body { margin: 0; padding: 20px; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif; }\n' +
            '    img { max-width: 100%; height: auto; border-radius: 8px; display: block; }\n' +
            '    .hint { color: #fff; text-align: center; margin-top: 20px; padding: 15px 20px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; font-size: 14px; line-height: 1.6; max-width: 90%; }\n' +
            '    .hint strong { display: block; margin-bottom: 8px; font-size: 16px; color: #FFD700; }\n' +
            '  </style>\n' +
            '</head>\n' +
            '<body>\n' +
            '  <img src="' + dataUrl + '" alt="' + safeFilename + '" crossorigin="anonymous" />\n' +
            '  <div class="hint">\n' +
            '    <strong>💡 如何保存圖片：</strong>\n' +
            '    ' + hintText + '\n' +
            '  </div>\n' +
            '</body>\n' +
            '</html>'
          )
          newWindow.document.close()
          console.log('✅ 新視窗已打開')
          return
        }
        
        // 如果彈窗被阻止，使用備用方案：在當前頁面顯示全屏圖片查看器
        console.warn('⚠️ 彈窗被阻止，使用備用方案：在當前頁面顯示圖片')
        showImageModal(dataUrl, fullFilename, browser)
        
      } catch (error) {
        console.error('❌ 處理 Data URL 失敗:', error)
        alert('圖片處理失敗，請重試')
      }
    }
    
    reader.onerror = function(error) {
      console.error('❌ 讀取 Blob 失敗:', error)
      alert('圖片讀取失敗，請重試')
    }
    
    // 開始讀取 Blob 為 Data URL
    reader.readAsDataURL(blob)
  }
  
  // 在當前頁面顯示全屏圖片查看器（當彈窗被阻止時使用）
  function showImageModal(dataUrl, filename, browser) {
    // 創建 modal 容器
    const modal = document.createElement('div')
    modal.id = 'image-download-modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    `
    
    // 創建關閉按鈕
    const closeBtn = document.createElement('button')
    closeBtn.textContent = '關閉'
    closeBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #FF7824;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      z-index: 100000;
    `
    closeBtn.onclick = () => {
      document.body.removeChild(modal)
    }
    
    // 創建圖片容器
    const imgContainer = document.createElement('div')
    imgContainer.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 100%;
    `
    
    // 創建圖片
    const img = document.createElement('img')
    img.src = dataUrl
    img.style.cssText = `
      max-width: 100%;
      max-height: 70vh;
      height: auto;
      border-radius: 8px;
      display: block;
    `
    
    // 創建提示文字
    const hint = document.createElement('div')
    const hintText = browser.isIOS 
      ? '長按圖片，選擇「加入照片」即可保存到相簿' 
      : browser.isLine
      ? '長按圖片，選擇「儲存圖片」或「下載」'
      : '長按圖片，選擇「儲存圖片」或「下載」'
    
    hint.innerHTML = `
      <div style="color: #fff; text-align: center; margin-top: 20px; padding: 15px 20px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; font-size: 14px; line-height: 1.6; max-width: 90%;">
        <strong style="display: block; margin-bottom: 8px; font-size: 16px; color: #FFD700;">💡 如何保存圖片：</strong>
        ${hintText}
      </div>
    `
    
    // 組裝 modal
    imgContainer.appendChild(img)
    imgContainer.appendChild(hint)
    modal.appendChild(closeBtn)
    modal.appendChild(imgContainer)
    
    // 添加到頁面
    document.body.appendChild(modal)
    
    // 點擊背景關閉
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal)
      }
    }
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
    messageEl.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md text-[#A90205] text-sm font-medium transition-all duration-300`
    
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
