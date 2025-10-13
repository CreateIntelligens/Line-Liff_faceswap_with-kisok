<template>
  <div
    class="relative mx-auto my-0 bg-black h-screen w-full lg:h-full lg:w-full lg:flex lg:flex-col lg:px-[5.4%]"
  >
    <!-- Header -->
    <div class="flex gap-5 justify-center items-center px-12 pt-12 pb-8 w-full font-bold min-h-20 lg:pt-20 lg:pb-8">
      <img
        :src="imageUrls.header"
        class="h-20 object-contain lg:h-48"
        alt="2025三立集團內容創新發布會"
      />
    </div>

    <!-- 步驟進度條 -->
    <div class="flex max-w-full text-base font-bold text-center text-[#EBD8B2] whitespace-nowrap w-[202px] mx-auto lg:w-[404px]">
      <img :src="imageUrls.step1" class="w-6 h-6 object-contain lg:w-12 lg:h-12" alt="Step 1">
      <img :src="imageUrls.horizontal" class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px] lg:w-[130px]">
      <img :src="imageUrls.step2_inactive" class="w-6 h-6 object-contain lg:w-12 lg:h-12" alt="Step 2">
      <img :src="imageUrls.horizontal" class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px] lg:w-[130px]">
      <img :src="imageUrls.step3_inactive" class="w-6 h-6 object-contain lg:w-12 lg:h-12" alt="Step 3">
    </div>

    <!-- 步驟文字 -->
    <div class="flex gap-5 justify-between max-w-full text-sm text-center text-[#EBD8B2] w-[218px] mx-auto lg:w-[436px] lg:text-2xl lg:gap-10">
      <div>Step 1</div>
      <div>Step 2</div>
      <div>Step 3</div>
    </div>

    <div class="mt-14 w-full max-w-[338px] mx-auto lg:max-w-[90%] lg:mt-14">
      <div class="flex flex-col w-full">
        <div class="flex flex-col w-full">
          <div class="flex gap-2.5 items-center font-bold whitespace-nowrap lg:justify-start">
            <div class="self-stretch my-auto text-lg text-[#333333] w-6 h-6 lg:w-12 lg:h-12">
              <img
                src="/resources/images/step1.png"
                class="w-6 h-6 object-contain lg:w-12 lg:h-12"
                alt="Step 1"
              />
            </div>
            <div class="self-stretch my-auto text-base text-[#EBD8B2] lg:text-3xl">
              請選擇要換臉的人物
            </div>
          </div>

          <div class="mt-9 w-full">
            <!-- Selected Template Image -->
            <div class="mb-8">
              <div v-if="selectedTemplate" class="w-full h-[273px] lg:h-[800px]">
                <img
                  class="w-full h-full object-cover rounded-md lg:rounded-xl"
                  :src="getTemplateImage(selectedTemplate)"
                  :alt="getTemplateName(selectedTemplate)"
                />
              </div>
              <div v-else class="w-full h-[273px] flex items-center justify-center bg-gray-700 rounded-md border-2 border-dashed border-[#EBD8B2] lg:h-[800px] lg:rounded-xl">
                <div class="text-center text-[#EBD8B2]">
                  <div class="text-lg font-bold mb-2 lg:text-3xl lg:mb-4">請先選擇模板</div>
                  <div class="text-sm lg:text-xl">請回到上一步選擇您想要的換臉模板</div>
                </div>
              </div>
            </div>

            <!-- Character Selection -->
            <div v-if="selectedTemplate" class="mb-8">
              <h3 class="text-base font-bold text-center text-[#EBD8B2] mb-4 lg:text-3xl lg:mb-8">
                請選擇要換臉的人物
              </h3>
              <div class="flex justify-center gap-4 lg:gap-8">
                <button
                  v-for="(character, index) in getTemplateCharacters()"
                  :key="index"
                  class="flex-1 h-11 px-3 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 text-base font-bold lg:h-24 lg:text-3xl lg:rounded-xl"
                  :class="
                    selectedCharacter === `character${index + 1}`
                      ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] shadow-lg text-gray-800'
                      : 'text-[#333]'
                  "
                  :style="
                    selectedCharacter === `character${index + 1}`
                      ? ''
                      : 'background: radial-gradient(50% 50% at 50% 50%, #FFF8E9 0%, #DEC799 100%); box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);'
                  "
                  @click="selectCharacter(`character${index + 1}`, index)"
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
        <div class="w-full text-base font-bold text-white whitespace-nowrap rounded-md lg:text-3xl">
          <div class="flex gap-3 mb-8 lg:gap-6 lg:mb-16">
            <button
              class="flex-1 h-11 px-3 py-3 justify-center items-center rounded-md cursor-pointer hover:shadow-lg transition-all duration-300 text-base font-bold text-[#333] lg:h-24 lg:text-3xl lg:rounded-xl"
              style="background: radial-gradient(50% 50% at 50% 50%, #FFF8E9 0%, #DEC799 100%); box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);"
              @click="goBack"
            >
              重選範本
            </button>
            <button
              class="flex-1 h-11 px-3 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 text-base font-bold lg:h-24 lg:text-3xl lg:rounded-xl"
              :class="
                selectedCharacter
                  ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] via-[#B9B9FB] to-[#AFCBF7] hover:shadow-lg text-gray-800'
                  : 'bg-[#C7C7C7] text-white'
              "
              @click="nextStep"
              :disabled="!selectedCharacter"
            >
              下一步
            </button>
          </div>
        </div>
      </div>

      <div v-if="!selectedTemplate" class="text-center text-[#EBD8B2] py-8">
        <div class="text-lg font-bold mb-4 lg:text-3xl lg:mb-8">無法進行換臉操作</div>
        <div class="text-sm mb-6 lg:text-xl lg:mb-12">您需要先選擇一個模板才能繼續</div>
        <button
          class="px-6 py-3 text-[#333] rounded-md font-bold hover:shadow-lg transition-all duration-300 lg:px-12 lg:py-6 lg:text-2xl lg:rounded-xl"
          style="background: radial-gradient(50% 50% at 50% 50%, #FFF8E9 0%, #DEC799 100%); box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);"
          @click="goBack"
        >
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