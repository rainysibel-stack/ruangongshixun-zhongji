<template>
  <div class="space-y-4">
    <div v-for="i in count" :key="i" class="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      <!-- 图片占位 -->
      <div class="h-32 bg-gray-200"></div>
      <!-- 内容占位 -->
      <div class="p-4 space-y-3">
        <div class="flex justify-between">
          <div class="h-5 bg-gray-200 rounded w-1/3"></div>
          <div class="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        <div class="flex justify-between">
          <div class="h-4 bg-gray-200 rounded w-24"></div>
          <div class="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div class="flex gap-2">
          <div class="h-6 bg-gray-200 rounded w-12"></div>
          <div class="h-6 bg-gray-200 rounded w-12"></div>
          <div class="h-6 bg-gray-200 rounded w-12"></div>
        </div>
        <div class="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ count?: number }>();
</script>
