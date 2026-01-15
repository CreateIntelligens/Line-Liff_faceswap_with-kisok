<template>
  <div
    class="relative min-h-screen w-full flex flex-col"
    :style="{ backgroundImage: `url(${imageUrls.pageBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"
  >
    <!-- Header -->
    <div :class="isKioskMode ? 'pt-20 pb-12' : 'py-4'" class="flex gap-5 justify-center items-center px-12 w-full font-bold">
      <img
        :src="imageUrls.header"
        :class="isKioskMode ? 'h-40' : 'h-11'"
        class="object-contain"
        alt="2025三立集團內容創新發布會"
      />
    </div>
    
    <!-- 分隔線 (僅手機版) -->
    <div v-if="!isKioskMode" class="w-full border-t border-gray-400 opacity-30"></div>

    <!-- 步驟進度條 (手機版) -->
    <div v-if="!isKioskMode" class="flex max-w-full w-[202px] text-base font-bold text-center text-[#A90205] whitespace-nowrap mx-auto mt-6">
      <img :src="imageUrls.step1" class="w-6 h-6 object-contain" alt="Step 1">
      <img :src="imageUrls.horizontal" class="w-[65px] object-contain shrink-0 my-auto aspect-[32.26]">
      <img :src="imageUrls.step2_inactive" class="w-6 h-6 object-contain" alt="Step 2">
      <img :src="imageUrls.horizontal" class="w-[65px] object-contain shrink-0 my-auto aspect-[32.26]">
      <img :src="imageUrls.step3_inactive" class="w-6 h-6 object-contain" alt="Step 3">
    </div>
    

    <!-- 步驟文字 (僅手機版) -->
    <div v-if="!isKioskMode" class="flex justify-between max-w-full w-[218px] text-sm gap-5 text-center text-[#A90205] mx-auto">
      <div>Step 1</div>
      <div>Step 2</div>
      <div>Step 3</div>
    </div>

    <div :class="isKioskMode ? 'max-w-[900px] mt-16' : 'max-w-[338px] mt-14'" class="w-full mx-auto">
      <div class="flex flex-col w-full">
        <div class="flex flex-col w-full">
          <div :class="isKioskMode ? 'justify-center' : ''" class="flex gap-2.5 items-center font-bold whitespace-nowrap mb-6">
            <!-- 手機版：顯示打勾圖標 -->
            <div v-if="!isKioskMode" class="w-6 h-6 self-stretch my-auto">
              <img
                src="/resources/images/step1.png"
                class="w-6 h-6 object-contain"
                alt="Step 1"
              />
            </div>
            <!-- Kiosk 版：顯示數字圓圈 -->
            <div v-else class="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
              <span class="text-4xl font-bold text-black">2</span>
            </div>
            
            <div :class="isKioskMode ? 'text-5xl' : 'text-base'" class="self-stretch my-auto text-[#A90205]">
              請選擇要換臉的人物
            </div>
          </div>

          <div :class="isKioskMode ? 'mt-16' : 'mt-9'" class="w-full">
            <!-- Selected Template Image -->
            <div :class="isKioskMode ? 'mb-16' : 'mb-8'">
              <div v-if="selectedTemplate" :class="isKioskMode ? 'h-[710px]' : 'h-[273px]'" class="w-full">
                <img
                  class="w-full h-full object-contain rounded-md"
                  :src="getTemplateImage(selectedTemplate)"
                  :alt="getTemplateName(selectedTemplate)"
                />
              </div>
              <div v-else class="w-full h-[273px] flex items-center justify-center bg-gray-700 rounded-md border-2 border-dashed border-gray-400">
                <div class="text-center text-[#A90205]">
                  <div class="text-lg font-bold mb-2">請先選擇模板</div>
                  <div class="text-sm">請回到上一步選擇您想要的換臉模板</div>
                </div>
              </div>
            </div>

            <!-- Character Selection -->
            <div v-if="selectedTemplate" :class="isKioskMode ? 'mb-16' : 'mb-8'">
              <h3 v-if="!isKioskMode" class="text-base mb-4 font-bold text-center text-[#A90205]">
                請選擇要換臉的人物
              </h3>
              <div :class="isKioskMode ? 'gap-10' : 'gap-4'" class="flex justify-center">
                <button
                  v-for="(character, index) in getTemplateCharacters()"
                  :key="index"
                  :class="[
                    isKioskMode ? 'h-[114px] text-4xl px-8' : 'h-11 text-base px-3',
                    selectedCharacter === `character${index + 1}`
                      ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] shadow-lg text-gray-800'
                      : 'text-[#333]'
                  ]"
                  class="flex-1 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 font-bold"
                  style="touch-action: manipulation;"
                  :style="
                    selectedCharacter === `character${index + 1}`
                      ? ''
                      : 'background: radial-gradient(50% 50% at 50% 50%, #FFF8E9 0%, #DEC799 100%); box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);'
                  "
                  @click="selectCharacter(`character${index + 1}`, index)"
                  @touchend.prevent="selectCharacter(`character${index + 1}`, index)"
                >
                  {{ character }}
                </button>
              </div>
            </div>
          </div>

          <!-- Usage Counter -->
          <div class="mb-8 text-right">
            <!-- Usage counter placeholder -->
          </div>
        </div>

        <!-- Action Buttons -->
        <div :class="isKioskMode ? 'text-3xl mt-16' : 'text-base mt-8'" class="w-full font-bold text-[#A90205] whitespace-nowrap rounded-md">
          <div :class="isKioskMode ? 'gap-8 mb-16' : 'gap-3 mb-8'" class="flex">
            <button
              :class="isKioskMode ? 'h-[114px] text-4xl' : 'h-11 text-base'"
              class="flex-1 px-3 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 font-bold text-[#FBEFC2] hover:bg-[#FF7824] active:bg-[#FF7824]"
              style="background-color: #FF7824; touch-action: manipulation;"
              @click="goBack"
              @touchend.prevent="goBack"
            >
              重選範本
            </button>
            <button
              :class="[
                isKioskMode ? 'h-[114px] text-4xl' : 'h-11 text-base',
                'flex-1 px-3 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 font-bold text-[#FBEFC2] relative',
                selectedCharacter ? 'hover:bg-[#FF7824] active:bg-[#FF7824]' : 'cursor-not-allowed'
              ]"
              :style="selectedCharacter ? 'background-color: #FF7824; touch-action: manipulation;' : 'background-color: #D84729; touch-action: manipulation;'"
              @click="nextStep"
              @touchend.prevent="nextStep"
              :disabled="!selectedCharacter"
            >
              <img 
                src="/resources/images/coin_icon.png" 
                alt=""
                class="absolute pointer-events-none"
                :style="isKioskMode ? 'top: 0; right: 0; width: 123px; height: 123px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;' : 'top: 0; right: 0; width: 42px; height: 42px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;'"
              />
              下一步
            </button>
          </div>
        </div>
      </div>

      <div v-if="!selectedTemplate" class="text-center text-[#A90205] py-8">
        <div class="text-lg font-bold mb-4">無法進行換臉操作</div>
        <div class="text-sm mb-6">您需要先選擇一個模板才能繼續</div>
        <button
          class="px-6 py-3 text-[#FBEFC2] rounded-md font-bold transition-all duration-300 hover:bg-[#FF7824] active:bg-[#FF7824] relative"
          style="background-color: #FF7824; touch-action: manipulation;"
          @click="goBack"
        >
          <img 
            src="/resources/images/coin_icon.png" 
            alt=""
            class="absolute pointer-events-none"
            style="top: 0; right: 0; width: 42px; height: 42px; transform: translate(50%, -50%) rotate(-17deg); z-index: 10;"
          />
          返回選擇模板
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { imageUrls } from '../../config/imageUrls.js'

