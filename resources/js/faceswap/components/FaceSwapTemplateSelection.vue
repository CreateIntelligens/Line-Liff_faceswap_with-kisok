<template>
      <!-- History Page -->
    <FaceSwapHistory
      v-if="showHistoryPage"
      :userId="props.userId"
      :userUsage="userUsage"
      :isPCMode="isPCMode"
      :isKioskMode="isKioskMode"
      @back="handleHistoryBack"
    />
  
  <!-- Main Template Selection Page -->
  <div
    v-if="!showHistoryPage"
    class="relative min-h-screen w-full flex flex-col overflow-visible"
    :style="{ backgroundImage: `url(${imageUrls.pageBg})`, backgroundSize: isKioskMode ? 'cover' : '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"
    data-name="換臉_橫式範本"
    style="pointer-events: auto; position: relative; z-index: 1;"
  >
    <div
      :class="[
        isKioskMode ? 'pt-20 pb-12 px-16 flex items-center justify-center' : 'py-4 px-5 grid grid-cols-[auto_1fr_auto] items-center',
        'gap-2 w-full font-bold overflow-visible'
      ]"
      :style="isKioskMode ? 'min-height: 18rem;' : 'min-height: 5rem; overflow: visible;'"
    >
      <!-- Home icon -->
      <button
        :class="isKioskMode ? 'mt-4' : ''"
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
    <div v-if="!isKioskMode" class="flex max-w-full w-[202px] text-base font-bold text-center text-[#A90205] whitespace-nowrap mx-auto mt-6">
      <img :src="imageUrls.step1" class="w-6 h-6 object-contain" alt="Step 1">
      <img :src="imageUrls.horizontal" class="w-[65px] object-contain shrink-0 my-auto aspect-[32.26]">
      <img :src="imageUrls.step2_inactive" class="w-6 h-6 object-contain" alt="Step 2">
      <img :src="imageUrls.horizontal" class="w-[65px] object-contain shrink-0 my-auto aspect-[32.26]">
      <img :src="imageUrls.step3_inactive" class="w-6 h-6 object-contain" alt="Step 3">
    </div>

    <!-- 步驟文字 (手機版) -->
    <div v-if="!isKioskMode" class="flex justify-between max-w-full w-[218px] text-sm gap-5 text-center text-[#A90205] mx-auto mt-2 mb-4">
      <div>Step 1</div>
      <div>Step 2</div>
      <div>Step 3</div>
    </div>

    <div :class="isKioskMode ? 'max-w-[900px] mt-16' : 'max-w-[338px] mt-6'" class="w-full mx-auto pb-6" style="pointer-events: auto; position: relative; z-index: 10;">
      <div class="flex flex-col w-full">
        <div class="flex flex-col w-full">
          <div
            :class="isKioskMode ? 'justify-center' : ''"
            class="flex gap-2.5 items-center font-bold whitespace-nowrap mb-2"
          >
            <img
              :src="isKioskMode ? imageUrls.kiosktitle1 : imageUrls.title1"
              :class="isKioskMode ? 'h-auto' : 'h-auto'"
              class="object-contain"
              alt="請選擇以下IP圖片範本（請點擊圖片）"
              data-name="請選擇以下IP圖片範本（請點擊圖片）"
            />
          </div>
          <div :class="isKioskMode ? 'mt-12' : 'mt-9'" class="w-full">
            <div :class="isKioskMode ? 'gap-8' : 'gap-3'" class="grid grid-cols-2">
              <!-- 模板 10 (綜藝玩很大) -->
              <div
                class="cursor-pointer transition-all duration-200 hover:scale-105 relative overflow-hidden"
                :class="{
                  'border-8 scale-105': selectedTemplate === 'play' && !isKioskMode,
                  'border-[16px] scale-105': selectedTemplate === 'play' && isKioskMode
                }"
                :style="selectedTemplate === 'play' ? `border-color: #789511; border-width: ${isKioskMode ? '16px' : '8px'}; touch-action: manipulation; padding: 0; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;` : 'touch-action: manipulation; padding: 0; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;'"
                @click.stop="selectTemplate('play')"
                @mousedown.stop
                @touchstart.stop
                @touchend.prevent.stop="selectTemplate('play')"
              >
                <img
                  :src="getTemplateImage('play')"
                  alt="財運亨通馬上發"
                  class="w-full h-full object-cover block"
                  :class="{
                    'opacity-100': selectedTemplate === 'play',
                    'opacity-80': selectedTemplate && selectedTemplate !== 'play'
                  }"
                />
              </div>

              <!-- 模板 2 (強棒出擊馬力夯) -->
              <div
                class="cursor-pointer transition-all duration-200 hover:scale-105 relative overflow-hidden"
                :class="{
                  'border-8 scale-105': selectedTemplate === 'wife' && !isKioskMode,
                  'border-[16px] scale-105': selectedTemplate === 'wife' && isKioskMode
                }"
                :style="selectedTemplate === 'wife' ? `border-color: #789511; border-width: ${isKioskMode ? '16px' : '8px'}; touch-action: manipulation; padding: 0; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;` : 'touch-action: manipulation; padding: 0; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;'"
                @click.stop="selectTemplate('wife')"
                @mousedown.stop
                @touchstart.stop
                @touchend.prevent.stop="selectTemplate('wife')"
              >
                <img
                  :src="getTemplateImage('wife')"
                  alt="強棒出擊馬力夯"
                  class="w-full h-full object-cover block"
                  :class="{
                    'opacity-100': selectedTemplate === 'wife',
                    'opacity-80': selectedTemplate && selectedTemplate !== 'wife'
                  }"
                />
              </div>

              <!-- 模板 3 (山珍海味馬不停) -->
              <div
                class="cursor-pointer transition-all duration-200 hover:scale-105 relative overflow-hidden"
                :class="{
                  'border-8 scale-105': selectedTemplate === 'love' && !isKioskMode,
                  'border-[16px] scale-105': selectedTemplate === 'love' && isKioskMode
                }"
                :style="selectedTemplate === 'love' ? `border-color: #789511; border-width: ${isKioskMode ? '16px' : '8px'}; touch-action: manipulation; padding: 0; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;` : 'touch-action: manipulation; padding: 0; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;'"
                @click.stop="selectTemplate('love')"
                @mousedown.stop
                @touchstart.stop
                @touchend.prevent.stop="selectTemplate('love')"
              >
                <img
                  :src="getTemplateImage('love')"
                  alt="山珍海味馬不停"
                  class="w-full h-full object-cover block"
                  :class="{
                    'opacity-100': selectedTemplate === 'love',
                    'opacity-80': selectedTemplate && selectedTemplate !== 'love'
                  }"
                />
              </div>

              <!-- 模板 4 (心想事成馬上有) -->
              <div
                class="cursor-pointer transition-all duration-200 hover:scale-105 relative overflow-hidden"
                :class="{
                  'border-8 scale-105': selectedTemplate === 'super' && !isKioskMode,
                  'border-[16px] scale-105': selectedTemplate === 'super' && isKioskMode
                }"
                :style="selectedTemplate === 'super' ? `border-color: #789511; border-width: ${isKioskMode ? '16px' : '8px'}; touch-action: manipulation; padding: 0; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;` : 'touch-action: manipulation; padding: 0; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;'"
                @click.stop="selectTemplate('super')"
                @mousedown.stop
                @touchstart.stop
                @touchend.prevent.stop="selectTemplate('super')"
              >
                <img
                  :src="getTemplateImage('super')"
                  alt="心想事成馬上有"
                  class="w-full h-full object-cover block"
                  :class="{
                    'opacity-100': selectedTemplate === 'super',
                    'opacity-80': selectedTemplate && selectedTemplate !== 'super'
                  }"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          :class="isKioskMode ? 'text-4xl mt-16' : 'text-base mt-4'"
          class="self-end w-full font-bold text-[#A90205] whitespace-nowrap rounded-md"
        >
          <div
            :class="[
              isKioskMode ? 'h-[114px] rounded-xl text-3xl' : 'h-11 rounded-md text-base',
              'flex gap-5 justify-center items-center cursor-pointer transition-all duration-300 font-bold text-[#FBEFC2] relative',
              selectedTemplate ? 'hover:bg-[#FF7824] active:bg-[#FF7824]' : 'cursor-not-allowed'
            ]"
            :style="selectedTemplate ? 'background-color: #FF7824; touch-action: manipulation; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;' : 'background-color: #D84729; touch-action: manipulation; cursor: pointer !important; pointer-events: auto !important; position: relative; z-index: 20;'"
            @click.stop="nextStep"
            @mousedown.stop
            @touchstart.stop
            @touchend.prevent.stop="nextStep"
          >
            <img 
              src="/resources/images/coin_icon.png" 
              alt=""
              class="absolute pointer-events-none"
              :style="isKioskMode ? 'top: 0; right: 0; width: 123px; height: 123px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;' : 'top: 0; right: 0; width: 42px; height: 42px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;'"
            />
            <div class="self-stretch my-auto" data-name="下一步">下一步</div>
          </div>
        </div>
      </div>
      <div
        v-if="!isPCMode"
        :class="isKioskMode ? 'mt-16 text-3xl' : 'mt-4 mb-6 text-base'"
        class="font-bold text-center text-[#A90205] cursor-pointer hover:opacity-80 transition-opacity"
        data-name="圖片生成紀錄"
        style="pointer-events: auto; position: relative; z-index: 10; cursor: pointer !important;"
        @click.stop="showHistory"
        @mousedown.stop
        @touchstart.stop
      >
        圖片生成紀錄
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { roadshowService } from "../../services/roadshowService.js";
import FaceSwapHistory from "./FaceSwapHistory.vue";
import UsageCounter from "./UsageCounter.vue";
import { imageUrls } from "@/config/imageUrls";

const props = defineProps({
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
  },
  isKioskMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["next-step", "back", "refresh-usage"]);

const selectedTemplate = ref("");
const showHistoryPage = ref(false);
const templates = ref({});

// 在組件掛載時獲取模板列表
onMounted(async () => {
  try {
    console.log('🔍 嘗試獲取模板列表...');
    const result = await roadshowService.getTemplates();
    if (result && result.success) {
      console.log('✅ 模板列表獲取成功:', result.templates);
      templates.value = result.templates;
      // 使用 API 返回的真實模板數據
    } else {
      console.log('⚠️ API調用失敗，使用預設模板佈局');
    }
  } catch (error) {
    console.log('⚠️ 使用預設模板佈局，錯誤:', error.message);
  }
});

function selectTemplate(templateId) {
  selectedTemplate.value = templateId;
}

function nextStep() {
  if (selectedTemplate.value) {
    emit("next-step", { selectedTemplate: selectedTemplate.value });
  }
}

function showHistory() {
  showHistoryPage.value = true;
}

function handleHistoryBack() {
  showHistoryPage.value = false;
  // 通知父組件刷新使用量，確保計數器同步
  emit("refresh-usage");
}

function goBack() {
  emit("back");
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
</script>

