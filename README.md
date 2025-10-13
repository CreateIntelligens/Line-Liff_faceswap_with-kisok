# 換臉應用 Face Swap Application

一個基於 LINE LIFF 平台的 AI 換臉應用，支援多種經典節目模板，讓用戶可以輕鬆將自己的臉部與知名節目畫面結合。

## ✨ 功能特色

### 核心功能
- 🎭 **AI 智能換臉** - 使用先進的 AI 技術進行臉部替換
- 🎨 **多種模板選擇** - 提供 4 種經典節目模板
  - 綜藝玩很大
  - 犀利人妻
  - 命中註定我愛你
  - 超級夜總會
- 👤 **多角色支援** - 某些模板支援選擇不同角色進行換臉
- 📱 **雙平台支援** - 同時支援 LINE 行動版與 PC 網頁版

### LINE LIFF 整合
- ✅ 自動獲取 LINE 用戶 ID
- ✅ 支援訪客模式（未登入用戶）
- ✅ 好友關係檢測
- ✅ 完整的用戶體驗追蹤

### 操作方式
- 📸 **LINE 模式** - 從相簿選擇照片或即時拍照
- 💻 **PC 模式** - 使用網路攝影機即時拍攝
- 📜 **歷史記錄** - 查看和管理過往生成的圖片
- 💾 **圖片下載** - 支援下載生成結果到本地

## 🚀 快速開始

### 環境需求

