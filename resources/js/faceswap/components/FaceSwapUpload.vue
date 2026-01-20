<template>
  <div
    class="relative min-h-screen w-full flex flex-col"
    :style="{ backgroundImage: `url(${imageUrls.pageBg})`, backgroundSize: isKioskMode ? 'cover' : '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"
    style="pointer-events: auto; position: relative; z-index: 1;"
  >
    <!-- Header -->
    <div
      :class="[
        isKioskMode ? 'pt-20 pb-12 px-16 flex items-center justify-center' : 'py-4 px-5 grid grid-cols-[auto_1fr_auto] items-center',
        'gap-2 w-full font-bold'
      ]"
      :style="isKioskMode ? 'min-height: 8rem;' : 'min-height: 5rem; overflow: visible;'"
    >
      <!-- Home icon -->
      <button
        :style="isKioskMode ? 'width: 87px; height: 87px; cursor: pointer !important; border: none; background: none; padding: 0; flex-shrink: 0; pointer-events: auto !important; position: relative; z-index: 20;' : 'width: 26px; height: 26px; cursor: pointer !important; border: none; background: none; padding: 0; flex-shrink: 0; pointer-events: auto !important; position: relative; z-index: 20;'"
        @click.stop="goBack"
        @mousedown.stop
        @touchstart.stop
      >
        <img
          :src="imageUrls.homeIcon"
          alt="Home"
          :style="isKioskMode ? 'width: 87px; height: 87px; object-fit: contain;' : 'width: 26px; height: 26px; object-fit: contain;'"
        />
      </button>

      <!-- Title (手機版置中，Kiosk 模式保持原樣) -->
      <img
        v-if="!isKioskMode"
        :src="imageUrls.header"
        class="h-11 object-contain justify-self-center"
        alt="大同寶寶賀新年"
        style="min-width: 0; max-width: 100%;"
      />
      <img
        v-else
        :src="imageUrls.header"
        class="h-40 object-contain"
        alt="大同寶寶賀新年"
      />

      <!-- Usage counter (手機版靠右，Kiosk 模式不顯示) -->
      <UsageCounter v-if="!isPCMode && !isKioskMode" :currentCount="userUsage" :maxLimit="4" />
    </div>

    <!-- 步驟進度條 (手機版) -->
    <div v-if="!isPCMode" class="flex max-w-full w-[202px] text-base font-bold text-center text-[#A90205] whitespace-nowrap mx-auto mt-0">
      <img :src="imageUrls.step1" class="w-6 h-6 object-contain" alt="Step 1">
      <img :src="imageUrls.horizontal" class="w-[65px] object-contain shrink-0 my-auto aspect-[32.26]">
      <img :src="imageUrls.step2_inprogress" class="w-6 h-6 object-contain" alt="Step 2">
      <img :src="imageUrls.horizontal" class="w-[65px] object-contain shrink-0 my-auto aspect-[32.26]">
      <img :src="imageUrls.step3_inactive" class="w-6 h-6 object-contain" alt="Step 3">
    </div>

    <!-- 步驟文字 (手機版) -->
    <div v-if="!isPCMode" class="flex justify-between max-w-full w-[218px] text-sm gap-5 text-center text-[#A90205] mx-auto mt-2 mb-4">
      <div>Step 1</div>
      <div>Step 2</div>
      <div>Step 3</div>
    </div>

    <!-- Main Content Container -->
    <div class="flex-1 flex flex-col max-w-md mx-auto w-full px-5" style="pointer-events: auto; position: relative; z-index: 10;">
      <!-- Selected Template Image -->
      <div class="mb-8">
        <div v-if="props.selectedTemplate" class="w-full">
          <img
            class="w-full object-cover rounded-md"
            :src="getTemplateImage(props.selectedTemplate)"
            :alt="getTemplateName(props.selectedTemplate)"
          />
        </div>
        <div v-else class="w-full h-[273px] flex items-center justify-center bg-gray-700 rounded-md">
          <div class="text-center text-[#A90205]">
            <div class="text-lg font-bold mb-2">請先選擇模板</div>
            <div class="text-sm text-[#A90205]">請回到上一步選擇您想要的換臉模板</div>
          </div>
        </div>
      </div>

      <!-- Upload Section -->
      <div class="flex-1">
        <div v-if="props.selectedTemplate">
          <div class="flex items-center gap-3 mb-6">
            <img
              :src="imageUrls.title2"
              class="h-6 object-contain"
              alt="請上傳一張正面清晰的原始圖片"
            />
          </div>

          <!-- Upload Area -->
          <div class="mb-6" style="pointer-events: auto; position: relative; z-index: 10;">
            <div
              class="flex h-[200px] flex-col items-center justify-center gap-5 border-2 border-dashed border-[#A90205] bg-white cursor-pointer transition-colors rounded-md"
              style="pointer-events: auto !important; cursor: pointer !important; position: relative; z-index: 20; touch-action: pan-y;"
              @click.stop="triggerFileUpload"
              @touchend.prevent.stop="triggerFileUpload"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <div v-if="!uploadedImage" class="flex flex-col items-center gap-3">
                <!-- Upload Icon -->
                <div class="w-[50px] h-[35px] relative">
                  <img
                    :src="imageUrls.upload"
                    alt="Upload Icon"
                    class="w-[50px] h-[35px] object-contain"
                  />
                </div>
                <div class="text-base font-medium text-[#A90205] text-center">
                  點擊上傳
                </div>
                <div class="text-sm font-medium text-[#A90205] text-center">
                  支援 JPG, PNG 格式
                </div>
              </div>
              <div v-else class="w-full h-full">
                <!-- 圖片預覽 -->
                <img
                  :src="uploadedImagePreview"
                  :alt="uploadedImage.name"
                  class="w-full h-full object-contain rounded-md bg-white"
                />
              </div>
            </div>
          </div>

          <!-- Upload Instructions -->
          <div class="mb-8">
            <h4 class="text-[#A90205] font-bold text-sm mb-1">上傳注意事項：</h4>
            <div class="text-[13px] font-bold text-[#A90205]">
              <div>1.請上傳單人清晰正面照，避免多人合照，以利準確辨識</div>
              <div>2.僅支援人像照片，請勿上傳風景、動物或其他非人物圖片</div>
              <div>請確保臉部五官完整可見，避免口罩、手部、頭髮等遮擋</div>
              <div>4.避免模糊、晃動或低解析度圖片，以免影響生成品質</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 mb-8">
            <button
              class="flex flex-1 h-11 px-3 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 text-base font-bold text-[#FBEFC2] hover:bg-[#FF7824] active:bg-[#FF7824]"
              style="background-color: #FF7824; touch-action: manipulation; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;"
              @click.stop="goBack"
              @mousedown.stop
              @touchstart.stop
            >
              重選範本
            </button>
            <button
              class="flex flex-1 h-11 px-3 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 text-base font-bold text-[#FBEFC2] relative"
              :class="
                canGenerate
                  ? 'hover:bg-[#FF7824] active:bg-[#FF7824]'
                  : 'cursor-not-allowed'
              "
              :style="canGenerate ? 'background-color: #FF7824; touch-action: manipulation; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;' : 'background-color: #D84729; touch-action: manipulation; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;'"
              @click.stop="generateFaceSwap"
              @mousedown.stop
              @touchstart.stop
              :disabled="!canGenerate"
            >
              <img 
                src="/resources/images/coin_icon.png" 
                alt=""
                class="absolute pointer-events-none"
                style="top: 0; right: 0; width: 42px; height: 42px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;"
              />
              開始生成
            </button>
          </div>
        </div>
        <div v-else class="text-center text-[#A90205] py-8">
          <div class="text-lg font-bold mb-4">無法進行換臉操作</div>
          <div class="text-sm text-[#A90205] mb-6">您需要先選擇一個模板才能繼續</div>
          <button
            class="px-6 py-3 text-[#FBEFC2] rounded-md font-bold transition-all duration-300 hover:bg-[#FF7824] active:bg-[#FF7824] relative"
            style="background-color: #D84729; touch-action: manipulation; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;"
            @click.stop="goBack"
            @mousedown.stop
            @touchstart.stop
          >
            <img 
              src="/resources/images/coin_icon.png" 
              alt=""
              class="absolute pointer-events-none"
              style="top: 0; right: 0; width: 42px; height: 42px; transform: translate(50%, -50%) rotate(17deg); z-index: 10;"
            />
            返回選擇模板
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- 生成中彈窗 -->
    <div
      v-if="isGenerating"
      class="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="flex flex-col items-center justify-center gap-4">
        <!-- 第一個彈窗：上傳中 -->
        <div
          v-if="showFirstDialog"
          class="bg-white rounded-md p-6 w-[202px] h-[116px] flex flex-col items-center justify-center gap-4"
        >
          <div class="text-lg font-bold text-gray-800">上傳中...</div>
          <div class="text-sm text-gray-600 text-center">請勿關閉視窗</div>
        </div>

        <!-- 第二個彈窗：生產進行中 -->
        <div
          v-if="showSecondDialog"
          class="bg-white rounded-md p-6 w-[288px] h-[116px] flex flex-col items-center justify-center gap-4"
        >
          <div class="text-lg font-bold text-gray-800">生產正在進行中！</div>
          <div class="text-sm text-gray-600 text-center">
            如使用人數眾多可能會花費較多時間，可以稍後再回來查看唷！
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { onUnmounted } from "vue";
import { roadshowService } from "../../services/roadshowService.js";
import UsageCounter from "./UsageCounter.vue";
import { imageUrls } from '@/config/imageUrls'

