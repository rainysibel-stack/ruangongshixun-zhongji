<script lang="ts">
export default { name: 'Mine' }
</script>

<script setup lang="ts">
import { ref, onMounted, computed, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../api/axios';
import { User, LogOut, Edit2, Save, ChefHat, Heart, ShoppingBag } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const isEditing = ref(false);
const newNickname = ref('');
const loading = ref(false);

// Stats (mock or fetched)
const stats = computed(() => ({
    recipeCount: (authStore.user as any)?.stats?.recipeCount ?? 0,
    cookedCount: (authStore.user as any)?.stats?.cookedCount ?? 0,
    favoriteCount: (authStore.user as any)?.stats?.favoriteCount ?? 0,
    fridgeCount: (authStore.user as any)?.stats?.fridgeCount ?? 0
}));

onMounted(async () => {
    if (authStore.user) {
        newNickname.value = authStore.user.nickname || '';
        await authStore.fetchUser();
        newNickname.value = authStore.user?.nickname || '';
    }
});

// 从缓存恢复时检查是否需要刷新
let lastFetchTime = Date.now();
onActivated(async () => {
  if (Date.now() - lastFetchTime > 30000) {
    await authStore.fetchUser();
    lastFetchTime = Date.now();
  }
});

const handleUpdateProfile = async () => {
    if (!newNickname.value.trim()) return;
    loading.value = true;
    try {
        const res: any = await api.put('/users/profile', { nickname: newNickname.value });
        if (res.code === 200) {
            if (authStore.user) {
                authStore.user.nickname = res.data.nickname;
            }
            isEditing.value = false;
        }
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const handleLogout = () => {
    authStore.logout();
    router.push('/login');
};
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 px-6 py-6">
    <!-- Profile Card -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div class="w-24 h-24 bg-red-50 text-brand-red rounded-full flex items-center justify-center mb-4 text-4xl shadow-inner ring-4 ring-white">
            <span v-if="authStore.user?.nickname">{{ authStore.user.nickname[0].toUpperCase() }}</span>
            <User v-else class="w-12 h-12" />
        </div>

        <div class="space-y-2 mb-8 w-full max-w-xs">
            <div v-if="isEditing" class="flex items-center gap-2">
                <input 
                    v-model="newNickname"
                    type="text" 
                    class="flex-1 input text-center font-bold text-xl text-gray-900 bg-gray-50 border-transparent focus:bg-white focus:border-brand-red rounded-xl"
                    placeholder="请输入昵称"
                />
                <button 
                    @click="handleUpdateProfile"
                    class="p-2.5 bg-brand-red text-white rounded-xl hover:bg-brand-red-hover transition-colors shadow-md shadow-brand-red/20"
                    :disabled="loading"
                >
                    <Save class="w-5 h-5" />
                </button>
            </div>
            <div v-else class="flex items-center justify-center gap-2 group cursor-pointer py-1" @click="isEditing = true">
                <h1 class="text-2xl font-bold text-gray-900">{{ authStore.user?.nickname || authStore.user?.username || '未设置昵称' }}</h1>
                <Edit2 class="w-4 h-4 text-gray-400 group-hover:text-brand-red transition-colors" />
            </div>
            
            <div class="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span class="bg-gray-100 px-3 py-1 rounded-full">ID: {{ authStore.user?.id || '-' }}</span>
                <span v-if="authStore.user?.phone">{{ authStore.user.phone }}</span>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4 w-full max-w-md">
            <!-- Stats -->
            <div class="bg-red-50/50 p-4 rounded-2xl border border-red-100/50">
                <div class="text-2xl font-bold text-gray-900">{{ stats.favoriteCount }}</div>
                <div class="text-xs text-gray-500 mt-1">收藏食谱</div>
            </div>
            <div class="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                <div class="text-2xl font-bold text-gray-900">{{ stats.cookedCount }}</div>
                <div class="text-xs text-gray-500 mt-1">全站烹饪</div>
            </div>
        </div>
    </div>

    <!-- Actions -->
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="divide-y divide-gray-50">
            <button
                @click="router.push('/?sort=favorite')"
                class="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left group"
            >
                <div class="flex items-center gap-4">
                    <div class="bg-red-50 p-2.5 rounded-xl text-brand-red group-hover:scale-110 transition-transform">
                        <Heart class="w-5 h-5" />
                    </div>
                    <span class="font-medium text-gray-900">我的收藏</span>
                </div>
                <span class="text-gray-300">→</span>
            </button>
            <button 
                @click="router.push('/')"
                class="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left group"
            >
                <div class="flex items-center gap-4">
                    <div class="bg-orange-50 p-2.5 rounded-xl text-orange-600 group-hover:scale-110 transition-transform">
                        <ChefHat class="w-5 h-5" />
                    </div>
                    <span class="font-medium text-gray-900">我的食谱 ({{ stats.recipeCount }})</span>
                </div>
                <span class="text-gray-300">→</span>
            </button>
        </div>
    </div>

    <button 
        @click="handleLogout"
        class="w-full bg-white border border-gray-200 text-brand-red font-medium p-4 rounded-3xl hover:text-brand-red hover:border-brand-red transition-all flex items-center justify-center gap-2 shadow-sm"
    >
        <LogOut class="w-5 h-5" />
        退出登录
    </button>
  </div>
</template>
