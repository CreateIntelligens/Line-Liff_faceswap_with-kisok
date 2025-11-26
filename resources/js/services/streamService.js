/**
 * 串流服務
 * 用於 Kiosk 模式的視訊串流播放
 */
import '../lib/srs.sdk.js'

// 串流配置 - 可以在 window.endpoint 中配置
const getStreamConfig = () => {
  if (typeof window !== 'undefined' && window.endpoint) {
    return {
      baseUrl: window.endpoint.streamBaseUrl || 'https://talk-demo.aitago.tw:1986',
      defaultStreamName: window.endpoint.streamName || 'livestream'
    }
  }
  
  return {
    baseUrl: 'https://talk-demo.aitago.tw:1986',
    defaultStreamName: 'livestream'
  }
}

export class StreamService {
  constructor(videoElement) {
    this.sdk = null
    this.videoElement = videoElement
  }

  /**
   * 開始播放串流
   * @param {string} sessionId - 會話 ID，用於區分不同的串流
   * @returns {Promise<void>}
   */
  startPlay(sessionId = '0') {
    if (!this.videoElement) {
      return Promise.reject(new Error('No video element provided'))
    }

    this.videoElement.style.display = ''
    
    if (this.sdk) {
      this.sdk.close()
    }

    // 確保 SDK 可用
    if (typeof window.SrsRtcWhipWhepAsync === 'undefined') {
      return Promise.reject(new Error('SRS SDK not loaded'))
    }

    this.sdk = new window.SrsRtcWhipWhepAsync()
    this.videoElement.srcObject = this.sdk.stream

    const config = getStreamConfig()
    const streamName = sessionId === '0' 
      ? config.defaultStreamName 
      : `${config.defaultStreamName}${sessionId}`
    
    const url = `${config.baseUrl}/rtc/v1/whep/?app=live&stream=${streamName}`
    
    console.log('🎥 串流服務開始播放:', url)
    
    return this.sdk.play(url)
  }

  /**
   * 關閉串流
   */
  close() {
    if (this.sdk) {
      console.log('🎥 串流服務關閉')
      this.sdk.close()
      this.sdk = null
    }
  }

  /**
   * 截取當前視訊畫面
   * @returns {Promise<Blob>} 圖片 Blob
   */
  captureFrame() {
    return new Promise((resolve, reject) => {
      if (!this.videoElement) {
        reject(new Error('No video element'))
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = this.videoElement.videoWidth || 1080
      canvas.height = this.videoElement.videoHeight || 1920
      
      ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('📸 視訊畫面截取成功')
          resolve(blob)
        } else {
          reject(new Error('Failed to capture frame'))
        }
      }, 'image/jpeg', 0.95)
    })
  }
}

export default StreamService