const props = defineProps({
  selectedTemplate: {
    type: String,
    default: ''
  },
  userUsage: {
    type: Number,
    default: 0
  },
  userId: {
    type: String,
    default: ''
  },
  isPCMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["back", "generate", "showHistory"]);

// 人物選擇功能已移除,統一使用 target_face_index = 0
const uploadedImage = ref(null);
const uploadedImagePreview = ref(null);
const fileInput = ref(null);
const isGenerating = ref(false);
const showFirstDialog = ref(false);
const showSecondDialog = ref(false);


const canGenerate = computed(() => {
  // 不再檢查 selectedCharacter,只需確認模板和圖片已選擇
  return props.selectedTemplate && uploadedImage.value;
});

// 統一的檔案驗證函數
function validateFile(file) {
  // 檢查檔案是否存在
  if (!file) {
    return { valid: false, message: '未選擇檔案' };
  }

  // 檢查檔案大小（7MB限制）
  const maxSize = 7 * 1024 * 1024; // 7MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      message: '請上傳小於7MB檔案大小的圖',
      sizeMB: (file.size / 1024 / 1024).toFixed(2)
    };
  }

  // 檢查檔案格式（根據 Nano Banana Pro API 支持的格式）
  const allowedTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp',
    'image/heic',
    'image/heif'
  ];
  
  // 檢查 MIME 類型
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      message: '不支援的檔案格式，請上傳 JPG、PNG、WebP、HEIC 或 HEIF 格式的圖片'
    };
  }

  return { valid: true };
}

