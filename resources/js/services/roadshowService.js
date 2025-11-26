/**
 * Roadshow API 服務 
 */

// 從全局配置獲取 API 設定，如果沒有則使用默認值
const getApiConfig = () => {
    if (typeof window !== 'undefined' && window.endpoint) {
        return {
            baseURL: window.endpoint.baseURL || 'https://stg-line-crm.fanpokka.ai/api',
            authToken: window.endpoint.authToken || '123',
            timeout: window.endpoint.timeout || 30000
        };
    }
    
    // 默認配置
    return {
        baseURL: 'https://stg-line-crm.fanpokka.ai/api',
        authToken: '123',
        timeout: 30000
    };
};

export const roadshowService = {
    /**
     * 獲取模板列表
     */
    async getTemplates() {
        try {
            const config = getApiConfig();
            const url = `${config.baseURL}/roadshow/templates`;
            
            console.log('🔍 發送請求到:', url);
            console.log('🔐 使用認證token:', config.authToken);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                }
            });
            
            console.log('📡 響應狀態:', response.status, response.statusText);
            console.log('📡 響應頭:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // 先讀取響應文本，看看實際返回了什麼
            const responseText = await response.text();
            console.log('📡 響應內容前200字符:', responseText.substring(0, 200));
            
            // 檢查是否為HTML響應
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                console.error('❌ API返回HTML頁面，不是JSON數據');
                console.error('❌ 完整響應:', responseText);
                throw new Error('API返回HTML頁面，可能需要額外認證或端點錯誤');
            }
            
            const data = JSON.parse(responseText);
            return data;
        } catch (error) {
            console.error('❌ 獲取模板失敗:', error);
            return null;
        }
    },

    /**
     * 獲取用戶歷史圖片
     */
    async getUserHistory(userId) {
        try {
            const config = getApiConfig();
            const url = `${config.baseURL}/roadshow/user/${userId}/avatars`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ 獲取用戶歷史失敗:', error);
            
            // 返回測試數據
            return {
                success: true,
                result: {
                    avatars: [
                        {
                            task_id: 'test_001',
                            result_image: 'https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240',
                            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1小時前
                            template_id: 'wife',
                            status: 'completed'
                        },
                        {
                            task_id: 'test_002',
                            result_image: 'https://api.builder.io/api/v1/image/assets/TEMP/0864aa3462cae8e04607353cdec307e5671638af?width=240',
                            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小時前
                            template_id: 'play',
                            status: 'completed'
                        },
                        {
                            task_id: 'test_003',
                            result_image: 'https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240',
                            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3小時前
                            template_id: 'love',
                            status: 'completed'
                        }
                    ]
                }
            };
        }
    },

    /**
     * 上傳圖片生成頭像
     */
    async generateAvatar(formData) {
        try {
            const config = getApiConfig();
            const url = `${config.baseURL}/roadshow`;
            
            console.log('🚀 發送生成頭像請求到:', url);
            console.log('🔐 使用認證token:', config.authToken);
            
            // 檢查 FormData 內容
            console.log('📋 FormData 內容:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}:`, value);
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                },
                body: formData
            });
            
            console.log('📡 響應狀態:', response.status, response.statusText);
            console.log('📡 響應頭:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                // 嘗試讀取錯誤響應
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                let errorData = null;
                
                try {
                    const errorText = await response.text();
                    console.log('📡 錯誤響應內容:', errorText);
                    if (errorText) {
                        try {
                            errorData = JSON.parse(errorText);
                            errorMessage = errorData.message || errorData.result?.message || errorMessage;
                        } catch (parseError) {
                            errorMessage += ` - ${errorText}`;
                        }
                    }
                } catch (e) {
                    console.log('📡 無法讀取錯誤響應內容');
                }
                
                // 創建結構化的錯誤對象
                const structuredError = new Error(errorMessage);
                structuredError.status = response.status;
                structuredError.data = errorData;
                throw structuredError;
            }
            
            const data = await response.json();
            console.log('✅ 生成頭像成功:', data);
            console.log('📋 完整響應數據:', JSON.stringify(data, null, 2));
            
            // 檢查響應結構
            if (data.result) {
                console.log('📋 任務結果:', {
                    task_id: data.result.task_id,
                    id: data.result.id,
                    status: data.result.status,
                    template_id: data.result.template_id
                });
            }
            
            return data;
        } catch (error) {
            console.error('❌ 生成頭像失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message,
                    status: error.status || (error.message.includes('500') ? 500 : 0),
                    data: error.data
                }
            };
        }
    },

    /**
     * 檢查任務狀態
     */
    async checkTaskStatus(taskId) {
        try {
            const config = getApiConfig();
            const url = `${config.baseURL}/roadshow/status/${taskId}`;
            
            console.log('🔍 檢查任務狀態:', url);
            console.log('🔐 使用認證token:', config.authToken);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                }
            });
            
            console.log('📡 響應狀態:', response.status, response.statusText);
            console.log('📡 響應頭:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                // 嘗試讀取錯誤響應
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.text();
                    console.log('📡 錯誤響應內容:', errorData);
                    if (errorData) {
                        errorMessage += ` - ${errorData}`;
                    }
                } catch (e) {
                    console.log('📡 無法讀取錯誤響應內容');
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('✅ 任務狀態檢查成功:', data);
            console.log('📊 數據結構:', {
                hasSuccess: 'success' in data,
                hasStatus: 'status' in data,
                hasResult: 'result' in data,
                hasData: 'data' in data,
                topLevelKeys: Object.keys(data)
            });
            
            // 如果任務失敗，顯示詳細錯誤
            if (data.status === 'failed' || data.result?.status === 'failed' || data.data?.status === 'failed') {
                const failedData = data.result || data.data || data;
                console.error('⚠️ 任務狀態為失敗:', JSON.stringify(data, null, 2));
                console.error('📋 失敗詳情:', {
                    taskId: taskId,
                    status: failedData.status,
                    error_message: failedData.error_message,
                    error: failedData.error,
                    message: failedData.message,
                    template_id: failedData.template_id,
                    images: failedData.images,
                    fullFailedData: failedData
                });
                // 單獨輸出每個字段以便查看
                console.error('❌ 錯誤訊息:', failedData.error_message || '無錯誤訊息');
                console.error('❌ 錯誤對象:', failedData.error || '無錯誤對象');
                console.error('❌ 狀態訊息:', failedData.message || '無狀態訊息');
            }
            
            return data;
        } catch (error) {
            console.error('❌ 檢查任務狀態失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message,
                    status: error.message.includes('500') ? 500 : 0
                }
            };
        }
    },

    /**
     * 獲取圖片資源
     * 將生成出來的圖片用參數的方式帶入
     */
    async getImageResource(imageUrl, options = {}) {
        try {
            // 使用正確的 API 端點
            const url = 'https://stg-api.fanpokka.ai/api/static-resource';
            
            // 構建查詢參數
            const queryParams = new URLSearchParams();
            queryParams.append('url', imageUrl);
            
            // 添加可選參數
            if (options.scale) queryParams.append('scale', options.scale);
            if (options.format) queryParams.append('format', options.format);
            if (options.quality) queryParams.append('quality', options.quality);
            if (options.width) queryParams.append('width', options.width);
            if (options.height) queryParams.append('height', options.height);
            
            const fullUrl = `${url}?${queryParams.toString()}`;
            
            console.log('🖼️ 發送圖片資源請求到:', fullUrl);
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'image/*,application/json'
                }
            });
            
            console.log('📡 響應狀態:', response.status, response.statusText);
            console.log('📡 響應頭:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // 檢查響應類型
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.startsWith('image/')) {
                // 如果是圖片，返回 blob URL
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                console.log('✅ 圖片資源獲取成功，blob URL:', blobUrl);
                return {
                    success: true,
                    data: blobUrl,
                    type: 'image',
                    blob: blob,
                    originalUrl: imageUrl
                };
            } else {
                // 如果是 JSON 或其他格式
                const data = await response.json();
                console.log('✅ 圖片資源獲取成功:', data);
                return {
                    success: true,
                    data: data,
                    type: 'json',
                    originalUrl: imageUrl
                };
            }
        } catch (error) {
            console.error('❌ 獲取圖片資源失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message,
                    status: error.status || 0,
                    originalUrl: imageUrl
                }
            };
        }
    },

    /**
     * 處理生成後的圖片資源
     * 將生成出來的圖片用參數的方式帶入到新的 API
     */
    async processGeneratedImage(generatedImageUrl, processingOptions = {}) {
        try {
            console.log('🔄 處理生成的圖片:', generatedImageUrl);
            
            // 調用圖片資源 API
            const result = await this.getImageResource(generatedImageUrl, processingOptions);
            
            if (result.success) {
                console.log('✅ 圖片處理成功:', result);
                return result;
            } else {
                console.error('❌ 圖片處理失敗:', result.error);
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('❌ 處理生成圖片失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message,
                    originalUrl: generatedImageUrl
                }
            };
        }
    },

    /**
     * 上傳圖片到 GCS（透過後端 API）
     * 後端處理實際的 GCS 上傳，前端對接 API
     * 
     * @param {Object} params - 上傳參數
     * @param {Blob|File} params.image - 圖片檔案
     * @param {string} params.imageUrl - 圖片 URL（二選一）
     * @param {string} params.name - 用戶姓名（可選）
     * @param {string} params.email - 用戶 email（可選）
     * @param {string} params.phone - 用戶手機（可選）
     * @param {string} params.deviceMode - 裝置模式 ('kiosk' | 'mobile')
     * @param {string} params.userId - 用戶 ID
     * @returns {Promise<Object>} 上傳結果，包含 GCS URL
     */
    async uploadToGCS(params = {}) {
        try {
            const config = getApiConfig();
            // TODO: 等後端提供 API 端點後更新這個 URL
            const url = `${config.baseURL}/roadshow/upload-to-gcs`;
            
            console.log('☁️ 上傳圖片到 GCS...');
            console.log('📋 上傳參數:', {
                hasImage: !!params.image,
                imageUrl: params.imageUrl,
                name: params.name,
                email: params.email,
                phone: params.phone,
                deviceMode: params.deviceMode,
                userId: params.userId
            });

            // 構建 FormData
            const formData = new FormData();
            
            // 添加圖片（檔案或 URL）
            if (params.image) {
                formData.append('image', params.image);
            } else if (params.imageUrl) {
                formData.append('imageUrl', params.imageUrl);
            }
            
            // 添加用戶資訊
            if (params.name) formData.append('name', params.name);
            if (params.email) formData.append('email', params.email);
            if (params.phone) formData.append('phone', params.phone);
            if (params.deviceMode) formData.append('deviceMode', params.deviceMode);
            if (params.userId) formData.append('userId', params.userId);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                },
                body: formData
            });

            console.log('📡 響應狀態:', response.status, response.statusText);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // 無法解析錯誤內容
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ GCS 上傳成功:', data);
            
            return {
                success: true,
                gcsUrl: data.url || data.gcsUrl || data.imageUrl,
                shortUrl: data.shortUrl,
                data: data
            };
        } catch (error) {
            console.error('❌ GCS 上傳失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message
                }
            };
        }
    },

    /**
     * 發送結果通知（發送簡訊給用戶）
     * 
     * @param {Object} params - 通知參數
     * @param {string} params.phone - 手機號碼
     * @param {string} params.imageUrl - 圖片 URL
     * @param {string} params.shortUrl - 短網址
     * @returns {Promise<Object>} 發送結果
     */
    async sendResultNotification(params = {}) {
        try {
            const config = getApiConfig();
            // TODO: 等後端提供 API 端點後更新這個 URL
            const url = `${config.baseURL}/roadshow/send-notification`;
            
            console.log('📱 發送結果通知...');
            console.log('📋 通知參數:', params);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                },
                body: JSON.stringify({
                    phone: params.phone,
                    imageUrl: params.imageUrl,
                    shortUrl: params.shortUrl
                })
            });

            console.log('📡 響應狀態:', response.status, response.statusText);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // 無法解析錯誤內容
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ 通知發送成功:', data);
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('❌ 通知發送失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message
                }
            };
        }
    },

    /**
     * 發送簡訊給用戶
     * 
     * @param {Object} params - 簡訊參數
     * @param {string} params.name - 用戶姓名 (required)
     * @param {string} params.phone - 手機號碼 (required)
     * @param {string|null} params.email - 電子郵件 (required, 可為 null)
     * @param {string} params.img_url - 圖片 URL (required)
     * @returns {Promise<Object>} 發送結果
     */
    async sendSMS(params = {}) {
        try {
            const config = getApiConfig();
            // SMS API 使用 production 端點
            // 在開發環境中使用相對路徑（通過 vite proxy），生產環境使用完整 URL
            const isDevelopment = typeof window !== 'undefined' && 
                                 (window.location.hostname === 'localhost' || 
                                  window.location.hostname === '127.0.0.1' ||
                                  window.location.port !== '');
            const url = isDevelopment 
                ? '/api/roadshow/sms'  // 開發環境：使用相對路徑，通過 vite proxy
                : 'https://pp.2025.aitago.tw/api/roadshow/sms';  // 生產環境：使用完整 URL
            
            console.log('📱 發送簡訊...');
            console.log('📋 簡訊參數:', params);
            console.log('🌐 使用端點:', url);
            console.log('🔧 環境模式:', isDevelopment ? '開發環境 (使用 proxy)' : '生產環境');

            // 處理 email：空字串轉為 null
            const emailValue = params.email && params.email.trim() !== '' ? params.email : null;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                },
                body: JSON.stringify({
                    name: params.name,
                    phone: params.phone,
                    email: emailValue,
                    img_url: params.img_url
                })
            });

            console.log('📡 響應狀態:', response.status, response.statusText);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // 無法解析錯誤內容
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ 簡訊發送成功:', data);
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('❌ 簡訊發送失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message
                }
            };
        }
    }
};
