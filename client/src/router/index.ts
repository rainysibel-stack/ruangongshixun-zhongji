import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Layout from '../components/Layout.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue')
    },
    {
      path: '/',
      component: Layout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Recipes',
          component: () => import('../views/Recipes.vue')
        },
        {
          path: 'add-recipe',
          name: 'AddRecipe',
          component: () => import('../views/AddRecipe.vue')
        },
        {
          path: 'recipe/:id',
          name: 'RecipeDetail',
          component: () => import('../views/RecipeDetail.vue')
        },
        {
          path: 'square',
          name: 'Square',
          component: () => import('../views/RecipeSquare.vue')
        },
        {
          path: 'fridge',
          name: 'Fridge',
          component: () => import('../views/Fridge.vue')
        },
        {
          path: 'recommend',
          name: 'Recommendation',
          component: () => import('../views/Recommendation.vue')
        },
        {
          path: 'mine',
          name: 'Mine',
          component: () => import('../views/Mine.vue')
        }
      ]
    }
  ]
});

// Optimized router guard - faster transitions
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Quick check: if navigating to public routes, allow immediately
  if (!to.meta.requiresAuth) {
    // If already logged in and going to login/register, redirect to home
    if ((to.path === '/login' || to.path === '/register') && authStore.user) {
      return next('/');
    }
    return next();
  }
  
  // For protected routes: check token first (fast)
  if (!authStore.token) {
    return next('/login');
  }
  
  // If we have token and user, proceed immediately
  if (authStore.user) {
    return next();
  }
  
  // Only fetch user if we have token but no user data (e.g., page refresh)
  // This happens in background, don't block navigation
  authStore.fetchUser().catch(() => {
    // If fetch fails, redirect to login
    if (to.meta.requiresAuth) {
      router.push('/login');
    }
  });
  
  // Allow navigation to proceed while user data is being fetched
  next();
});

export default router;
