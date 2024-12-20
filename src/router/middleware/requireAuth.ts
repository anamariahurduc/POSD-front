import type { NavigationGuardNext,RouteLocationNormalized } from 'vue-router';
import axios from "axios";
import {useCookies} from "vue3-cookies";
import {useRouter} from "vue-router";

export default async function requireAuth({
  to,
  next,
}: {
  to: RouteLocationNormalized
  next: NavigationGuardNext;
}) {
    const { cookies } = useCookies();
  const router = useRouter();
try {
    axios.defaults.headers.common['Authorization'] = `Bearer ${cookies.get("token")}`;
  await axios.post('http://api.infomed.develop.eiddew.com/api/user', {
      permissions: to.meta.permissions})
      .then((response) => {
          if(response.data.can_access === false) {
              let role = response.data.role;
              switch (role.name) {
                  case 'doctor':
                      router.push('dashboard');
                      break;
                  case 'patient':
                      router.push('medical-record/' + response.data.user.id);
                      break;
                  case 'nurse':
                      router.push('dashboard');
                      break;
                  case 'insurer':
                      break;
              }
          }
      })
} catch (error) {
  document.location.href = '/login';
}

  return next();
}
