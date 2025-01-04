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
        permissions: ['view_all_users'],
        middleware: [requireAuth]
      },
    },
    {
      path:'/billing-information',
      name:'billing-information',
      component: () => import('../views/BillingInformation.vue'),
      meta: {
        permissions: ['view_billing_information'],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patients',
      name:'patients',
      component: () => import('../views/Patients.vue'),
      meta: {
        permissions: ['view_medical_records'],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/:patient_id',
      name:'patient',
      component: () => import('../views/Patient.vue'),
      meta: {
        permissions: [['view_medical_records'], ['view_own_medical_records']],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/medical-records/:patient_id',
      name:'medical_records',
      component: () => import('../views/MedicalRecords.vue'),
      meta: {
        permissions: [['view_medical_records'], ['view_own_medical_records']],
        middleware: [requireAuth]
      },
    },
  ]
})

router.beforeEach(
    (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized,
        next: NavigationGuardNext,
    ) => {


      if (!to.meta.middleware) {
        return next();
      }
      const middleware = to.meta.middleware as any;
      const permissions = to.meta.permissions as any;

      const context = {
        to,
        from,
        next,
        permissions
      };

      return middleware[0]({
        ...context,
        next: middlewarePipeline(context, middleware, 1),
      });
    }
);

export default router
