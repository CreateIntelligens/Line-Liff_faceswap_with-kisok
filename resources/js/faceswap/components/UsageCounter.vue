<template>
  <div class="flex items-center justify-center">
    <div
      class="font-noto-sans-tc text-xs font-bold px-3 py-1.5 rounded-full border-2 whitespace-nowrap"
      style="background-color: #A90205; border-color: #A90205; color: #FFE276;"
    >
      已生成：{{ currentCount }}/{{ maxLimit }}
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  currentCount: {
    type: Number,
    default: 0
  },
  maxLimit: {
    type: Number,
    default: 4
  }
})

// 監聽 currentCount 的變化，用於調試
watch(() => props.currentCount, (newCount, oldCount) => {
  if (oldCount !== newCount) {
    console.log('📊 使用量更新:', `${oldCount || 0} → ${newCount}`)
  }
}, { immediate: true })
</script>
