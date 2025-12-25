<script setup lang="ts">
import Navbar from './Navbar.vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <div v-if="authStore.loading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
  
  <div v-else class="min-h-screen bg-gray-50">
    <main class="pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] md:pb-6">
      <router-view v-slot="{ Component }">
        <keep-alive :include="['Recipes', 'Fridge', 'Recommendation', 'RecipeSquare', 'Mine']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
    <Navbar />
  </div>
</template>
