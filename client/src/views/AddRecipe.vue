<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-vue-next';

const router = useRouter();
const loading = ref(false);

const formData = reactive({
  name: '',
  category: '正餐',
  difficulty: '简单',
  cooking_time: '',
  image: '',
  tips: ''
});

const ingredients = ref([{ name: '', amount: '' }]);
const steps = ref(['']);

const addIngredient = () => {
  ingredients.value.push({ name: '', amount: '' });
};

const removeIngredient = (index: number) => {
  ingredients.value.splice(index, 1);
};

const addStep = () => {
  steps.value.push('');
};

const removeStep = (index: number) => {
  steps.value.splice(index, 1);
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const res: any = await api.post('/recipes', {
      ...formData,
      ingredients: ingredients.value.filter(i => i.name.trim()),
      steps: steps.value.filter(s => s.trim()),
      nutrition: []
    });
    if (res.code === 200) {
      router.push('/');
    }
  } catch (error) {
    console.error("Failed to create recipe", error);
    alert('创建失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="flex items-center gap-3 mb-4">
      <button @click="router.back()" class="p-2 text-brand-red hover:text-brand-red-hover">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-xl font-bold text-gray-900">创建新食谱</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
      
      <!-- Basic Info -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900 border-b pb-2">基本信息</h2>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">食谱名称</label>
          <input 
            type="text" 
            v-model="formData.name"
            required
            class="input h-11"
            placeholder="例如：番茄炒蛋"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select v-model="formData.category" class="input h-11">
              <option>正餐</option>
              <option>甜点</option>
              <option>早餐</option>
              <option>汤羹</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">难度</label>
            <select v-model="formData.difficulty" class="input h-11">
              <option>简单</option>
              <option>中等</option>
              <option>困难</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">烹饪时间</label>
            <input 
              type="text" 
              v-model="formData.cooking_time"
              class="input h-11"
              placeholder="例如：30分钟"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">封面图片 (URL 或 Emoji)</label>
          <input 
            type="text" 
            v-model="formData.image"
            class="input h-11"
            placeholder="https://... 或 🍳"
          />
        </div>
      </div>

      <!-- Ingredients -->
      <div class="space-y-4">
        <div class="flex justify-between items-center border-b pb-2">
          <h2 class="text-lg font-semibold text-gray-900">食材清单</h2>
          <button type="button" @click="addIngredient" class="text-sm text-brand-red flex items-center hover:text-brand-red-hover cursor-pointer font-medium px-2 py-1 rounded-md hover:bg-brand-red-50 transition-colors">
            <Plus class="w-4 h-4 mr-1" /> 添加食材
          </button>
        </div>
        
        <div class="space-y-3">
          <div v-for="(ing, idx) in ingredients" :key="idx" class="flex gap-3">
            <input 
              type="text"
              placeholder="食材名称 (如: 鸡蛋)"
              v-model="ing.name"
              class="flex-1 input h-10 text-sm"
              :required="idx === 0"
            />
            <input 
              type="text"
              placeholder="用量 (如: 2个)"
              v-model="ing.amount"
              class="w-1/3 input h-10 text-sm"
            />
            <button v-if="ingredients.length > 1" type="button" @click="removeIngredient(idx)" class="text-gray-400 hover:text-brand-red transition-colors p-2">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Steps -->
      <div class="space-y-4">
        <div class="flex justify-between items-center border-b pb-2">
          <h2 class="text-lg font-semibold text-gray-900">烹饪步骤</h2>
          <button type="button" @click="addStep" class="text-sm text-brand-red flex items-center hover:text-brand-red-hover cursor-pointer font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors">
            <Plus class="w-4 h-4 mr-1" /> 添加步骤
          </button>
        </div>
        
        <div class="space-y-3">
          <div v-for="(step, idx) in steps" :key="idx" class="flex gap-3 items-start">
            <span class="mt-2 text-sm font-bold text-brand-red w-6 text-center">{{ idx + 1 }}.</span>
            <textarea
              rows="2"
              :placeholder="`步骤 ${idx + 1} 说明...`"
              v-model="steps[idx]"
              class="flex-1 input text-sm py-2"
              :required="idx === 0"
            ></textarea>
            <button v-if="steps.length > 1" type="button" @click="removeStep(idx)" class="mt-2 text-gray-400 hover:text-brand-red transition-colors p-2">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Tips -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900 border-b pb-2">小贴士</h2>
        <textarea
          rows="3"
          v-model="formData.tips"
          class="w-full input text-sm py-2"
          placeholder="分享一些烹饪技巧或注意事项..."
        ></textarea>
      </div>

      <div class="pt-4">
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-brand-red hover:bg-brand-red-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-70 transition-all hover:shadow-lg active:scale-[0.98]"
        >
          <span v-if="loading" class="flex items-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            保存中...
          </span>
          <span v-else class="flex items-center"><Save class="w-5 h-5 mr-2" /> 保存食谱</span>
        </button>
      </div>

    </form>
  </div>
</template>
