import '../css/app.css';  // 引入 Tailwind CSS
import { createApp } from 'vue'
import FaceSwapApp from './faceswap/App.vue'
import { useDebugPanel } from './composables/useDebugPanel.js'

const components = {
  FaceSwapApp,
  // AnotherComponent,
}

// 初始化調試面板（僅在開發模式或調試模式下啟用）
const initDebugPanel = () => {
  // 檢查是否啟用調試模式（可以通過 URL 參數 ?debug=true 啟用）
  const urlParams = new URLSearchParams(window.location.search)
  const enableDebug = urlParams.get('debug') === 'true' || 
                      window.endpoint?.debug === true ||
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1'
  
  if (enableDebug) {
    const { initDebugPanel } = useDebugPanel()
    // 等待 DOM 準備好
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initDebugPanel()
      })
    } else {
      initDebugPanel()
    }
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

