import { defineMiddleware } from 'astro:middleware';
import { verifySession } from '../lib/session';

// Daftar halaman yang tidak memerlukan autentikasi
const unprotectedRoutes = ['/auths/login', '/auths/register'];

export const onRequest = defineMiddleware(async ({ cookies, url, redirect, locals }, next) => {
  const sessionToken = cookies.get('session')?.value;
  const pathname = url.pathname;

  // Verify session jika ada token
  let session = null;
  if (sessionToken) {
    session = await verifySession(sessionToken);
  }

  const isUnprotectedRoute = unprotectedRoutes.some(route => pathname.startsWith(route));

  if (session) {
    if (!isUnprotectedRoute) {
      return redirect('/');
    }
    return next();
  }

  if (isUnprotectedRoute) {
    return next();
  }
  return redirect('/auths/login');
});