- Node.js 16.0 或更高版本
- npm 或 yarn 套件管理器
- LINE LIFF 應用（用於 LINE 平台整合）

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/Daniel-Yang1021/fouse.git
cd fouse/line-liff-faceSwap
```

2. **安裝依賴**
```bash
npm install
```

3. **配置環境**

編輯 `index.html` 文件，設置您的 API 和 LIFF 配置：

```javascript
window.endpoint = {
  // API 配置
  baseURL: 'https://your-api-server.com/api',

  // LIFF 配置
  liffId: 'YOUR_LIFF_ID',        // 替換為您的 LIFF ID
  basicId: 'YOUR_BASIC_ID',      // 替換為您的 Basic ID
  enableLiff: true,              // 是否啟用 LIFF

  // 可選配置
  debug: false,                  // 是否啟用調試模式
  timeout: 30000                 // API 請求超時時間（毫秒）
};
```

4. **啟動開發伺服器**
```bash
npm run dev
```

5. **打包正式版本**
```bash
npm run build
```

打包後的檔案將輸出到 `dist/` 目錄。

## 📁 專案結構

```
line-liff-faceSwap/
├── dist/                          # 打包輸出目錄
├── public/                        # 靜態資源
│   └── images/                    # 公開圖片資源
├── resources/                     # 開發資源
│   ├── css/                       # 樣式表
│   ├── images/                    # 開發用圖片
│   └── js/                        # JavaScript 源碼
│       ├── faceswap/              # 換臉應用主要邏輯
│       │   ├── App.vue            # 主應用組件
│       │   └── components/        # Vue 組件
│       │       ├── FaceSwapHomepage.vue              # 首頁
│       │       ├── FaceSwapTemplateSelection.vue     # 模板選擇
│       │       ├── FaceSwapCharacterSelection.vue    # 角色選擇（PC）
│       │       ├── FaceSwapUpload.vue                # 照片上傳（LINE）
│       │       ├── FaceSwapCameraCapture.vue         # 相機拍攝（PC）
│       │       ├── FaceSwapResult.vue                # 結果顯示
│       │       ├── FaceSwapHistory.vue               # 歷史記錄
│       │       ├── HistoryDetailModal.vue            # 歷史詳情
│       │       ├── QRCodeModal.vue                   # QR Code 顯示
│       │       └── UsageCounter.vue                  # 使用次數統計
│       ├── services/              # 服務層
│       │   ├── liffService.js     # LIFF SDK 封裝
│       │   └── roadshowService.js # API 服務
│       ├── composables/           # Vue 組合式函數
│       │   └── useScreenshot.js   # 截圖功能
│       ├── config/                # 配置文件
│       │   └── imageUrls.js       # 圖片 URL 配置
│       └── app.js                 # 應用入口
├── index.html                     # HTML 入口文件
├── vite.config.js                 # Vite 配置
├── package.json                   # 專案配置
├── tailwind.config.cjs            # Tailwind CSS 配置
└── README.md                      # 專案說明文件
```

## 🔧 技術棧

### 前端框架
- **Vue 3** - 漸進式 JavaScript 框架
- **Vite 5** - 快速的構建工具

### UI 樣式
- **Tailwind CSS** - 實用優先的 CSS 框架

### LINE 整合
- **@line/liff** - LINE Front-end Framework SDK

### 核心功能庫
- **axios** - HTTP 客戶端
- **html2canvas** - 網頁截圖功能
- **qrcode** - QR Code 生成

## 💡 使用指南

### LINE 模式使用流程

1. 在 LINE 中打開 LIFF 應用
2. 點擊「開始換臉」進入模板選擇
3. 選擇喜歡的節目模板
4. 上傳照片或拍攝新照片
5. 等待 AI 生成換臉結果
6. 下載或分享生成的圖片

### PC 模式使用流程

1. 在瀏覽器中打開應用（網址後加上 `?mode=pc`）
2. 點擊「開始換臉」進入模板選擇
3. 選擇喜歡的節目模板
4. 選擇要替換的角色（部分模板支援）
5. 使用攝影機拍攝照片
6. 等待 AI 生成換臉結果
7. 下載生成的圖片

### 查看歷史記錄

- LINE 模式：在上傳頁面點擊「歷史記錄」按鈕
- 所有生成的圖片都會保存在歷史記錄中
- 可以查看、下載或重新生成歷史圖片

## 🔐 LIFF 設定

### 取得 LIFF ID

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 建立或選擇您的 Provider
3. 建立新的 LIFF 應用程式
4. 設定以下項目：
   - **Endpoint URL**: 您的應用部署網址
   - **Scope**: 選擇 `profile`, `openid`
   - **Bot link feature**: 根據需求選擇

5. 複製 LIFF ID 並更新到 `index.html`

### LIFF 環境偵測

應用會自動偵測執行環境：

- **LIFF 環境內** - 取得真實用戶 ID
- **訪客模式** - 使用臨時訪客 ID
- **開發模式** - 使用測試 ID "abc"
- **PC 模式** - `enableLiff: false` 或 URL 參數 `?mode=pc`

## 🎯 API 整合

### 必要的 API 端點

應用需要後端提供以下 API：

1. **生成換臉圖片**
   - POST `/api/generate-avatar`
   - 參數：`userId`, `file`, `template_id`, `target_face_index`

2. **查詢歷史記錄**
   - GET `/api/user-history/{userId}`
   - 返回用戶的所有生成記錄

3. **查詢任務狀態**
   - GET `/api/task-status/{taskId}`
   - 返回生成任務的當前狀態

### API 配置

在 `index.html` 中配置 API 基礎 URL：

```javascript
window.endpoint = {
  baseURL: 'https://your-api-server.com/api',
  // ... 其他配置
};
```

## 🐛 故障排除

### 常見問題

#### LIFF 初始化失敗

**症狀**: 控制台顯示 "LIFF 初始化失敗"

**解決方案**:
- 檢查 LIFF ID 是否正確
- 確認 LIFF 應用配置完整
- 檢查網路連線狀態

#### 照片上傳失敗

**症狀**: 無法上傳照片或生成失敗

**解決方案**:
- 確認照片格式正確（建議 JPG/PNG）
- 檢查照片大小（建議小於 10MB）
- 確認 API 伺服器運作正常

#### PC 模式無法啟動攝影機

**症狀**: 無法使用攝影機拍照

**解決方案**:
- 檢查瀏覽器攝影機權限
- 確認使用 HTTPS 協議（HTTP 無法使用攝影機）
- 嘗試其他瀏覽器

## 📝 開發指南

### 啟用調試模式

在 `index.html` 中設置：

```javascript
window.endpoint = {
  // ...
  debug: true,  // 啟用調試日誌
};
```

調試模式會在控制台輸出詳細的執行日誌。

### 添加新模板

1. 在 API 後端添加新的模板圖片
2. 更新 `FaceSwapTemplateSelection.vue` 組件
3. 在 `imageUrls.js` 中添加模板圖片 URL
4. 更新模板 ID 映射關係

### 自定義樣式

本專案使用 Tailwind CSS，可以通過修改 `tailwind.config.cjs` 來自定義主題：

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // 自定義顏色
      }
    }
  }
}
```

## 📄 授權

本專案為私有專案 (Private)。

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request。

## 📞 聯絡方式

如有任何問題，請透過 GitHub Issues 聯絡。

---

**注意事項**:
- 本應用需要配合後端 API 使用
- 生成結果依賴 AI 模型品質
- 請遵守 LINE 平台使用規範
- 保護用戶隱私，妥善處理個人照片
