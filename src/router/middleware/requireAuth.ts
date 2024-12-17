import type { NavigationGuardNext,RouteLocationNormalized } from 'vue-router';
import axios from "axios";

export default async function requireAuth({
  to,
  next,
}: {
  to: RouteLocationNormalized
  next: NavigationGuardNext;
}) {
  console.log('intraaaaaa')
try {

  await axios.get('http://api.infomed.develop.eiddew.com/api/user')
      .then((response) => {
        console.log('ajutor', response);
      })


} catch (error) {
  document.location.href = '/login';
}

  return next();
}
