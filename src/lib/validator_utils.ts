import { users } from '../db/schema';

export function stripPassword(user: typeof users.$inferSelect): AuthUser {
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 6) return 'Password minimal 6 karakter.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password harus mengandung simbol.';
  if (!/[0-9]/.test(password)) return 'Password harus mengandung minimal 1 angka.';
  return null;
}