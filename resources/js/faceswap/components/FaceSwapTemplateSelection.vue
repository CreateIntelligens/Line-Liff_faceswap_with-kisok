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
    class="relative mx-auto my-0 bg-black h-screen w-full lg:h-full lg:w-full lg:flex lg:flex-col lg:px-[5.4%]"
    data-name="換臉_橫式範本"
  >
    <div class="flex gap-5 justify-center items-center px-12 pt-12 pb-8 w-full font-bold min-h-20 lg:pt-20 lg:pb-8">
      <img
        :src="imageUrls.header"
        class="h-20 object-contain lg:h-48"
        alt="2025三立集團內容創新發布會"
      />
    </div>
    <!-- 步驟 -->
    <div
      class="flex max-w-full text-base font-bold text-center text-[#EBD8B2] whitespace-nowrap w-[202px] mx-auto lg:w-[404px]"
    >
      <img
        :src="imageUrls.step1"
        class="w-6 h-6 object-contain lg:w-12 lg:h-12"
        alt="Step 1"
      />
      <img
        :src="imageUrls.horizontal"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px] lg:w-[130px]"
      />
      <img
        :src="imageUrls.step2_inactive"
        class="w-6 h-6 object-contain lg:w-12 lg:h-12"
        alt="Step 2"
      />
      <img
        :src="imageUrls.horizontal"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px] lg:w-[130px]"
      />
      <img
        :src="imageUrls.step3_inactive"
        class="w-6 h-6 object-contain lg:w-12 lg:h-12"
        alt="Step 3"
      />
    </div>
    <!-- 步驟文字 -->
    <div
      class="flex gap-5 justify-between max-w-full text-sm text-center text-[#EBD8B2] w-[218px] mx-auto lg:w-[436px] lg:text-2xl lg:gap-10"
    >
      <div data-name="Step 1">Step 1</div>
      <div data-name="Step 2">Step 2</div>
      <div data-name="Step 3">Step 3</div>
    </div>
    <div class="mt-14 w-full max-w-[338px] mx-auto lg:max-w-[90%] lg:mt-14">
      <div class="flex flex-col w-full">
        <div class="flex flex-col w-full">
          <div
            class="flex gap-2.5 items-center font-bold whitespace-nowrap lg:justify-start"
          >
            <div
              class="self-stretch my-auto text-lg text-[#333333] w-6 h-6 lg:w-12 lg:h-12"
            >
              <img
                :src="imageUrls.step1"
                class="w-6 h-6 object-contain lg:w-12 lg:h-12"
                alt="Step 1"
              />
            </div>
            <div
              class="self-stretch my-auto text-base text-[#EBD8B2] lg:text-3xl"
              data-name="請選擇以下IP圖片範本（請點擊圖片）"
            >
              請選擇以下IP圖片範本（請點擊圖片）
            </div>
          </div>
          <div class="mt-9 w-full">
            <div class="grid grid-cols-2 gap-3 lg:gap-[3.2%]">
              <!-- 模板 10 (綜藝玩很大) -->
              <div
                class="cursor-pointer rounded-md transition-all duration-200 hover:scale-105 lg:hover:scale-102 relative overflow-hidden"
                :class="{
                  'p-[6px] bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] scale-105': selectedTemplate === 'play',
                }"
                @click="selectTemplate('play')"
              >
                <img
                  :src="getTemplateImage('play')"
                  alt="綜藝玩很大"
                  class="w-full object-cover rounded-md lg:rounded-xl"
                  :class="{
                    'opacity-100': selectedTemplate === 'play',
                    'opacity-80': selectedTemplate && selectedTemplate !== 'play'
                  }"
                />
              </div>

              <!-- 模板 8 (犀利人妻) -->
              <div
                class="cursor-pointer rounded-md transition-all duration-200 hover:scale-105 lg:hover:scale-102 relative overflow-hidden"
                :class="{
                  'p-[6px] bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] scale-105': selectedTemplate === 'wife',
                }"
                @click="selectTemplate('wife')"
              >
                <img
                  :src="getTemplateImage('wife')"
                  alt="犀利人妻"
                  class="w-full object-cover rounded-md lg:rounded-xl"
                  :class="{
                    'opacity-100': selectedTemplate === 'wife',
                    'opacity-80': selectedTemplate && selectedTemplate !== 'wife'
                  }"
                />
              </div>

              <!-- 模板 9 (命中註定我愛你) -->
              <div
                class="cursor-pointer rounded-md transition-all duration-200 hover:scale-105 lg:hover:scale-102 relative overflow-hidden"
                :class="{
                  'p-[6px] bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] scale-105': selectedTemplate === 'love',
                }"
                @click="selectTemplate('love')"
              >
                <img
                  :src="getTemplateImage('love')"
                  alt="命中註定我愛你"
                  class="w-full object-cover rounded-md lg:rounded-xl"
                  :class="{
                    'opacity-100': selectedTemplate === 'love',
                    'opacity-80': selectedTemplate && selectedTemplate !== 'love'
                  }"
                />
              </div>

              <!-- 模板 11 (超級夜總會) -->
              <div
                class="cursor-pointer rounded-md transition-all duration-200 hover:scale-105 lg:hover:scale-102 relative overflow-hidden"
                :class="{
                  'p-[6px] bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] scale-105': selectedTemplate === 'super',
                }"
                @click="selectTemplate('super')"
              >
                <img
                  :src="getTemplateImage('super')"
                  alt="超級夜總會"
                  class="w-full object-cover rounded-md lg:rounded-xl"
                  :class="{
                    'opacity-100': selectedTemplate === 'super',
                    'opacity-80': selectedTemplate && selectedTemplate !== 'super'
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Usage Counter -->
          <div class="mt-8 mb-8 text-right">
            <UsageCounter v-if="!isPCMode" :currentCount="userUsage" :maxLimit="10" />
          </div>
        </div>
        <div
          class="self-end mt-8 w-full text-base font-bold text-white whitespace-nowrap rounded-md lg:text-3xl lg:mt-16"
        >
          <div
            class="flex gap-5 justify-center items-center px-36 py-3.5 rounded-md min-h-11 cursor-pointer transition-all duration-300 lg:px-72 lg:py-7 lg:min-h-24 lg:rounded-xl"
            :class="
              selectedTemplate
                ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] hover:shadow-lg text-gray-800'
                : 'bg-[#C7C7C7] text-white'
            "
            @click="nextStep"
          >
            <div class="self-stretch my-auto" data-name="下一步">下一步</div>
          </div>
        </div>
      </div>
      <div
        v-if="!isPCMode"
        class="mt-9 text-base font-bold text-center text-[#EBD8B2] cursor-pointer hover:text-[#d4c29a] transition-colors"
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

function getTemplateImage(templateKey) {
  const imageMap = {
    'play': imageUrls.play,   // 綜藝玩很大
    'wife': imageUrls.wife,   // 犀利人妻
    'love': imageUrls.love,   // 命中註定我愛你
    'super': imageUrls.super  // 超級夜總會
  };
  
  return imageMap[templateKey] || imageUrls.play;
}
</script>

