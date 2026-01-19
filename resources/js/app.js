import '../css/app.css';  // 引入 Tailwind CSS
import { createApp } from 'vue'
import FaceSwapApp from './faceswap/App.vue'
import { useDebugPanel } from './composables/useDebugPanel.js'

const components = {
  FaceSwapApp,
  // AnotherComponent,
}

// 初始化調試面板（可以通過 URL 參數 ?debug=true 啟用，手機測試必備）
const initDebugPanel = () => {
  // 檢查是否啟用調試模式（可以通過 URL 參數 ?debug=true 啟用）
  const urlParams = new URLSearchParams(window.location.search)
  const enableDebug = urlParams.get('debug') === 'true' || 
                      urlParams.get('debug') === '1' ||
                      window.endpoint?.debug === true ||
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1'
  
  if (enableDebug) {
    console.log('🐛 調試面板已啟用（手機測試模式）')
    const { initDebugPanel } = useDebugPanel()
    // 等待 DOM 準備好
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initDebugPanel()
      })
    } else {
      // 延遲一下確保所有組件都已初始化
      setTimeout(() => {
        initDebugPanel()
      }, 500)
    }
  } else {
    console.log('💡 提示：在 URL 後加上 ?debug=true 可啟用調試面板（手機測試必備）')
  }
}

// 初始化調試面板
initDebugPanel()

const el = document.getElementById('vue-root')

if (el) {
  const componentName = el.dataset.component
  const Component = components[componentName]

  if (Component) {
    createApp(Component).mount(el)
  } else {
    console.warn(`Vue component "${componentName}" not found.`)
  }
}

