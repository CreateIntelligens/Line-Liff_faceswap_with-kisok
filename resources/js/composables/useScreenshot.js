import html2canvas from 'html2canvas'

export function useScreenshot() {
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
    
    // 檢查是否有圖片是佔位符
    const images = container.querySelectorAll('img')
    let hasPlaceholder = false
    images.forEach((img, index) => {
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
    const originalCanvas = await html2canvas(container, {
      backgroundColor: null,  // 使用透明背景，保持原始背景
      scale: 2,        // 2 倍解析度，平衡品質與效能
      logging: false,
      useCORS: false,         // 關閉 CORS（因為所有圖片都無法通過 CORS）
      allowTaint: true,       // 允許跨域圖片（tainted canvas）
      foreignObjectRendering: false, // 關閉，避免黑屏問題
      width: container.scrollWidth,   // 使用完整寬度
      height: container.scrollHeight, // 使用完整高度
      windowWidth: window.innerWidth,  // 保持視窗寬度
      windowHeight: window.innerHeight, // 保持視窗高度
      // 嘗試使用代理（如果配置了）
      proxy: hasFailedImages ? undefined : undefined, // 目前沒有可用的代理
      // 忽略圖片載入錯誤，繼續截圖
      ignoreElements: (element) => {
        // 不忽略任何元素，讓 html2canvas 嘗試渲染所有內容
        return false
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

  // ==========================================
  // 👇 新增：設備檢測輔助函數
  // ==========================================
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  }

  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // ==========================================
  // 👇 修改：下載截圖到本機 (核心邏輯修復)
  // ==========================================
  async function downloadToLocal(blob, filename = 'screenshot') {
    const file = new File([blob], `${filename}.png`, { type: 'image/png' })

    // 1. 手機端優先嘗試使用 Web Share API (喚起系統分享選單)
    // 這在 Line 瀏覽器、Safari、Chrome Mobile 體驗最好
    if (navigator.canShare && navigator.canShare({ files: [file] }) && isMobile()) {
      try {
        console.log('📱 檢測到行動裝置，嘗試喚起系統分享選單')
        await navigator.share({
          files: [file],
          title: '下載圖片',
          text: '您的 AI 變臉結果'
        })
        return // 分享成功，結束
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('⚠️ 分享失敗，降級使用下載/開啟方法:', error)
        } else {
          console.log('ℹ️ 使用者取消了分享')
          return 
        }
      }
    }

    // 2. 處理 iOS 特殊情況 (iOS Safari 不支援 download 屬性)
    const url = URL.createObjectURL(blob)
    
    if (isIOS()) {
      console.log('🍎 檢測到 iOS，使用新視窗開啟模式')
      
      // 嘗試開啟新視窗
      const newWindow = window.open(url, '_blank')
      
      // 如果被擋廣告攔截器阻擋 (newWindow 為 null)，則在當前視窗跳轉
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
         console.warn('⚠️ 彈出視窗被攔截，正在當前視窗導向圖片...')
         window.location.href = url
      }
      
      showMessage('請長按圖片並選擇「加入照片」', 'info')
      
      // 注意：在 iOS 上不能立即 revokeObjectURL，否則新視窗會圖片失效
      // 設定一個較長的 timeout 來清理
      setTimeout(() => URL.revokeObjectURL(url), 60000)
      return
    }

    // 3. PC / Android 標準下載模式 (使用 a 標籤)
    console.log('💻 使用標準下載模式')
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('📥 截圖已觸發下載')
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

  // ==========================================
  // 👇 修改：直接下載圖片 (重用 downloadToLocal 邏輯)
  // ==========================================
  async function downloadImage(imageUrl, filename = 'faceswap-result') {
    try {
      console.log('📥 開始下載圖片流程:', imageUrl)
      showMessage('準備下載中...', 'info')
      
      // 1. 獲取圖片 Blob
      const response = await fetch(imageUrl, {
        method: 'GET',
        // 嘗試繞過 CORS，如果失敗可能需要後端配合
        mode: 'cors', 
        credentials: 'omit'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const blob = await response.blob()
      
      // 2. 重用 downloadToLocal 的邏輯 (包含 iOS 處理和 Web Share)
      await downloadToLocal(blob, filename)
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ 圖片下載流程失敗:', error)
      
      // 3. 最後的備案：直接開啟 URL
      // 這通常發生在 CORS 錯誤導致無法 fetch blob 時
      try {
        console.warn('⚠️ 降級方案：直接在新視窗開啟 URL')
        window.open(imageUrl, '_blank')
        showMessage('請長按圖片保存', 'info')
        return { success: true, method: 'fallback_open' }
      } catch (e) {
        showMessage('下載失敗，請截圖保存', 'error')
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
