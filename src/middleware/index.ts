import { defineMiddleware } from 'astro:middleware';
import { verifySession } from '../lib/session';

const unprotectedRoutes = ['/auths/login', '/auths/register'];

export const onRequest = defineMiddleware(async ({ cookies, url, redirect, locals }, next) => {
  const sessionToken = cookies.get('session')?.value;
  const pathname = url.pathname;

  let session = null;
  if (sessionToken) {
    session = await verifySession(sessionToken);
    locals.session = session;
  }

  const isUnprotectedRoute = unprotectedRoutes.some(route => pathname.startsWith(route));

  // Sudah login
  if (session) {
    // Coba akses halaman login/register → redirect ke dashboard
    if (isUnprotectedRoute) {
      return redirect('/dashboard');
    }
    // Akses halaman lain → lanjut
    return next();
  }

  // Belum login
  if (isUnprotectedRoute) {
    return next();
  }

  // Belum login, akses halaman protected → redirect ke login
  return redirect('/auths/login');
});