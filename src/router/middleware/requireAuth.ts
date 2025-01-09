import type { NavigationGuardNext,RouteLocationNormalized } from 'vue-router';
import axios from "axios";
import {useCookies} from "vue3-cookies";
import {useRouter} from "vue-router";
import {useAuthUserStore} from "@/store/AuthUser";

export default async function requireAuth({
  to,
  next,
}: {
  to: RouteLocationNormalized
  next: NavigationGuardNext;
}) {
    const { cookies } = useCookies();
    const router = useRouter();
    const authUserStore = useAuthUserStore();
try {
    axios.defaults.headers.common['Authorization'] = `Bearer ${cookies.get("token")}`;
  await axios.post('http://api.infomed.develop.eiddew.com/api/user', {
      permissions: to.meta.permissions})
      .then((response) => {
          authUserStore.setUser(response.data.user);
          if(response.data.can_access === false) {
              let role = response.data.role;
              switch (role.name) {
                  case 'doctor':
                      router.push('/patients');
                      break;
                  case 'patient':
                      router.push('/patient/' + response.data.user.id);
                      break;
                  case 'nurse':
                      router.push('/patients');
                      break;
                  case 'insurer':
                      router.push('/billing-informations');
                      break;
              }
          }
      })
} catch (error) {
  document.location.href = '/login';
}

  return next();
}
