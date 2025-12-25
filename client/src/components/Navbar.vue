<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { ChefHat, Refrigerator, Utensils, User, LogOut, Menu, X, Search } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const isMenuOpen = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const navItems = [
  { path: '/', label: '我的食谱', icon: ChefHat },
  { path: '/fridge', label: '我的冰箱', icon: Refrigerator },
  { path: '/square', label: '食谱广场', icon: Search },
  { path: '/recommend', label: '吃什么', icon: Utensils },
  { path: '/mine', label: '我的', icon: User },
];

const isActive = (path: string) => route.path === path;
</script>

<template>
  <!-- Mobile Bottom Navigation for iPhone 14 Pro Max -->
  <nav class="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-[999] md:relative md:border-t-0 md:border-b md:top-0 md:bottom-auto pb-[env(safe-area-inset-bottom)] md:pb-0 transition-all duration-300">
    <!-- Desktop Header (hidden on mobile) -->
    <div class="hidden md:block bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex-shrink-0 flex items-center gap-2">
              <div class="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-white font-bold">
                <ChefHat :size="20" />
              </div>
              <span class="font-bold text-xl text-gray-800">小小美食家</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="authStore.user">
              <router-link
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                class="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                :class="isActive(item.path) ? 'text-brand-red bg-red-50' : 'text-gray-600 hover:text-brand-red hover:bg-red-50'"
              >
                <component :is="item.icon" class="w-5 h-5" />
                {{ item.label }}
              </router-link>
              <button
                @click="handleLogout"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-brand-red hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut class="w-5 h-5" />
                退出
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Bottom Navigation -->
    <div class="md:hidden">
      <div class="flex justify-around items-center h-16 px-2" v-if="authStore.user">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors"
          :class="isActive(item.path) ? 'text-brand-red' : 'text-gray-500'"
        >
          <component :is="item.icon" class="w-6 h-6 mb-1" />
          <span class="text-xs font-medium">{{ item.label }}</span>
        </router-link>
      </div>
    </div>
  </nav>

</template>
