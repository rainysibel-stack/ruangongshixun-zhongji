<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/axios';
import { Clock, ChefHat, Heart, ArrowLeft, Flame, Award, PlayCircle } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const recipe = ref<any>(null);
const loading = ref(true);
const toggleLoading = ref(false);

onMounted(async () => {
  await fetchRecipe();
});

const fetchRecipe = async () => {
  loading.value = true;
  try {
    const res: any = await api.get(`/recipes/${route.params.id}`);
    if (res.code === 200) {
      recipe.value = res.data;
    }
  } catch (error) {
    console.error('Failed to fetch recipe', error);
    router.push('/');
  } finally {
    loading.value = false;
  }
};

const isEmoji = (str: string) => {
    return str && !str.startsWith('http');
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
};

const parsedSteps = computed(() => {
    if (!recipe.value || !recipe.value.steps) return [];
    if (Array.isArray(recipe.value.steps)) return recipe.value.steps;
    try {
        return JSON.parse(recipe.value.steps);
    } catch (e) {
        return [recipe.value.steps];
    }
});

const parsedIngredients = computed(() => {
    if (!recipe.value || !recipe.value.ingredients) return [];
    if (Array.isArray(recipe.value.ingredients)) return recipe.value.ingredients;
    try {
        return JSON.parse(recipe.value.ingredients);
    } catch (e) {
        return [];
    }
});

const parsedNutrition = computed(() => {
     if (!recipe.value || !recipe.value.nutrition) return null;
     if (typeof recipe.value.nutrition === 'object') return recipe.value.nutrition;
     try {
         return JSON.parse(recipe.value.nutrition);
     } catch (e) {
         return null;
     }
});

const handleToggleFavorite = async () => {
    if (toggleLoading.value) return;
    toggleLoading.value = true;
    try {
        // System recipe => favorite stored in user_recipes
        if (recipe.value.user_id === null || recipe.value.user_id === undefined) {
            const res: any = await api.post('/user-recipes/favorite', { recipe_id: recipe.value.id });
            if (res.code === 200) {
                recipe.value.is_favorite = res.data.is_favorite;
            }
            return;
        }

        // Personal recipe => favorite stored on recipes table
        const res: any = await api.post(`/recipes/${recipe.value.id}/favorite`);
        if (res.code === 200) {
            recipe.value.is_favorite = res.data.is_favorite;
        }
    } catch (e) {
        console.error(e);
    } finally {
        toggleLoading.value = false;
    }
};

const handleStartCooking = async () => {
    try {
        const res: any = await api.post(`/recipes/${recipe.value.id}/cook`);
        if (res.code === 200) {
            recipe.value.cooked_count = res.data.cooked_count;
            alert('开始烹饪！祝您大显身手！');
        }
    } catch (e) {
        console.error(e);
    }
};

const nutritionList = computed(() => {
    const n = parsedNutrition.value;
    if (!n) return [];
    if (Array.isArray(n)) return n;
    return Object.entries(n).map(([key, value]) => {
        let label = key;
        if (key === 'calories') label = '热量';
        if (key === 'protein') label = '蛋白质';
        if (key === 'carbs') label = '碳水';
        if (key === 'fat') label = '脂肪';
        return { label, value };
    });
});

</script>

