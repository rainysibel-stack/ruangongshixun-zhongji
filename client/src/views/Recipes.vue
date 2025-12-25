<script lang="ts">
export default { name: 'Recipes' }
</script>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onActivated } from 'vue';
import api from '../api/axios';
import { Plus, Clock, ChefHat, Heart, Star, Search, Trash2 } from 'lucide-vue-next';
import RecipeSkeleton from '../components/RecipeSkeleton.vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const recipes = ref<any[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const category = ref('全部');
const sort = ref('latest');
const keyword = ref('');
const page = ref(1);
const hasMore = ref(true);
const PAGE_SIZE = 10;

const categories = ['全部', '正餐', '甜点', '早餐', '汤羹'];
const sortOptions = [
  { value: 'latest', label: '最新创建' },
  { value: 'recent', label: '最近做过' },
  { value: 'favorite', label: '我的收藏' },
];

const isMine = computed(() => route.query.mine === 'true');

watch(
  () => route.query.sort,
  (newSort) => {
    if (typeof newSort === 'string' && sortOptions.some((o) => o.value === newSort)) {
      sort.value = newSort;
      return;
    }

    sort.value = 'latest';
  },
  { immediate: true }
);

const fetchRecipes = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
    page.value = 1;
    recipes.value = [];
    hasMore.value = true;
  }

  try {
    const params: any = {
      page: page.value,
      limit: PAGE_SIZE
    };
    if (category.value !== '全部') params.category = category.value;
    if (sort.value) params.sort = sort.value;
    if (keyword.value.trim()) params.keyword = keyword.value.trim();
    params.mine = 'true';
    
    // Fetch personal created recipes
    const personalRes: any = await api.get('/recipes', { params });
    // Fetch added system recipes (skip when viewing only my created recipes)
    const addedRes: any = isMine.value ? null : await api.get('/user-recipes/my-added');
    
    let allRecipes = [];
    if (personalRes.code === 200) {
      allRecipes = personalRes.data.recipes || [];
    }
    if (addedRes && addedRes.code === 200) {
      const addedRecipes = addedRes.data.recipes || [];
      // Mark added recipes with a flag
      addedRecipes.forEach((r: any) => r.is_system_recipe = true);
      allRecipes = [...allRecipes, ...addedRecipes];
    }
    
    // Filter by category if needed
    if (category.value !== '全部') {
      allRecipes = allRecipes.filter((r: any) => r.category === category.value);
    }
    
    // Sort recipes
    if (sort.value === 'latest') {
      allRecipes.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort.value === 'favorite') {
      allRecipes = allRecipes.filter((r: any) => r.is_favorite);
    }

    const normalizedKeyword = keyword.value.trim().toLowerCase();
    if (normalizedKeyword) {
      allRecipes = allRecipes.filter((r: any) => {
        const name = String(r.name || '').toLowerCase();
        if (name.includes(normalizedKeyword)) return true;

        const rawIngredients = r.ingredients;
        let ingredients: any[] = [];
        if (Array.isArray(rawIngredients)) {
          ingredients = rawIngredients;
        } else {
          try {
            ingredients = JSON.parse(rawIngredients);
          } catch (e) {
            ingredients = [];
          }
        }

        if (!Array.isArray(ingredients)) return false;

        return ingredients.some((ing: any) => {
          if (typeof ing === 'string') return ing.toLowerCase().includes(normalizedKeyword);
          const ingName = String(ing?.name || ing?.ingredient_name || '').toLowerCase();
          return ingName.includes(normalizedKeyword);
        });
      });
    }
    
    if (isLoadMore) {
      recipes.value.push(...allRecipes);
    } else {
      recipes.value = allRecipes;
    }
    
    hasMore.value = false; // Disable pagination for now since we're fetching all
  } catch (error) {
    console.error('Failed to fetch recipes', error);
    if (!isLoadMore) recipes.value = [];
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const handleSearch = () => {
  fetchRecipes(false);
};

const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    page.value++;
    fetchRecipes(true);
  }
};

// 初始加载
onMounted(() => fetchRecipes(false));

// 从缓存恢复时，检查是否需要刷新（超过30秒则刷新）
let lastFetchTime = Date.now();
onActivated(() => {
  if (Date.now() - lastFetchTime > 30000) {
    fetchRecipes(false);
    lastFetchTime = Date.now();
  }
});

// 筛选条件变化时重新加载（不用 immediate，避免和 onMounted 重复）
watch([category, sort, isMine], () => fetchRecipes(false));

const isEmoji = (str: string) => {
    return str && !str.startsWith('http');
};

const getIngredientTags = (recipe: any) => {
  if (!recipe.ingredients) return [];
  let ingredients = [];
  if (Array.isArray(recipe.ingredients)) {
    ingredients = recipe.ingredients;
  } else {
    try {
      ingredients = JSON.parse(recipe.ingredients);
    } catch (e) {
      return [];
    }
  }
  return ingredients.slice(0, 3).map((ing: any) => ing.name || ing);
};

