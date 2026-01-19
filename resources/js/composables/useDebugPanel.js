/**
 * 調試面板工具
 * 用於在手機上顯示調試信息，因為無法直接查看控制台
 */

const debugMessages = []
let isDebugPanelVisible = false
const maxMessages = 50 // 最多顯示 50 條消息

// 調試面板樣式
const panelStyle = `
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  color: #fff;
  font-family: monospace;
  font-size: 11px;
  max-height: 50vh;
  overflow-y: auto;
  z-index: 99999;
  padding: 10px;
  border-top: 2px solid #333;
  display: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
`

const toggleButtonStyle = `
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border: 2px solid #fff;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
`

let debugPanel = null
let toggleButton = null
let originalConsole = {}

export function useDebugPanel() {
  // 添加調試消息
  function addMessage(type, message, data = null) {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = {
      type, // 'log', 'error', 'warn', 'info'
      message,
      data,
      timestamp
    }
    
    debugMessages.push(logEntry)
    
    // 限制消息數量
    if (debugMessages.length > maxMessages) {
      debugMessages.shift()
    }
    
    // 同時輸出到原始 console
    if (originalConsole[type]) {
      originalConsole[type](`[${timestamp}]`, message, data || '')
    }
    
    // 更新面板顯示
    updatePanel()
  }

  // 更新面板顯示
  function updatePanel() {
    if (!debugPanel) return
    
    const messagesHtml = debugMessages.map(msg => {
      const color = {
        log: '#fff',
        error: '#ff6b6b',
        warn: '#ffd93d',
        info: '#6bcf7f'
      }[msg.type] || '#fff'
      
      const dataStr = msg.data ? `\n  ${JSON.stringify(msg.data, null, 2)}` : ''
      
      return `
        <div style="margin: 5px 0; padding: 5px; border-left: 3px solid ${color}; background: rgba(255,255,255,0.05);">
          <span style="color: #999;">[${msg.timestamp}]</span>
          <span style="color: ${color}; font-weight: bold;">[${msg.type.toUpperCase()}]</span>
          <span style="color: #fff;">${escapeHtml(msg.message)}</span>
          ${dataStr ? `<pre style="margin: 5px 0 0 20px; color: #ccc; font-size: 10px; white-space: pre-wrap; word-break: break-all;">${escapeHtml(dataStr)}</pre>` : ''}
        </div>
      `
    }).join('')
    
    debugPanel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #333; flex-wrap: wrap; gap: 5px;">
        <strong style="color: #fff; flex: 1; min-width: 100px;">🐛 調試面板 (${debugMessages.length})</strong>
        <button onclick="window.__debugPanelClear()" style="background: #ff6b6b; color: #fff; border: none; padding: 8px 12px; border-radius: 3px; cursor: pointer; touch-action: manipulation; font-size: 12px;">清除</button>
        <button onclick="window.__debugPanelToggle()" style="background: #333; color: #fff; border: none; padding: 8px 12px; border-radius: 3px; cursor: pointer; touch-action: manipulation; font-size: 12px;">關閉</button>
      </div>
      <div style="max-height: calc(50vh - 70px); overflow-y: auto; -webkit-overflow-scrolling: touch;">
        ${messagesHtml || '<div style="color: #999; text-align: center; padding: 20px;">暫無調試信息</div>'}
      </div>
    `
  }

  // HTML 轉義
  function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // 顯示/隱藏面板
  function togglePanel() {
    isDebugPanelVisible = !isDebugPanelVisible
    if (debugPanel) {
      debugPanel.style.display = isDebugPanelVisible ? 'block' : 'none'
    }
  }

  // 清除所有消息
  function clearMessages() {
    debugMessages.length = 0
    updatePanel()
  }

  // 初始化調試面板
  function initDebugPanel() {
    // 檢查是否已存在
    if (document.getElementById('debug-panel')) {
      return
    }

    // 創建切換按鈕
    toggleButton = document.createElement('button')
    toggleButton.id = 'debug-toggle-button'
    toggleButton.innerHTML = '🐛'
    toggleButton.style.cssText = toggleButtonStyle
    toggleButton.onclick = togglePanel
    document.body.appendChild(toggleButton)

    // 創建調試面板
    debugPanel = document.createElement('div')
    debugPanel.id = 'debug-panel'
    debugPanel.style.cssText = panelStyle
    document.body.appendChild(debugPanel)

    // 綁定全局函數
    window.__debugPanelToggle = togglePanel
    window.__debugPanelClear = clearMessages

    // 劫持 console 方法
    originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    }

    console.log = (...args) => {
      originalConsole.log(...args)
      addMessage('log', args.join(' '), args.length > 1 ? args : null)
    }

    console.error = (...args) => {
      originalConsole.error(...args)
      addMessage('error', args.join(' '), args.length > 1 ? args : null)
    }

    console.warn = (...args) => {
      originalConsole.warn(...args)
      addMessage('warn', args.join(' '), args.length > 1 ? args : null)
    }

    console.info = (...args) => {
      originalConsole.info(...args)
      addMessage('info', args.join(' '), args.length > 1 ? args : null)
    }

    // 監聽未捕獲的錯誤
    window.addEventListener('error', (event) => {
      addMessage('error', `未捕獲的錯誤: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      })
    })

    // 監聽 Promise 未處理的拒絕
    window.addEventListener('unhandledrejection', (event) => {
      addMessage('error', `未處理的 Promise 拒絕: ${event.reason}`, {
        reason: event.reason,
        stack: event.reason?.stack
      })
    })

    addMessage('info', '調試面板已初始化', null)
  }

  // 清理
  function destroyDebugPanel() {
    if (toggleButton) {
      toggleButton.remove()
      toggleButton = null
    }
    if (debugPanel) {
      debugPanel.remove()
      debugPanel = null
    }
    
    // 恢復原始 console
    if (originalConsole.log) {
      console.log = originalConsole.log
      console.error = originalConsole.error
      console.warn = originalConsole.warn
      console.info = originalConsole.info
    }
  }

  return {
    addMessage,
    togglePanel,
    clearMessages,
    initDebugPanel,
    destroyDebugPanel,
    get isDebugPanelVisible() { return isDebugPanelVisible },
    get debugMessages() { return [...debugMessages] }
  }
}
