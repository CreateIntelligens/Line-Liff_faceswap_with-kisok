<template>
      <!-- History Page -->
    <FaceSwapHistory
      v-if="showHistoryPage"
      :userId="props.userId"
      :userUsage="userUsage"
      :isPCMode="isPCMode"
      @back="showHistoryPage = false"
    />
  
  <!-- Main Template Selection Page -->
  <div
    v-if="!showHistoryPage"
    class="relative min-h-screen w-full flex flex-col"
    :style="{ backgroundImage: `url(${imageUrls.pageBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"
    data-name="換臉_橫式範本"
  >
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 1.25rem; width: 100%; font-weight: bold; min-height: 5rem; position: relative;">
      <!-- Left side: Back button -->
      <button
        style="width: 17px; height: 19px; cursor: pointer; border: none; background: none; padding: 0; flex-shrink: 0;"
        @click="goBack"
      >
        <img
          :src="imageUrls.back"
          alt="Back Arrow"
          style="width: 17px; height: 19px; object-fit: contain;"
        />
      </button>
      
      <!-- Center: Header image (absolute positioned) -->
      <div style="position: absolute; left: 50%; transform: translateX(-50%);">
        <img
          :src="imageUrls.header"
          :class="isKioskMode ? 'h-48' : 'h-11'"
          class="object-contain"
          alt="大同寶寶賀新年"
        />
      </div>
      
      <!-- Right side: UsageCounter -->
      <div style="flex-shrink: 0;">
        <UsageCounter v-if="!isPCMode" :currentCount="userUsage" :maxLimit="4" />
        <div v-else style="width: 17px;"></div>
      </div>
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

    <div :class="isKioskMode ? 'max-w-[900px] mt-16' : 'max-w-[338px] mt-6'" class="w-full mx-auto">
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
                style="touch-action: manipulation; padding: 0;"
                :class="{
                  'border-8 scale-105': selectedTemplate === 'play'
                }"
                :style="selectedTemplate === 'play' ? 'border-color: #789511; touch-action: manipulation; padding: 0;' : 'touch-action: manipulation; padding: 0;'"
                @click="selectTemplate('play')"
                @touchend.prevent="selectTemplate('play')"
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
                style="touch-action: manipulation; padding: 0;"
                :class="{
                  'border-8 scale-105': selectedTemplate === 'wife'
                }"
                :style="selectedTemplate === 'wife' ? 'border-color: #789511; touch-action: manipulation; padding: 0;' : 'touch-action: manipulation; padding: 0;'"
                @click="selectTemplate('wife')"
                @touchend.prevent="selectTemplate('wife')"
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
                style="touch-action: manipulation; padding: 0;"
                :class="{
                  'border-8 scale-105': selectedTemplate === 'love'
                }"
                :style="selectedTemplate === 'love' ? 'border-color: #789511; touch-action: manipulation; padding: 0;' : 'touch-action: manipulation; padding: 0;'"
                @click="selectTemplate('love')"
                @touchend.prevent="selectTemplate('love')"
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
                style="touch-action: manipulation; padding: 0;"
                :class="{
                  'border-8 scale-105': selectedTemplate === 'super'
                }"
                :style="selectedTemplate === 'super' ? 'border-color: #789511; touch-action: manipulation; padding: 0;' : 'touch-action: manipulation; padding: 0;'"
                @click="selectTemplate('super')"
                @touchend.prevent="selectTemplate('super')"
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
              'flex gap-5 justify-center items-center cursor-pointer transition-all duration-300 font-bold text-[#FBEFC2]',
              selectedTemplate ? 'hover:bg-[#FF7824] active:bg-[#FF7824]' : 'cursor-not-allowed'
            ]"
            :style="selectedTemplate ? 'background-color: #FF7824; touch-action: manipulation;' : 'background-color: #D84729; touch-action: manipulation;'"
            @click="nextStep"
            @touchend.prevent="nextStep"
          >
            <div class="self-stretch my-auto" data-name="下一步">下一步</div>
          </div>
        </div>
      </div>
      <div
        v-if="!isPCMode"
        :class="isKioskMode ? 'mt-16 text-3xl' : 'mt-9 text-base'"
        class="font-bold text-center text-[#A90205] cursor-pointer hover:opacity-80 transition-opacity"
        data-name="圖片生成紀錄"
        @click="showHistory"
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

const emit = defineEmits(["next-step", "back"]);

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

