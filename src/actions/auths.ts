import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { authService } from '@/services/authService';

export const auths = {
  login: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email(),
      password: z.string().min(6).regex(/[A-Z]/, "Harus mengandung huruf besar").regex(/[0-9]/, "Harus mengandung angka"),
    }),
    handler: async (input) => {
      return await authService.login(input);
    },
  }),
};