const props = defineProps({
  selectedTemplate: {
    type: String,
    default: ''
  },
  isKioskMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['next-step', 'back'])

const selectedCharacter = ref('')

// 模板對應的角色選項 - 只保留需要的 4 個模板
const templateCharacters = {
  'play': ['吳宗憲'],                    // 模板 10 (綜藝玩很大)：1個人
  'wife': ['朱芯儀', '溫昇豪', '隋棠'],  // 模板 8 (犀利人妻)：3個人
  'love': ['陳喬恩', '阮經天'],          // 模板 9 (命中註定我愛你)：2個人
  'super': ['許效舜', '苗可麗', '澎恰恰'] // 模板 11 (超級夜總會)：3個人
}

function selectCharacter(characterId, index) {
  selectedCharacter.value = characterId
  console.log('👤 選擇角色:', characterId, '索引:', index)
}

function getTemplateCharacters() {
  const templateId = props.selectedTemplate

  if (templateId && templateCharacters[templateId]) {
    return templateCharacters[templateId]
  }

  return []
}

function getTemplateImage(templateKey) {
  const imageMap = {
    'play': imageUrls.play,   // 綜藝玩很大
    'wife': imageUrls.wife,   // 犀利人妻
    'love': imageUrls.love,   // 命中註定我愛你
    'super': imageUrls.super  // 超級夜總會
  }

  return imageMap[templateKey] || imageUrls.play
}

function getTemplateName(templateId) {
  const nameMap = {
    'play': '綜藝玩很大',
    'wife': '犀利人妻',
    'love': '命中註定我愛你',
    'super': '超級夜總會'
  }

  return nameMap[templateId] || ''
}

function nextStep() {
  if (selectedCharacter.value) {
    emit('next-step', {
      selectedTemplate: props.selectedTemplate,
      selectedCharacter: selectedCharacter.value
    })
  }
}

function goBack() {
  emit('back')
}
</script>