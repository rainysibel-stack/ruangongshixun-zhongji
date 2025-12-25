<script lang="ts">
export default { name: 'RecipeSquare' }
</script>

<script setup lang="ts">
import { ref, onMounted, watch, onActivated } from 'vue';
import api from '../api/axios';
import { Search, ChefHat, Clock, Plus, Check, Heart, RefreshCw } from 'lucide-vue-next';
import RecipeSkeleton from '../components/RecipeSkeleton.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const recipes = ref<any[]>([]);
const loading = ref(false);
const keyword = ref('');
const addedMap = ref<Record<number, boolean>>({});

const mode = ref<'random' | 'search'>('random');
const selectedCategory = ref('全部');
const selectedDifficulty = ref('全部');
const selectedTime = ref('全部');

const categories = ['全部', '正餐', '甜点', '早餐', '汤羹'];
const difficulties = ['全部', '简单', '中等', '困难'];
const timeOptions = [
  { label: '全部', value: '全部' },
  { label: '15分钟以内', value: '0-15' },
  { label: '15-30分钟', value: '15-30' },
  { label: '30-60分钟', value: '30-60' },
  { label: '60分钟以上', value: '60+' }
];

const fetchSystemRecipes = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (keyword.value.trim()) {
        params.search = keyword.value;
    }
    if (selectedCategory.value !== '全部') {
        params.category = selectedCategory.value;
    }
    if (selectedDifficulty.value !== '全部') {
        params.difficulty = selectedDifficulty.value;
    }
    if (selectedTime.value !== '全部') {
        params.cooking_time = selectedTime.value;
    }
    console.log('Fetching system recipes...');
    const res: any = await api.get('/user-recipes/system', { params });
    console.log('API Response:', res);
    if (res.code === 200) {
        recipes.value = res.data.recipes || [];
        console.log('Recipes loaded:', recipes.value.length);
    } else {
        console.error('API returned non-200 code:', res.code);
    }
  } catch (error) {
    console.error('Failed to fetch square recipes', error);
    recipes.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchRandomRecipes = async () => {
  loading.value = true;
  try {
    const params: any = { limit: 12 };
    if (selectedCategory.value !== '全部') {
        params.category = selectedCategory.value;
    }
    if (selectedDifficulty.value !== '全部') {
        params.difficulty = selectedDifficulty.value;
    }
    if (selectedTime.value !== '全部') {
        params.cooking_time = selectedTime.value;
    }
    const res: any = await api.get('/user-recipes/system/random', { params });
    if (res.code === 200) {
        recipes.value = res.data.recipes;
    }
  } catch (error) {
    console.error('Failed to fetch random recipes', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log('RecipeSquare mounted, fetching random recipes...');
  fetchRandomRecipes();
});

// 从缓存恢复时检查是否需要刷新
let lastFetchTime = Date.now();
onActivated(() => {
  if (Date.now() - lastFetchTime > 30000) {
    mode.value === 'random' ? fetchRandomRecipes() : fetchSystemRecipes();
    lastFetchTime = Date.now();
  }
});

// Simple debounce or just enter key for search? Button is fine.
const handleSearch = () => {
    mode.value = 'search';
    fetchSystemRecipes();
};

const handleRandom = () => {
    mode.value = 'random';
    fetchRandomRecipes();
};

watch([selectedCategory, selectedDifficulty, selectedTime], () => {
    if (mode.value === 'random') {
        fetchRandomRecipes();
    } else {
        fetchSystemRecipes();
    }
});

const isEmoji = (str: string) => {
    return str && !str.startsWith('http');
};

const handleAddRecipe = async (recipe: any) => {
    if (recipe.is_added) return;
    try {
        const res: any = await api.post('/user-recipes/add', { recipe_id: recipe.id });
        if (res.code === 200) {
            recipe.is_added = true;
            alert('已加入我的食谱！');
        }
    } catch (e: any) {
        console.error(e);
        alert(e.response?.data?.message || '加入失败');
    }
};

const handleToggleFavorite = async (recipe: any) => {
    try {
        const res: any = await api.post('/user-recipes/favorite', { recipe_id: recipe.id });
        if (res.code === 200) {
            recipe.is_favorite = res.data.is_favorite;
            if (!recipe.is_added) {
                recipe.is_added = true;
            }
        }
    } catch (e: any) {
        console.error(e);
        alert(e.response?.data?.message || '操作失败');
    }
};
</script>

<template>
  <div class="px-6 py-6 pb-24 space-y-6">
    <div class="flex justify-between items-center">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ChefHat class="text-brand-red" />
          食谱广场
        </h1>
        <p class="text-brand-red text-sm">发现更多美味，一键收藏到我的食谱</p>
      </div>
      <button 
        @click="handleRandom"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:border-brand-red hover:text-brand-red transition-colors"
      >
        <RefreshCw class="w-4 h-4" />
        随机发现
      </button>
    </div>

    <!-- Search -->
    <div class="flex gap-2">
        <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
                v-model="keyword"
                type="text" 
                placeholder="搜索食材或食谱名称..." 
                class="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-red focus:ring-brand-red text-sm"
                @keyup.enter="handleSearch"
            />
        </div>
        <button 
            @click="handleSearch"
            class="px-4 py-2.5 bg-brand-red text-white rounded-xl text-sm font-medium hover:bg-brand-red-hover transition-colors shadow-sm"
        >
            搜索
        </button>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div class="flex gap-2 overflow-x-auto pb-2">
            <button
                v-for="cat in categories"
                :key="cat"
                @click="selectedCategory = cat"
                class="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                :class="selectedCategory === cat ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
                {{ cat }}
            </button>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2">
            <button
                v-for="d in difficulties"
                :key="d"
                @click="selectedDifficulty = d"
                class="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                :class="selectedDifficulty === d ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
                {{ d }}
            </button>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2">
            <button
                v-for="opt in timeOptions"
                :key="opt.value"
                @click="selectedTime = opt.value"
                class="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                :class="selectedTime === opt.value ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
                {{ opt.label }}
            </button>
        </div>
    </div>

    <!-- List -->
    <RecipeSkeleton v-if="loading" :count="4" />

    <div v-else-if="recipes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="recipe in recipes" :key="recipe.id" class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 group hover:border-brand-red transition-all">
            <!-- Image -->
            <div 
                class="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer"
                @click="router.push(`/recipe/${recipe.id}`)"
            >
                <span v-if="isEmoji(recipe.image)" class="text-4xl text-brand-red">{{ recipe.image }}</span>
                <img v-else :src="recipe.image" class="w-full h-full object-cover" />
            </div>

            <!-- Content -->
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start">
                        <h3 
                            class="font-bold text-gray-900 mb-1 line-clamp-1 hover:text-brand-red cursor-pointer transition-colors"
                            @click="router.push(`/recipe/${recipe.id}`)"
                        >
                            {{ recipe.name }}
                        </h3>
                        <span class="text-xs px-2 py-0.5 bg-gray-100 text-brand-red rounded-full">{{ recipe.category }}</span>
                    </div>
                    <div class="text-xs text-brand-red flex items-center gap-3 mt-1">
                        <span class="flex items-center gap-1"><Clock class="w-3 h-3" /> {{ recipe.cooking_time }}</span>
                        <span>{{ recipe.difficulty }}</span>
                    </div>
                </div>

                <div class="flex justify-between items-center mt-2">
                    <button 
                        @click.stop="handleToggleFavorite(recipe)"
                        class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        :title="recipe.is_favorite ? '取消收藏' : '收藏'"
                    >
                        <Heart 
                            class="w-4 h-4 transition-colors"
                            :class="recipe.is_favorite ? 'text-brand-red fill-current' : 'text-gray-400'"
                        />
                    </button>
                    <button 
                        @click="handleAddRecipe(recipe)"
                        :disabled="recipe.is_added"
                        class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        :class="recipe.is_added ? 'bg-green-50 text-green-600 cursor-default' : 'bg-brand-red text-white hover:bg-brand-red-hover'"
                    >
                        <component :is="recipe.is_added ? Check : Plus" class="w-3 h-3" />
                        {{ recipe.is_added ? '已加入' : '加入我的食谱' }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="text-center py-12 text-gray-400">
        暂无相关系统食谱
    </div>
  </div>
</template>
