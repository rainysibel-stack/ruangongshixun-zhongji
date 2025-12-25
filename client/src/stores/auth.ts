import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api/axios';

export interface User {
  id: number;
  username: string;
  nickname?: string;
  phone?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string>(localStorage.getItem('token') || '');
  const loading = ref<boolean>(true);

  const fetchUser = async () => {
    if (!token.value) {
      loading.value = false;
      return;
    }

    const hasStats = Boolean((user.value as any)?.stats);
    if (user.value && hasStats) {
      loading.value = false;
      return;
    }
    try {
      const res: any = await api.get('/users/profile');
      if (res.code === 200) {
        user.value = res.data;
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      loading.value = false;
    }
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const res: any = await api.post('/users/login', { identifier, password });
      if (res.code === 200) {
        token.value = res.data.token;
        user.value = res.data.userInfo;
        localStorage.setItem('token', res.data.token);
        // Pre-set loading to false since we have the user data
        loading.value = false; 
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const loginAsGuest = () => {
      token.value = 'guest-token';
      user.value = {
          id: 0,
          username: 'guest',
          nickname: '游客',
          phone: ''
      };
      localStorage.setItem('token', 'guest-token');
      loading.value = false; // Set loading to false immediately for faster transitions
  };

  const register = async (username: string, phone: string, password: string, confirmPassword: string): Promise<boolean> => {
    try {
      const res: any = await api.post('/users/register', { username, phone, password, confirmPassword });
      return res.code === 200;
    } catch (error) {
      throw error; // Re-throw to let the component handle the error
    }
  };

  const logout = () => {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
  };

  return {
    user,
    token,
    loading,
    fetchUser,
    login,
    loginAsGuest,
    register,
    logout
  };
});
