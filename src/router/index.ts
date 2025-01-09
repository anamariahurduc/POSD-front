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
      path:'/patient/:patient_id/medical-records',
      name:'medical_records',
      component: () => import('../views/medical_records/MedicalRecords.vue'),
      meta: {
        permissions: [['view_medical_records'], ['view_own_medical_records']],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/:patient_id/medical-records/:record_id',
      name:'edit_medical_records',
      component: () => import('../views/medical_records/EditMedicalRecords.vue'),
      meta: {
        permissions: ['edit_medical_records'],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/:patient_id/medical-records/add',
      name:'add_medical_records',
      component: () => import('../views/medical_records/AddMedicalRecord.vue'),
      meta: {
        permissions: ['add_medical_records'],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/:patient_id/recipes',
      name:'recipes',
      component: () => import('../views/recipes/Recipes.vue'),
      meta: {
        permissions: [['view_medical_records'], ['view_own_medical_records']],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/:patient_id/recipes/:recipe_id',
      name:'edit_recipe',
      component: () => import('../views/recipes/EditRecipe.vue'),
      meta: {
        permissions: [['edit_prescriptions'],['view_medical_records'], ['view_own_medical_records']],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/:patient_id/recipes/add-recipe',
      name:'add_recipe',
      component: () => import('../views/recipes/AddRecipe.vue'),
      meta: {
        permissions: [['edit_prescriptions'],['view_medical_records'], ['view_own_medical_records']],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/:patient_id/billing-informations',
      name:'billing-informations',
      component: () => import('@/views/billing_informations/BillingInformation.vue'),
      meta: {
        permissions: ['view_billing_information'],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/:patient_id/billing-informations/:billing_information_id',
      name:'edit-billing-information',
      component: () => import('@/views/billing_informations/EditBillingInformation.vue'),
      meta: {
        permissions: [['view_billing_information'],['add_billing_information']],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/:patient_id/laboratory-results',
      name:'view-lab-results',
      component: () => import('@/views/lab_results/ViewLabResults.vue'),
      meta: {
        permissions: ['view_lab_results'],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/:patient_id/laboratory-results/add',
      name:'add-lab-results',
      component: () => import('@/views/lab_results/AddLabResult.vue'),
      meta: {
        permissions: ['add_lab_results'],
        middleware: [requireAuth]
      },
    },
    {
      path:'/patient/:patient_id/laboratory-results/:lab_result_id',
      name:'edit-lab-results',
      component: () => import('@/views/lab_results/EditLaboratoryResult.vue'),
      meta: {
        permissions: ['edit_lab_results'],
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
