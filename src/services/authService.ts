import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db/client';
import { users, roles, statuses } from '../db/schema';
import type { ServiceResult } from '@/types/service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  roleId?: string;
  statusId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  statusId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// const BCRYPT_ROUNDS = 12;

// function stripPassword(user: typeof users.$inferSelect): AuthUser {
//   const { password: _pw, ...safeUser } = user;
//   return safeUser;
// }

// function validateEmail(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// function validatePasswordStrength(password: string): string | null {
//   if (password.length < 8) return 'Password minimal 8 karakter.';
//   if (!/[A-Z]/.test(password)) return 'Password harus mengandung minimal 1 huruf kapital.';
//   if (!/[0-9]/.test(password)) return 'Password harus mengandung minimal 1 angka.';
//   return null;
// }

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {

  // ── Register ──────────────────────────────────────────────────────────────

  async register(input: RegisterInput): Promise<ServiceResult<AuthUser>> {
    const errors: Record<string, string> = {};

    // Validasi input
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!name) errors.name = 'Nama wajib diisi.';
    else if (name.length < 2) errors.name = 'Nama minimal 2 karakter.';
    else if (name.length > 100) errors.name = 'Nama maksimal 100 karakter.';

    if (!email) errors.email = 'Email wajib diisi.';
    else if (!validateEmail(email)) errors.email = 'Format email tidak valid.';

    if (!password) errors.password = 'Password wajib diisi.';
    else {
      const pwError = validatePasswordStrength(password);
      if (pwError) errors.password = pwError;
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, message: 'Validasi gagal.', errors };
    }

    // Cek email sudah terdaftar
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        message: 'Email sudah terdaftar.',
        errors: { email: 'Email sudah digunakan oleh akun lain.' },
      };
    }

    // Tentukan role & status default
    const roleId = input.roleId ?? 'admin';
    const statusId = input.statusId ?? 'active';

    // Validasi role & status ada di database
    const [roleExists, statusExists] = await Promise.all([
      db.select({ id: roles.id }).from(roles).where(eq(roles.id, roleId)).limit(1),
      db.select({ id: statuses.id }).from(statuses).where(eq(statuses.id, statusId)).limit(1),
    ]);

    if (roleExists.length === 0) {
      return { success: false, message: 'Role tidak ditemukan.', errors: { roleId: 'Role tidak valid.' } };
    }
    if (statusExists.length === 0) {
      return { success: false, message: 'Status tidak ditemukan.', errors: { statusId: 'Status tidak valid.' } };
    }

    // Hash password & simpan
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const now = new Date();
    const newUser = {
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
      roleId,
      statusId,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(users).values(newUser);

    const created = await db
      .select()
      .from(users)
      .where(eq(users.id, newUser.id))
      .limit(1);

    return {
      success: true,
      message: 'Registrasi berhasil.',
      data: stripPassword(created[0]),
    };
  },

  // ── Login ─────────────────────────────────────────────────────────────────

  async login(input: LoginInput): Promise<ServiceResult<AuthUser>> {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
      return {
        success: false,
        message: 'Email dan password wajib diisi.',
        errors: {
          ...(!email && { email: 'Email wajib diisi.' }),
          ...(!password && { password: 'Password wajib diisi.' }),
        },
      };
    }

    if (!validateEmail(email)) {
      return {
        success: false,
        message: 'Format email tidak valid.',
        errors: { email: 'Format email tidak valid.' },
      };
    }

    // Cari user berdasarkan email
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      // Pesan generik agar tidak membocorkan info akun
      return {
        success: false,
        message: 'Email atau password salah.',
      };
    }

    const user = result[0];

    // Cek apakah akun aktif
    if (user.statusId !== 'active') {
      return {
        success: false,
        message: 'Akun Anda tidak aktif. Hubungi administrator.',
      };
    }

    // Verifikasi password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return {
        success: false,
        message: 'Email atau password salah.',
      };
    }

    return {
      success: true,
      message: 'Login berhasil.',
      data: stripPassword(user),
    };
  },

  // ── Change Password ───────────────────────────────────────────────────────

  async changePassword(input: ChangePasswordInput): Promise<ServiceResult> {
    const { userId, currentPassword, newPassword, confirmPassword } = input;
    const errors: Record<string, string> = {};

    if (!userId) {
      return { success: false, message: 'User ID wajib diisi.' };
    }

    if (!currentPassword) errors.currentPassword = 'Password saat ini wajib diisi.';
    if (!newPassword) errors.newPassword = 'Password baru wajib diisi.';
    if (!confirmPassword) errors.confirmPassword = 'Konfirmasi password wajib diisi.';

    if (Object.keys(errors).length > 0) {
      return { success: false, message: 'Validasi gagal.', errors };
    }

    // Validasi kekuatan password baru
    const pwError = validatePasswordStrength(newPassword);
    if (pwError) {
      return {
        success: false,
        message: 'Validasi gagal.',
        errors: { newPassword: pwError },
      };
    }

    // Cek password baru dan konfirmasi cocok
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: 'Validasi gagal.',
        errors: { confirmPassword: 'Konfirmasi password tidak cocok dengan password baru.' },
      };
    }

    // Cek password baru tidak sama dengan password lama
    if (currentPassword === newPassword) {
      return {
        success: false,
        message: 'Validasi gagal.',
        errors: { newPassword: 'Password baru tidak boleh sama dengan password saat ini.' },
      };
    }

    // Ambil user dari database
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return { success: false, message: 'User tidak ditemukan.' };
    }

    const user = result[0];

    // Verifikasi password saat ini
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return {
        success: false,
        message: 'Validasi gagal.',
        errors: { currentPassword: 'Password saat ini tidak sesuai.' },
      };
    }

    // Hash password baru & update
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: 'Password berhasil diubah.',
    };
  },

  // ── Get User By ID (helper untuk session) ────────────────────────────────

  async getUserById(userId: string): Promise<ServiceResult<AuthUser>> {
    if (!userId) {
      return { success: false, message: 'User ID wajib diisi.' };
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return { success: false, message: 'User tidak ditemukan.' };
    }

    return {
      success: true,
      message: 'User ditemukan.',
      data: stripPassword(result[0]),
    };
  },
};