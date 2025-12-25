<script lang="ts">
export default { name: 'Recommendation' }
</script>

<script setup lang="ts">
import { ref, onMounted, watch, onActivated } from 'vue';
import api from '../api/axios';
import { Sparkles, RefreshCw, ChefHat, Clock, Star } from 'lucide-vue-next';
import RecipeSkeleton from '../components/RecipeSkeleton.vue';

const mode = ref('flexible');
const category = ref('全部');
const sort = ref('match');
const scope = ref('all'); // 'all' or 'mine'
const recipes = ref<any[]>([]);
const loading = ref(false);

const modes = [
  { id: 'flexible', name: '创意模式', desc: '允许部分食材缺失（推荐）' },
  { id: 'surprise', name: '惊喜模式', desc: '随机推荐简单快捷的美味' },
];

const categories = ['全部', '正餐', '甜点', '早餐', '汤羹'];
const scopes = [
    { id: 'all', name: '全部食谱' },
    { id: 'mine', name: '我的食谱' }
];

const sortOptions = [
  { value: 'match', label: '匹配度' },
  { value: 'time', label: '烹饪时间' },
  { value: 'difficulty', label: '难度' }
];

const fetchRecommendations = async () => {
  loading.value = true;
  try {
    const params: any = { 
      mode: mode.value,
      sort: sort.value,
      scope: scope.value
    };
    if (category.value !== '全部') {
      params.category = category.value;
    }
    const res: any = await api.get('/recommendations', { params });
    if (res.code === 200) {
      recipes.value = res.data.recipes;
    }
  } catch (error) {
    console.error("Failed to get recommendations", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRecommendations);
watch([mode, category, sort, scope], fetchRecommendations);

// 从缓存恢复时检查是否需要刷新
let lastFetchTime = Date.now();
onActivated(() => {
  if (Date.now() - lastFetchTime > 30000) {
    fetchRecommendations();
    lastFetchTime = Date.now();
  }
});

const isEmoji = (str: string) => {
    return str && !str.startsWith('http');
};

const toggleFavorite = async (recipe: any) => {
  try {
    // System recipe (user_id is null) => favorite is stored in user_recipes
    if (recipe.user_id === null || recipe.user_id === undefined) {
      const res: any = await api.post('/user-recipes/favorite', { recipe_id: recipe.id });
      if (res.code === 200) {
        recipe.is_favorite = res.data.is_favorite;
      }
      return;
    }

    // Personal recipe => favorite is stored on recipes table
    const res: any = await api.post(`/recipes/${recipe.id}/favorite`);
    if (res.code === 200) {
      recipe.is_favorite = res.data.is_favorite;
    }
  } catch (error) {
    console.error('Failed to toggle favorite', error);
  }
};
</script>

<template>
  <div class="space-y-8 px-6 py-6">
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
        <Sparkles class="text-yellow-500" />
        今天吃什么？
      </h1>
      <p class="text-gray-500">根据你的冰箱库存，为您推荐最佳食谱</p>
    </div>

    <!-- Mode Selection -->
    <div class="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
      <button
        v-for="m in modes"
        :key="m.id"
        @click="mode = m.id"
        class="p-6 rounded-xl border-2 transition-all outline-none flex flex-col items-center justify-center text-center"
        :class="mode === m.id ? 'border-brand-red bg-brand-red-50 ring-2 ring-brand-red ring-offset-2' : 'border-gray-200 bg-white hover:border-brand-red hover:bg-gray-50'"
      >
        <div class="font-bold text-lg text-gray-900 mb-1">{{ m.name }}</div>
        <div class="text-xs text-gray-500 leading-tight">{{ m.desc }}</div>
      </button>
    </div>

    <!-- Filters -->
    <div class="space-y-4">
        <!-- Row 1: Category Filters -->
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div class="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                <button 
                    v-for="cat in categories" 
                    :key="cat"
                    @click="category = cat"
                    class="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                    :class="category === cat ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                    {{ cat }}
                </button>
            </div>
        </div>
        
        <!-- Row 2: Recipe Source Filter -->
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div class="flex gap-2">
                <button 
                    v-for="s in scopes" 
                    :key="s.id"
                    @click="scope = s.id"
                    class="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                    :class="scope === s.id ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                    {{ s.name }}
                </button>
            </div>
        </div>
        
        <!-- Row 3: Sort Options -->
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm" v-if="mode !== 'strict'">
            <div class="flex gap-2">
                <button 
                    v-for="opt in sortOptions" 
                    :key="opt.value"
                    @click="sort = opt.value"
                    class="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                    :class="sort === opt.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                    {{ opt.label }}
                </button>
            </div>
        </div>
    </div>

    <!-- Results -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">推荐结果 ({{ recipes.length }})</h2>
        <button 
          @click="fetchRecommendations" 
          class="flex items-center gap-1 text-sm text-brand-red hover:text-brand-red-hover"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          换一换
        </button>
      </div>

      <RecipeSkeleton v-if="loading" :count="3" />
      
      <div v-else-if="recipes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="recipe in recipes" :key="recipe.id" class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="relative h-32 bg-gray-100 flex items-center justify-center">
            <span v-if="isEmoji(recipe.image)" class="text-4xl">{{ recipe.image }}</span>
            <img v-else :src="recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'" :alt="recipe.name" loading="lazy" class="w-full h-full object-cover" />
            <!-- Heart icon in top-right -->
            <div class="absolute top-3 right-3">
              <button
                class="p-1 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-all"
                :title="recipe.is_favorite ? '取消收藏' : '收藏'"
                @click.stop="toggleFavorite(recipe)"
              >
                <Star class="w-5 h-5 transition-colors" :class="recipe.is_favorite ? 'text-brand-red fill-current' : 'text-white'" />
              </button>
            </div>
            <!-- Missing ingredients badge in top-left -->
            <div v-if="recipe.missing_ingredients && recipe.missing_ingredients.length > 0" class="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              缺{{ recipe.missing_ingredients.length }}样
            </div>
          </div>
          
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2 min-w-0">
                <h3 class="font-bold text-lg text-gray-900 truncate">{{ recipe.name }}</h3>
                <span v-if="recipe.difficulty" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {{ recipe.difficulty }}
                </span>
              </div>
              <span class="text-xs bg-brand-red-50 text-brand-red px-2 py-1 rounded">
                {{ recipe.category }}
              </span>
            </div>
            
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-1 text-sm text-gray-500">
                <Star class="w-4 h-4 text-yellow-400 fill-current" />
                <span>做过 {{ recipe.cooked_count }} 次</span>
              </div>
              <div class="text-sm text-gray-500">{{ recipe.cooking_time }}</div>
            </div>
            
            <!-- Missing ingredients tags -->
            <div v-if="recipe.missing_ingredients && recipe.missing_ingredients.length > 0" class="flex gap-1 mb-3">
              <span v-for="ingredient in recipe.missing_ingredients.slice(0, 3)" :key="ingredient" class="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                {{ ingredient }}
              </span>
            </div>
            
            <!-- View Recipe Button -->
            <button @click="$router.push(`/recipe/${recipe.id}`)" class="w-full bg-brand-red text-white py-2 rounded-lg font-medium hover:bg-brand-red-hover transition-colors flex items-center justify-center">
              查看食谱
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200 px-6">
        <ChefHat class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900">暂无推荐</h3>
        <p class="text-gray-500 mt-1 mb-4">
          没有找到匹配的食谱，试着切换筛选条件或添加更多食材吧！
        </p>
      </div>
    </div>
  </div>
</template>