<template>
  <div v-if="loading" class="flex justify-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
  </div>

  <div v-else-if="!recipe" class="text-center py-12">食谱未找到</div>

  <div v-else class="max-w-4xl mx-auto space-y-6 pb-20 px-6 py-6">
    <div class="flex items-center justify-between">
        <button 
        @click="router.back()" 
        class="flex items-center text-brand-red hover:text-gray-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm"
        >
        <ArrowLeft class="w-5 h-5 mr-1" />
        返回
        </button>
        
        <div class="flex gap-2">
            <button 
                @click="handleToggleFavorite"
                class="flex items-center gap-2 px-4 py-2 rounded-full transition-all border shadow-sm"
                :class="recipe.is_favorite ? 'bg-brand-red border-brand-red text-white' : 'bg-white border-gray-200 text-brand-red hover:bg-gray-50'"
            >
                <Heart class="w-5 h-5" :class="{ 'fill-current': recipe.is_favorite }" />
                {{ recipe.is_favorite ? '已收藏' : '收藏' }}
            </button>
        </div>
    </div>

    <div class="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
      <!-- Image Section -->
      <div class="relative h-72 sm:h-96 bg-orange-50 flex items-center justify-center overflow-hidden">
          <span v-if="isEmoji(recipe.image)" class="text-[120px]">{{ recipe.image.replace(/[^\u{1F300}-\u{1F9FF}]/gu, '') || '🍳' }}</span>
          <img 
             v-else
             :src="recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'" 
             :alt="recipe.name" 
             class="w-full h-full object-cover"
           />
      </div>

      <!-- Header Info Section (Now separated from image) -->
      <div class="px-6 py-8 border-b border-gray-100">
           <div class="flex flex-wrap items-center gap-3 mb-4">
                <span class="px-3 py-1 rounded-full bg-brand-red-50 text-brand-red text-xs font-bold tracking-wider uppercase shadow-sm">
                    {{ recipe.category }}
                </span>
                <span class="flex items-center text-gray-600 text-sm font-medium bg-gray-100 px-2 py-1 rounded-lg">
                    <Clock class="w-4 h-4 mr-1.5" />
                    {{ recipe.cooking_time }}
                </span>
                <span class="flex items-center text-gray-600 text-sm font-medium bg-gray-100 px-2 py-1 rounded-lg">
                    <ChefHat class="w-4 h-4 mr-1.5" />
                    {{ recipe.difficulty }}
                </span>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-gray-900">{{ recipe.name }}</h1>
            <p class="text-brand-red text-sm flex items-center">
                <Award class="w-4 h-4 mr-1.5" />
                已被烹饪 <span class="font-bold text-gray-900 mx-1">{{ recipe.cooked_count }}</span> 次
            </p>
      </div>

      <div class="p-6 sm:p-10 grid md:grid-cols-3 gap-10">
          
          <div class="md:col-span-1 space-y-8">
              <div class="block md:hidden">
                  <button 
                    @click="handleStartCooking"
                    class="w-full py-3 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-[#e74c3c]/30 bg-brand-red text-white hover:bg-[#c0392b] font-medium transition-all active:scale-95"
                  >
                    <PlayCircle class="w-6 h-6 mr-2" />
                    开始烹饪
                  </button>
              </div>

              <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-5 flex items-center">
                      <span class="w-1.5 h-6 bg-brand-red rounded-full mr-3"></span>
                      所需食材
                  </h3>
                  <div class="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <ul class="space-y-4">
                        <li v-for="(ing, idx) in parsedIngredients" :key="idx" class="flex justify-between items-center pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                            <span class="text-gray-800 font-medium">{{ ing.name }}</span>
                            <span class="text-brand-red font-medium bg-white px-2 py-1 rounded-md shadow-sm text-xs">{{ ing.quantity || ing.amount }}</span>
                        </li>
                    </ul>
                  </div>
              </div>

              <div v-if="nutritionList.length > 0" class="mt-6">
                  <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Flame class="w-5 h-5 mr-2 text-orange-500" />
                      营养参考
                  </h3>
                  <div class="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                      <div class="grid grid-cols-2 gap-4">
                          <div v-for="(nut, idx) in nutritionList" :key="idx" class="bg-white/60 p-2 rounded-lg">
                              <span class="text-orange-800/60 text-xs block mb-1">{{ nut.label }}</span>
                              <span class="text-orange-900 font-bold">{{ nut.value }}</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div class="md:col-span-2 space-y-8">
              <div class="hidden md:flex justify-end">
                   <button 
                    @click="handleStartCooking"
                    class="py-3 px-8 rounded-xl flex items-center text-lg shadow-lg shadow-[#e74c3c]/30 bg-brand-red text-white hover:bg-[#c0392b] hover:-translate-y-0.5 transition-all font-medium"
                  >
                    <PlayCircle class="w-6 h-6 mr-2" />
                    开始烹饪
                  </button>
              </div>

              <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span class="w-1.5 h-6 bg-brand-red rounded-full mr-3"></span>
                      烹饪步骤
                  </h3>
                  <div class="space-y-8">
                      <div v-for="(step, idx) in parsedSteps" :key="idx" class="group relative pl-8">
                          <div v-if="idx !== parsedSteps.length - 1" class="absolute left-3.5 top-8 bottom-[-32px] w-0.5 bg-gray-100 group-hover:bg-brand-red transition-colors"></div>
                          
                          <div class="absolute left-0 top-0 w-8 h-8 rounded-full bg-brand-red text-brand-red font-bold flex items-center justify-center border-2 border-white shadow-sm z-10 group-hover:bg-brand-red group-hover:text-white transition-colors">
                              {{ idx + 1 }}
                          </div>
                          
                          <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md group-hover:border-brand-red transition-all">
                              <p class="text-gray-700 leading-relaxed text-lg">
                                  {{ step }}
                              </p>
                          </div>
                      </div>
                  </div>
              </div>

              <div v-if="recipe.tips && recipe.tips.trim()" class="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 mt-8">
                  <div class="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <span class="text-xl">💡</span>
                  </div>
                  <div>
                    <h3 class="text-blue-900 font-bold mb-2 text-sm uppercase tracking-wide">小贴士</h3>
                    <p class="text-blue-800 leading-relaxed whitespace-pre-line">
                        {{ recipe.tips }}
                    </p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-shadow {
    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
</style>
