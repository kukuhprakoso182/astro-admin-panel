import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { authService } from '@/services/auth/authService';
import { createSession } from '../lib/session';

export const auths = {
  login: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email(),
      password: z.string().min(6).regex(/[0-9]/, "Harus mengandung angka").regex(/[^A-Za-z0-9]/, "Harus mengandung simbol"),
    }),
    handler: async (input, context) => {
      const result = await authService.login(input);

      if (result.success && result.data) {
        // Set cookie di action, bukan di service
        const token = await createSession({
          userId: result.data.id,
          email:  result.data.email,
          name:   result.data.name,
          roleId: result.data.roleId,
        });

        context.cookies.set('session', token, {
          httpOnly: true,
          secure:   context.request.url.startsWith('https'),
          sameSite: 'lax',
          maxAge:   60 * 60 * 24, // 24 jam
          path:     '/',
        });
      }
      return result;
    },
  }),
};