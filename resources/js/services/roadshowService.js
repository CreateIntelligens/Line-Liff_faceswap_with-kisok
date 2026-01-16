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
            const url = `${config.baseURL}/face-swap/templates`;
            
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
            console.log('📋 完整模板數據:', JSON.stringify(data, null, 2));
            
            // 新 API 返回的是模板數組，需要轉換為前端可用的格式
            return {
                success: true,
                templates: data // 直接返回數組
            };
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
            const url = `${config.baseURL}/face-swap/user/${userId}/avatars`;
            
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
            const url = `${config.baseURL}/face-swap`;
            
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
            const url = `${config.baseURL}/face-swap/status/${taskId}`;
            
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
            // 使用配置中的 API 端點
            const url = window.endpoint?.imageProcessApi || 'https://api.uat.tatung2025.aitago.tw/api/static-resource';
            
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
            // 使用正確的 API 端點：POST /api/face-swap/files
            const url = `${config.baseURL}/face-swap/files`;
            
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
            
            // 添加圖片檔案（API 文檔要求參數名為 'file'）
            if (params.image) {
                formData.append('file', params.image);
            } else if (params.imageUrl) {
                // 如果提供的是 URL，需要先下載圖片
                console.warn('⚠️ 目前不支援從 URL 上傳，請提供圖片檔案');
                throw new Error('請提供圖片檔案，不支援從 URL 上傳');
            } else {
                throw new Error('請提供圖片檔案或 URL');
            }
            
            // 可選：添加用戶資訊（如果 API 支援）
            if (params.userId) formData.append('userId', params.userId);
            if (params.name) formData.append('name', params.name);
            if (params.email) formData.append('email', params.email);
            if (params.phone) formData.append('phone', params.phone);
            if (params.deviceMode) formData.append('deviceMode', params.deviceMode);
            
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
            
            // API 返回格式：{ "path": "string" }
            return {
                success: true,
                gcsUrl: data.path || data.url || data.gcsUrl || data.imageUrl,
                path: data.path, // 保存原始 path
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
     * @param {string} [params.name] - 用戶姓名 (手機版必填，Kiosk 模式不需要)
     * @param {string} params.phone - 手機號碼 (required)
     * @param {string|null} [params.email] - 電子郵件 (手機版可選，Kiosk 模式不需要)
     * @param {string} params.img_url - 圖片 URL (required)
     * @param {boolean} [params.fromKiosk] - 是否為 Kiosk 模式 (optional)
     * @returns {Promise<Object>} 發送結果
     */
    async sendSMS(params = {}) {
        try {
            const config = getApiConfig();
            // SMS API 使用 production 端點
            // 在開發環境中使用相對路徑（通過 vite proxy），生產環境使用完整 URL

            // 根據 fromKiosk 參數決定 URL 和請求 body
            const isKioskMode = params.fromKiosk === true;
            const url = config.baseURL + '/roadshow/sms' + (isKioskMode ? '?fromKiosk=true' : '');
            
            console.log('📱 發送簡訊...');
            console.log('📋 簡訊參數:', params);
            console.log('🌐 使用端點:', url);
            console.log('🖥️ Kiosk 模式:', isKioskMode);

            // 構建請求 body
            let requestBody;
            if (isKioskMode) {
                // Kiosk 模式：只傳 phone 和 img_url
                requestBody = {
                    phone: params.phone,
                    img_url: params.img_url,
                    fromKiosk: true
                };
            } else {
                // 手機版：傳送所有欄位
                // 處理 email：空字串轉為 null
                const emailValue = params.email && params.email.trim() !== '' ? params.email : null;
                requestBody = {
                    name: params.name,
                    phone: params.phone,
                    email: emailValue,
                    img_url: params.img_url
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                },
                body: JSON.stringify(requestBody)
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

            // 處理響應：可能是空響應或 JSON
            let data = null;
            const contentType = response.headers.get('content-type');
            const responseText = await response.text();
            
            if (responseText && contentType && contentType.includes('application/json')) {
                try {
                    data = JSON.parse(responseText);
                    console.log('✅ 簡訊發送成功:', data);
                } catch (e) {
                    console.warn('⚠️ 響應不是有效的 JSON，但狀態碼為 200，視為成功');
                    // 即使解析失敗，如果狀態碼是 200，也視為成功
                }
            } else if (response.status === 200) {
                // 空響應但狀態碼為 200，視為成功
                console.log('✅ 簡訊發送成功（空響應）');
            }
            
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
    },

    /**
     * 提交表單資料
     * 
     * @param {Object} params - 表單參數
     * @param {string} params.name - 用戶姓名 (required)
     * @param {string} params.phone - 手機號碼 (required)
     * @param {string|null} [params.email] - 電子郵件 (optional)
     * @returns {Promise<Object>} 提交結果
     */
    async saveForm(params = {}) {
        try {
            const config = getApiConfig();
            const url = config.baseURL + '/roadshow/form';
            
            console.log('📝 提交表單...');
            console.log('📋 表單參數:', params);
            console.log('🌐 使用端點:', url);

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
                    email: emailValue
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

            // 處理響應：可能是空響應或 JSON
            let data = null;
            const contentType = response.headers.get('content-type');
            const responseText = await response.text();
            
            if (responseText && contentType && contentType.includes('application/json')) {
                try {
                    data = JSON.parse(responseText);
                    console.log('✅ 表單提交成功:', data);
                } catch (e) {
                    console.warn('⚠️ 響應不是有效的 JSON，但狀態碼為 200，視為成功');
                    // 即使解析失敗，如果狀態碼是 200，也視為成功
                }
            } else if (response.status === 200) {
                // 空響應但狀態碼為 200，視為成功
                console.log('✅ 表單提交成功（空響應）');
            }
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('❌ 表單提交失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message
                }
            };
        }
    }
};
