// src/app/core/auth.utils.ts
import { Router } from '@angular/router';

export function clearAuthAndRedirect(router: Router): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('currentUser');
  router.navigate(['/login']);
}