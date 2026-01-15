// 應用程式配置
export const appConfig = {
  // LIFF 配置
  liffUrl: window.location.origin, // 預設使用當前域名，正式環境需要改為 LIFF URL
  // 例如：'https://liff.line.me/YOUR_LIFF_ID'
  
  // 使用量限制
  maxUsageLimit: 4,
  
  // API 配置
  apiBaseUrl: 'https://line.uat.tatung2025.aitago.tw/api',
  imageProcessApi: 'https://stg-api.fanpokka.ai/api/static-resource',
  
  // 圖片處理參數
  imageProcessParams: {
    scale: 1.5,
    format: 'jpg',
    quality: 85,
    width: 600,
    height: 450
  }
}

// 取得 LIFF URL（包含參數）
export function getLiffUrl(params = {}) {
  const url = new URL(appConfig.liffUrl)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })
  return url.toString()
}
