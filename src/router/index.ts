import {createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationNormalized} from 'vue-router'
import HomeView from '../views/HomePage.vue'
import requireAuth from "@/router/middleware/requireAuth";
import middlewarePipeline from "@/router/middlewarePipeline";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginPage.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterPage.vue')
    },
    {
      path:'/home',
      name:'home',
      component: () => import('../views/HomePage.vue')
    },
    {
      path:'/dashboard',
      name:'dashboard',
      component: () => import('../views/dashboard/ViewPatients.vue'),
      meta: {
        permission: 'view_medical_record',
        middleware: [requireAuth]
      },
    },

  ]
})

router.beforeEach(
    (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized,
        next: NavigationGuardNext
    ) => {


      if (!to.meta.middleware) {
        return next();
      }
      const middleware = to.meta.middleware as any;

      const context = {
        to,
        from,
        next,
      };

      return middleware[0]({
        ...context,
        next: middlewarePipeline(context, middleware, 1),
      });
    }
);

export default router
