<script lang="ts">
export default { name: 'Fridge' }
</script>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, onActivated } from 'vue';
import api from '../api/axios';
import { Plus, ShoppingCart, Trash2, ArrowRight } from 'lucide-vue-next';

const fridge = ref<any>(null);
const items = ref<any[]>([]);
const shoppingItems = ref<any[]>([]);
const view = ref('category');
const loading = ref(true);

const newItem = reactive({
  ingredient_name: '',
  quantity: '',
  category: '蔬菜水果'
});
const newShoppingItem = reactive({
  name: '',
  quantity: '',
  category: '蔬菜水果'
});

const categories = ['蔬菜水果', '肉禽蛋奶', '调味料', '其他'];

const fetchData = async () => {
  loading.value = true;
  try {
    // Fetch fridge and shopping items in parallel for faster loading
    const [fridgeRes, shopRes]: any = await Promise.all([
      api.get('/fridges'),
      api.get('/shoppingitems')
    ]);
    
    if (fridgeRes.code === 200) {
      fridge.value = fridgeRes.data;
      // Fetch items immediately after getting fridge
      const itemsRes: any = await api.get(`/fridges/${fridgeRes.data.id}/items`);
      if (itemsRes.code === 200) {
        items.value = itemsRes.data.items;
      }
    }
    
    if (shopRes.code === 200) {
      shoppingItems.value = shopRes.data.items;
    }
  } catch (error) {
    console.error("Failed to load data", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

// 从缓存恢复时检查是否需要刷新
let lastFetchTime = Date.now();
onActivated(() => {
  if (Date.now() - lastFetchTime > 30000) {
    fetchData();
    lastFetchTime = Date.now();
  }
});

const addItem = async () => {
  if (!newItem.ingredient_name.trim()) return;
  
  try {
    const res: any = await api.post(`/fridges/${fridge.value.id}/items`, {
      ingredient_name: newItem.ingredient_name,
      quantity: newItem.quantity,
      category: newItem.category
    });
    
    if (res.code === 200) {
      await fetchData();
      newItem.ingredient_name = '';
      newItem.quantity = '';
      newItem.category = '蔬菜水果';
    }
  } catch (error) {
    console.error('Failed to add item', error);
  }
};

const addShoppingItem = async () => {
  if (!newShoppingItem.name.trim()) return;
  
  try {
    const res: any = await api.post('/shoppingitems', {
      name: newShoppingItem.name,
      quantity: newShoppingItem.quantity,
      category: newShoppingItem.category
    });
    
    if (res.code === 200) {
      await fetchShoppingItems();
      newShoppingItem.name = '';
      newShoppingItem.quantity = '';
      newShoppingItem.category = '蔬菜水果';
    }
  } catch (error) {
    console.error('Failed to add shopping item', error);
  }
};

const fetchShoppingItems = async () => {
  try {
    const res: any = await api.get('/shoppingitems');
    if (res.code === 200) {
      shoppingItems.value = res.data.items;
    }
  } catch (error) {
    console.error('Failed to fetch shopping items', error);
  }
};

const fetchFridgeItems = async () => {
  try {
    if (fridge.value) {
      const res: any = await api.get(`/fridges/${fridge.value.id}/items`);
      if (res.code === 200) {
        items.value = res.data.items;
      }
    }
  } catch (error) {
    console.error('Failed to fetch fridge items', error);
  }
};

const handleAddToFridge = async (itemId: number) => {
  try {
    const res: any = await api.post(`/shoppingitems/${itemId}/to-fridge`);
    if (res.code === 200) {
      await fetchShoppingItems();
      await fetchFridgeItems();
      alert(res.message || '已添加到冰箱');
    }
  } catch (error) {
    console.error("Move to fridge failed", error);
  }
};

const deleteShoppingItem = async (itemId: number) => {
  try {
    const res: any = await api.delete(`/shoppingitems/${itemId}`);
    if (res.code === 200) {
      await fetchShoppingItems();
    }
  } catch (error) {
    console.error("Delete shopping item failed", error);
  }
};

const deleteFridgeItem = async (itemId: number) => {
  try {
    const res: any = await api.delete(`/fridges/items/${itemId}`);
    if (res.code === 200) {
      await fetchFridgeItems();
    }
  } catch (error) {
    console.error("Delete fridge item failed", error);
  }
};

const groupedItems = computed(() => {
  return items.value.reduce((acc, item) => {
    const cat = item.category || '其他';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, any[]>);
});

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
</script>

<template>
  <div class="grid lg:grid-cols-3 gap-8 px-6 py-6">
    <!-- Left Column: Fridge Inventory (2/3 width) -->
    <div class="lg:col-span-2 space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            我的冰箱
            <span class="text-sm font-normal text-brand-red bg-gray-100 px-2 py-1 rounded-full">
              {{ items.length }} 种食材
            </span>
          </h1>
        </div>

        <!-- Add Item Form -->
        <form @submit.prevent="addItem" class="mb-4">
        <div class="grid grid-cols-4 gap-3 items-end">
          <div class="col-span-1">
            <label class="block text-xs font-medium text-brand-red mb-1">食材名称</label>
            <input 
              type="text" 
              v-model="newItem.ingredient_name"
              class="w-full h-10 text-sm border-gray-300 rounded-lg px-3 border outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
              placeholder="如: 番茄"
              required
            />
          </div>
          <div class="col-span-1">
            <label class="block text-xs font-medium text-brand-red mb-1">数量单位</label>
            <input 
              type="text" 
              v-model="newItem.quantity"
              class="w-full h-10 text-sm border-gray-300 rounded-lg px-3 border outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
              placeholder="2个"
            />
          </div>
          <div class="col-span-1">
            <label class="block text-xs font-medium text-brand-red mb-1">分类</label>
            <select 
               v-model="newItem.category"
               class="w-full h-10 text-sm border-gray-300 rounded-lg px-3 border outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all bg-white"
            >
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="col-span-1">
            <button type="submit" class="w-full h-10 bg-brand-red text-white rounded-lg hover:bg-brand-red-hover transition-colors font-medium flex items-center justify-center shadow-sm">
              添加
            </button>
          </div>
        </div>
      </form>


        <!-- Inventory Display -->
        <div v-if="loading" class="py-12 flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
        </div>
        
        <div v-else class="space-y-6">
          <div v-for="cat in categories" :key="cat" class="space-y-3 mb-6">
            <h3 class="font-semibold text-gray-700 flex items-center">
              <span class="w-2 h-2 rounded-full bg-brand-red mr-2"></span>
              {{ cat }}
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div v-for="item in (groupedItems[cat] || [])" :key="item.id" class="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col group relative hover:bg-white transition-colors">
                <span class="font-medium text-gray-900">{{ item.ingredient_name }}</span>
                <span class="text-sm text-brand-red">{{ item.quantity }}{{ item.unit }}</span>
                <div class="mt-2 text-xs text-gray-400">
                  {{ formatDate(item.added_at) }}
                </div>
                <button 
                  @click="deleteFridgeItem(item.id)"
                  class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-brand-red hover:bg-red-50 p-1 rounded transition-all"
                  title="删除"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
              <div v-if="!groupedItems[cat] || groupedItems[cat].length === 0" class="text-gray-400 text-sm italic col-span-full py-2 pl-4">暂无食材</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Shopping List -->
    <div class="space-y-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <ShoppingCart class="w-5 h-5" />
        采购清单
      </h2>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full min-h-[500px] flex flex-col">
        <!-- Add Shopping Item -->
        <form @submit.prevent="addShoppingItem" class="mb-4">
          <div class="grid grid-cols-4 gap-3 items-end">
            <div class="col-span-1">
              <label class="block text-xs font-medium text-brand-red mb-1">食材名称</label>
              <input 
                 v-model="newShoppingItem.name"
                 type="text" 
                 class="w-full h-10 text-sm border-gray-300 rounded-lg px-3 border outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                 placeholder="如: 小葱"
                 required
              />
            </div>
            <div class="col-span-1">
              <label class="block text-xs font-medium text-brand-red mb-1">数量单位</label>
              <input 
                 v-model="newShoppingItem.quantity"
                 type="text" 
                 class="w-full h-10 text-sm border-gray-300 rounded-lg px-3 border outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                 placeholder="200g"
              />
            </div>
            <div class="col-span-1">
              <label class="block text-xs font-medium text-brand-red mb-1">分类</label>
              <select 
                 v-model="newShoppingItem.category"
                 class="w-full h-10 text-sm border-gray-300 rounded-lg px-3 border outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all bg-white"
              >
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="col-span-1">
              <button type="submit" class="w-full h-10 bg-brand-red text-white rounded-lg hover:bg-brand-red-hover transition-colors font-medium flex items-center justify-center shadow-sm">
                添加
              </button>
            </div>
          </div>
        </form>

        <div class="flex-1 space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
          <div v-if="shoppingItems.length > 0">
            <div v-for="item in shoppingItems" :key="item.id" class="group flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white transition-all">
              <div>
                <div class="font-medium text-gray-800">{{ item.name }}</div>
                <div v-if="item.quantity" class="text-xs text-brand-red">{{ item.quantity }}</div>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  @click="handleAddToFridge(item.id)"
                  class="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-xs font-medium" 
                  title="放入冰箱"
                >
                  加入冰箱
                </button>
                <button 
                  @click="deleteShoppingItem(item.id)"
                  class="text-brand-red hover:bg-red-50 p-1 rounded transition-colors"
                  title="删除"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-400 text-sm">
            清单是空的<br />想到什么就记下来吧
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