function getTemplateImage(templateKey) {
  const imageMap = {
    'play': imageUrls.play,   // 財運亨通馬上發
    'wife': imageUrls.wife,   // 強棒出擊馬力夯
    'love': imageUrls.love,   // 山珍海味馬不停
    'super': imageUrls.super  // 心想事成馬上有
  };
  
  return imageMap[templateKey] || imageUrls.play;
}

function getTemplateName(templateId) {
  // 根據模板 ID 返回對應的名稱
  const nameMap = {
    'play': '財運亨通馬上發',
    'wife': '強棒出擊馬力夯',
    'love': '山珍海味馬不停',
    'super': '心想事成馬上有'
  };
  
  return nameMap[templateId] || '';
}

function triggerFileUpload() {
  fileInput.value?.click();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    // 使用統一的驗證函數檢查檔案
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.message);
      // 重置檔案輸入，確保檔案不會被設置
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      // 清除已選擇的檔案
      uploadedImage.value = null;
      if (uploadedImagePreview.value) {
        URL.revokeObjectURL(uploadedImagePreview.value);
        uploadedImagePreview.value = null;
      }
      return;
    }
    
    // 驗證通過，設置檔案
    uploadedImage.value = file;
    // 創建預覽URL
    uploadedImagePreview.value = URL.createObjectURL(file);
  }
}