const toggleFavorite = async (recipe: any) => {
  try {
    // System recipe => favorite stored in user_recipes
    if (recipe.is_system_recipe) {
      const res: any = await api.post('/user-recipes/favorite', { recipe_id: recipe.id });
      if (res.code === 200) {
        recipe.is_favorite = res.data.is_favorite;
        if (sort.value === 'favorite' && !recipe.is_favorite) {
          recipes.value = recipes.value.filter((r: any) => r.id !== recipe.id);
        }
      }
      return;
    }

    // Personal recipe => favorite stored on recipes table
    const res: any = await api.post(`/recipes/${recipe.id}/favorite`);
    if (res.code === 200) {
      recipe.is_favorite = res.data.is_favorite;
      if (sort.value === 'favorite' && !recipe.is_favorite) {
        recipes.value = recipes.value.filter((r: any) => r.id !== recipe.id);
      }
    }
  } catch (error) {
    console.error('Failed to toggle favorite', error);
  }
};

const deleteRecipe = async (recipe: any) => {
  try {
    if (recipe.is_system_recipe) {
      const ok = window.confirm('确认从我的食谱中移除该系统食谱吗？');
      if (!ok) return;

      const res: any = await api.delete(`/user-recipes/remove/${recipe.id}`);
      if (res.code === 200) {
        await fetchRecipes(false);
      } else {
        alert(res.message || '移除失败');
      }
      return;
    }

    const ok = window.confirm('确认删除该食谱吗？删除后不可恢复。');
    if (!ok) return;

    const res: any = await api.delete(`/recipes/${recipe.id}`);
    if (res.code === 200) {
      await fetchRecipes(false);
    } else {
      alert(res.message || '删除失败');
    }
  } catch (error: any) {
    alert(error?.response?.data?.message || '删除失败');
  }
};
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Search Bar -->
    <div class="bg-white px-6 py-4 shadow-sm">
      <div class="flex gap-2">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            v-model="keyword"
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
      <!-- Mine Filter Indicator -->
      <div v-if="isMine" class="mt-3 flex items-center">
        <span class="text-sm text-gray-500 mr-2">当前筛选:</span>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-red-50 text-brand-red">
          我的食谱
          <button @click="router.push('/')" class="ml-2 focus:outline-none hover:text-brand-red-hover">
            ×
          </button>
        </span>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="bg-white px-6 py-2 border-b border-gray-100">
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="category = cat"
          class="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
          :class="category === cat ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600'"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Sort Options -->
    <div class="bg-white px-6 py-2 border-b border-gray-100">
      <div class="flex gap-2">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          @click="sort = option.value"
          class="px-3 py-1 text-sm rounded-full transition-colors"
          :class="sort === option.value ? 'bg-brand-red text-white' : 'text-gray-600'"
        >
          {{ option.label }}
        </button>
      </div>
    </div>


    <!-- Loading Skeleton -->
    <div v-if="loading" class="px-6">
      <RecipeSkeleton :count="3" />
    </div>

    <!-- Recipe Cards -->
    <div v-else-if="recipes.length > 0" class="px-6 space-y-4">
      <div
        v-for="recipe in recipes"
        :key="recipe.id"
        class="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
        @click="router.push(`/recipe/${recipe.id}`)"
      >
        <!-- Recipe Image and Info -->
        <div class="relative h-32 bg-gray-100 flex items-center justify-center">
          <span v-if="isEmoji(recipe.image)" class="text-4xl">{{ recipe.image }}</span>
          <img
            v-else
            :src="recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'"
            :alt="recipe.name"
            loading="lazy"
            class="w-full h-full object-cover"
          />
          <div class="absolute top-3 left-3">
            <button @click.stop="deleteRecipe(recipe)" class="p-1 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-all">
              <Trash2 class="w-5 h-5 text-white" />
            </button>
          </div>
          <div class="absolute top-3 right-3">
            <button @click.stop="toggleFavorite(recipe)" class="p-1 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-all">
              <Heart
                class="w-5 h-5 transition-colors"
                :class="recipe.is_favorite ? 'text-brand-red fill-current' : 'text-white'"
              />
            </button>
          </div>
        </div>
        
        <!-- Recipe Details -->
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
          
          <!-- Ingredient Tags -->
          <div class="flex gap-1 mb-3">
            <span 
              v-for="ingredient in getIngredientTags(recipe).slice(0, 3)" 
              :key="ingredient"
              class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {{ ingredient }}
            </span>
          </div>
          
          <!-- View Recipe Button -->
          <button class="w-full bg-brand-red text-white py-2 rounded-lg font-medium hover:bg-brand-red-hover transition-colors flex items-center justify-center">
            查看食谱
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 px-6">
      <ChefHat class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">暂无食谱</h3>
      <p class="text-gray-500 mb-6">快来创建你的第一个食谱吧！</p>
      <router-link
        to="/add-recipe"
        class="inline-flex items-center justify-center px-6 py-3 bg-brand-red text-white rounded-lg hover:bg-brand-red-hover transition-colors"
      >
        <Plus class="w-5 h-5 mr-2" />
        新增食谱
      </router-link>
    </div>
    <!-- Floating Add Button -->
    <router-link
      to="/add-recipe"
      class="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 md:bottom-4 w-14 h-14 bg-brand-red text-white rounded-full shadow-lg hover:bg-brand-red-hover transition-all flex items-center justify-center z-40"
    >
      <Plus class="w-6 h-6" />
    </router-link>
  </div>
</template>
