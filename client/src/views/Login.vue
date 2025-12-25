<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ChefHat, Lock, User } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const identifier = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  if (!identifier.value || !password.value) {
    error.value = '请输入ID/手机号和密码';
    return;
  }

  error.value = '';
  loading.value = true;

  try {
    const success = await authStore.login(identifier.value, password.value);
    if (success) {
      // Navigate immediately for faster transition
      loading.value = false;
      router.push('/');
    } else {
      error.value = '登录失败，请检查ID/手机号或密码';
      loading.value = false;
    }
  } catch (err) {
    error.value = '登录请求出错';
    loading.value = false;
  }
};

const handleGuestLogin = async () => {
  error.value = '';
  console.log('Guest login clicked, entering guest mode directly');
  authStore.loginAsGuest();
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fa] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <div class="h-16 w-16 bg-brand-red rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
          <ChefHat class="h-9 w-9 text-white" />
        </div>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
        登录小小美食家
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        还没有账号？
        <router-link to="/register" class="font-medium text-brand-red hover:text-brand-red-hover transition-colors">
          立即注册
        </router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div class="bg-white py-8 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl sm:px-10 border border-gray-100">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label for="identifier" class="block text-sm font-medium text-gray-700">
              ID/手机号
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="identifier"
                v-model="identifier"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm transition-all"
                placeholder="请输入ID或手机号"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              密码
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm transition-all"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                class="h-4 w-4 text-brand-red focus:ring-brand-red border-gray-300 rounded cursor-pointer"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900 cursor-pointer">
                记住我
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-brand-red hover:text-brand-red-hover">
                忘记密码？
              </a>
            </div>
          </div>

          <div class="space-y-4">
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-red transition-all hover:shadow-lg active:scale-[0.98]"
              style="background-color: #e74c3c !important; color: white !important;"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                登录中...
              </span>
              <span v-else>登录</span>
            </button>

            <button
              type="button"
              @click="handleGuestLogin"
              class="w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
            >
              游客体验模式
            </button>
          </div>
        </form>

        <div v-if="error" class="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">
              {{ error }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