function handleDrop(event) {
  event.preventDefault(); // 防止瀏覽器默認行為
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    // 使用統一的驗證函數檢查檔案
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.message);
      // 清除已選擇的檔案
      uploadedImage.value = null;
      if (uploadedImagePreview.value) {
        URL.revokeObjectURL(uploadedImagePreview.value);
        uploadedImagePreview.value = null;
      }
      return;
    }
    
    // 驗證通過，設置檔案
    uploadedImage.value = file;
    // 創建預覽URL
    uploadedImagePreview.value = URL.createObjectURL(file);
  }
}



function goBack() {
  // 清理預覽URL以避免內存洩漏
  if (uploadedImagePreview.value) {
    URL.revokeObjectURL(uploadedImagePreview.value);
    uploadedImagePreview.value = null;
  }
  uploadedImage.value = null;
  // 重置彈窗狀態
  isGenerating.value = false;
  showFirstDialog.value = false;
  showSecondDialog.value = false;
  emit("back");
}

async function generateFaceSwap() {
  if (canGenerate.value) {
    isGenerating.value = true;
    showFirstDialog.value = true;
    
    try {
      // 驗證上傳的檔案
      if (!uploadedImage.value) {
        throw new Error('未選擇圖片檔案');
      }
      
      // 使用統一的驗證函數檢查檔案（雙重檢查確保安全）
      const file = uploadedImage.value;
      const validation = validateFile(file);
      
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      console.log('📁 檔案資訊:', {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeMB: (file.size / 1024 / 1024).toFixed(2) + 'MB',
        lastModified: new Date(file.lastModified).toISOString()
      });
      // 單獨輸出以便查看
      console.log('📁 檔案名稱:', file.name);
      console.log('📁 檔案類型:', file.type);
      console.log('📁 檔案大小:', file.size, 'bytes', '(', (file.size / 1024 / 1024).toFixed(2), 'MB)');
      
      // 統一使用 target_face_index = 0 (不再有人物選擇)
      const targetFaceIndex = 0
      
      console.log('🎯 生成參數:', {
        template: props.selectedTemplate,
        targetFaceIndex: targetFaceIndex,
        userId: props.userId
      });
      // 單獨輸出以便查看
      console.log('🎯 模板 ID (字串):', props.selectedTemplate);
      console.log('🎯 Target Face Index:', targetFaceIndex);
      console.log('🎯 User ID:', props.userId);
      
      // 處理圖片：通過 canvas 重新繪製，確保格式一致（類似 Kiosk 模式）
      // 這樣可以統一圖片格式，避免元數據問題
      let processedFile = file;
      
      try {
        console.log('🖼️ 開始處理圖片，確保格式一致...');
        
        // 創建圖片對象
        const img = new Image();
        const imageUrl = URL.createObjectURL(file);
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            // 創建 canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // 轉換為 blob，然後創建 File 對象（類似 Kiosk 模式）
            canvas.toBlob((blob) => {
              if (blob) {
                // 使用原始檔案名稱，但確保類型為 image/jpeg
                const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
                processedFile = new File([blob], fileName, { type: 'image/jpeg' });
                console.log('✅ 圖片處理完成:', {
                  originalName: file.name,
                  processedName: processedFile.name,
                  originalType: file.type,
                  processedType: processedFile.type,
                  originalSize: file.size,
                  processedSize: processedFile.size,
                  imageWidth: img.width,
                  imageHeight: img.height,
                  aspectRatio: (img.width / img.height).toFixed(2)
                });
                console.log('📐 圖片尺寸:', `${img.width} x ${img.height}`, `(比例: ${(img.width / img.height).toFixed(2)})`);
                URL.revokeObjectURL(imageUrl);
                resolve();
              } else {
                URL.revokeObjectURL(imageUrl);
                reject(new Error('圖片處理失敗'));
              }
            }, 'image/jpeg', 0.95); // 使用 0.95 質量，與 Kiosk 模式一致
          };
          
          img.onerror = () => {
            URL.revokeObjectURL(imageUrl);
            reject(new Error('圖片載入失敗'));
          };
          
          img.src = imageUrl;
        });
      } catch (error) {
        console.warn('⚠️ 圖片處理失敗，使用原始檔案:', error);
        // 如果處理失敗，使用原始檔案
        processedFile = file;
      }
      
      // 準備FormData - 純粹的API調用，不改變UI
      // props.userId 已經是 effectiveUserId（手機版會是 email，Kiosk 模式會是原始 userId）
      const currentUserId = props.userId || 'abc';
      const formData = new FormData();
      formData.append('userId', currentUserId);
      
      // 從 sessionStorage 讀取 email（手機版流程中輸入的 email）
      const email = sessionStorage.getItem('faceswap_email') || '';
      if (email) {
        formData.append('email', email);
        console.log('📧 已添加 Email 到 FormData:', email);
      }
      
      formData.append('file', processedFile);
      
      // 將字符串模板ID轉換為新 API 格式 (1, 2, 3, 4)
      const templateIdMap = {
        'play': '1',     // 財運亨通馬上發 → 左上 (id: 1)
        'love': '2',     // 山珍海味馬不停 → 左下 (id: 2)
        'super': '3',    // 心想事成馬上有 → 右下 (id: 3)
        'wife': '4'      // 強棒出擊馬力夯 → 右上 (id: 4)
      };
      const numericTemplateId = templateIdMap[props.selectedTemplate] || '1';
      formData.append('template_id', numericTemplateId);
      
      // 添加必填的 userName 參數（新 API 要求）
      formData.append('userName', currentUserId);
      
      formData.append('target_face_index', targetFaceIndex); // 固定為 0
      formData.append('userInfo', `模板: ${props.selectedTemplate}`);
      
      console.log('📤 準備發送 FormData:', {
        userId: currentUserId,
        email: email || '(無)',
        template_id: numericTemplateId,
        target_face_index: targetFaceIndex,
        file_name: processedFile.name,
        file_size: processedFile.size,
        file_type: processedFile.type,
        original_file_name: file.name,
        original_file_size: file.size,
        original_file_type: file.type
      });
      // 單獨輸出以便查看
      console.log('📤 Template ID (數字):', numericTemplateId);
      console.log('📤 Target Face Index:', targetFaceIndex);
      console.log('📤 User ID:', currentUserId);
      console.log('📤 處理後的檔案:', {
        name: processedFile.name,
        type: processedFile.type,
        size: processedFile.size,
        sizeKB: (processedFile.size / 1024).toFixed(2) + 'KB'
      });
      
      // 調用API生成頭像
      const result = await roadshowService.generateAvatar(formData);
      
      if (result && (result.success || result.status === 'success')) {
        // 延遲一下再發送事件，讓用戶看到彈窗
        setTimeout(() => {
          showFirstDialog.value = false;
          showSecondDialog.value = true;
          setTimeout(() => {
            emit("generate", {
              uploadedImage: uploadedImage.value,
              taskId: String(result.result?.task_id || result.result?.id), // 確保為字符串
              selectedTemplate: props.selectedTemplate  // 添加選擇的模板ID
            });
          }, 1000);
        }, 1000);
      } else if (result && result.error) {
        // 處理特定錯誤狀態
        if (result.error.status === 403) {
          // 檢查是否是達到生成限制的錯誤
          const errorMessage = result.error.message || '';
          if (errorMessage.includes('生成限制') || errorMessage.includes('限制')) {
            throw new Error('您已達到每人4張圖片的生成限制，無法繼續生成新圖片');
          } else {
            throw new Error('權限不足，無法生成頭像');
          }
        } else if (result.error.status === 400) {
          throw new Error('請求格式錯誤，請檢查上傳的檔案');
        } else if (result.error.status !== 200) {
          throw new Error('生成失敗，請重新上傳');
        } else {
          throw new Error('生成失敗');
        }
      } else {
        throw new Error('生成失敗');
      }
    } catch (error) {
      console.error('❌ 生成頭像失敗:', error);
      isGenerating.value = false;
      showFirstDialog.value = false;
      showSecondDialog.value = false;
      
              // 檢查是否是達到生成限制的錯誤
        if (error.message.includes('生成限制')) {
          // 顯示達到限制的錯誤訊息，並提供查看歷史的選項
          if (confirm(`${error.message}\n\n是否要查看您的生成歷史？`)) {
            // 可以發送一個事件來顯示歷史
            emit('showHistory');
          }
        } else {
          // 其他錯誤使用alert
          alert(`生成失敗：${error.message}`);
        }
    }
  }
}

// 組件卸載時清理預覽URL
onUnmounted(() => {
  if (uploadedImagePreview.value) {
    URL.revokeObjectURL(uploadedImagePreview.value);
  }
});
</script>
