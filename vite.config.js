// vite.config.js - 開發環境 CORS 解決方案
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
        },
    },
    publicDir: 'public',
    server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: [
            'localhost',
            '127.0.0.1',
            '069701b18b85.ngrok-free.app',
            'c17a248f13e7.ngrok-free.app',
            '2ee81e9276d5.ngrok-free.app',
            '.ngrok-free.app',
        ],
        proxy: {
            // 代理 API 請求到後端
            '/api': {
                target: 'https://stg-line-crm.fanpokka.ai',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path
            },
            // 代理上傳請求
            '/partner': {
                target: 'https://stg-line-crm.fanpokka.ai',
                changeOrigin: true,
                secure: true
            },
            // 代理靜態資源
            '/static-resource': {
                target: 'https://stg-api.fanpokka.ai/api',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/static-resource/, '/static-resource')
            }
        }
    },
    // 只在生產模式下定義這些變數，避免干擾開發模式
    ...(command === 'build' ? {
        define: {
            // 明確定義環境變數以避免生產建置錯誤
            '__DEFINES__': '{}',
            '__HMR_CONFIG_NAME__': '"vite"',
            '__BASE__': '"/"',
            '__SERVER_HOST__': 'undefined',
            '__HMR_PROTOCOL__': 'undefined',
            '__HMR_PORT__': 'undefined',
            '__HMR_HOSTNAME__': 'undefined',
            '__HMR_BASE__': '"/"',
            '__HMR_TIMEOUT__': '30000',
            '__HMR_ENABLE_OVERLAY__': 'true',
            '__HMR_DIRECT_TARGET__': 'undefined',
            '__WS_TOKEN__': '""',
            'import.meta.env': '{}',
            'import.meta.env.MODE': '"production"',
            'import.meta.env.VITE_API_BASE_URL': 'undefined',
            'import.meta.env.VITE_API_TIMEOUT': 'undefined',
            'import.meta.url': '"/"',
            'process.env': '{}'
        }
    } : {}),
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: (assetInfo) => {
                    if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
                        return 'images/[name].[hash][extname]'
                    }
                    return 'assets/[name].[hash][extname]'
                }
            },
            // 排除開發相關的依賴，確保不會洩漏到生產環境
            external: (id) => {
                // 排除所有 HMR 和開發相關的模組
                if (id.includes('/@vite/client') ||
                    id.includes('/vite/dist/client') ||
                    id.includes('vite/client') ||
                    id.includes('__vite') ||
                    id.includes('/@id/__x00__virtual:vite')) {
                    return true;
                }
                return false;
            }
        },
        assetsInlineLimit: 4096,
        copyPublicDir: false,
        // 確保徹底移除開發相關代碼
        minify: 'terser',
        terserOptions: {
            compress: {
                // 保留 console.log 用於調試
                drop_console: false,
                drop_debugger: true,
                // 移除 HMR 相關代碼
                dead_code: true
            }
        },
        // 設定目標環境以避免相容性問題
        target: 'es2015'
    }
}));
