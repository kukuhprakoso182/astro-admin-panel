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
    // Akses "/" atau halaman login/register → redirect ke dashboard
    if (pathname === '/' || isUnprotectedRoute) {
      return redirect('/dashboard');
    }
    return next();
  }

  // Belum login
  if (isUnprotectedRoute) {
    return next();
  }

  return redirect('/auths/login');
});