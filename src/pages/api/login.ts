import type { APIRoute } from 'astro';
import { createSession } from '../../lib/session';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    // Validasi user (contoh sederhana, ganti dengan DB query)
    if (email === 'admin@example.com' && password === 'password123') {
      // Buat session token
      const token = await createSession({
        userId: '1',
        email: email,
        name: 'Admin User'
      });

      // Simpan ke cookie
      cookies.set('session', token, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 jam
        path: '/'
      });

      return new Response(
        JSON.stringify({ success: true, message: 'Login berhasil' }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Email atau password salah' }),
      { status: 401 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Terjadi kesalahan' }),
      { status: 500 }
    );
  }
};