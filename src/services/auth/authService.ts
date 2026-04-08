import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../../db/client';
import { users, roles, statuses } from '../../db/schema';
import type { ServiceResult } from '@/types/service';
import { RegisterInput, LoginInput, ChangePasswordInput, AuthUser} from './authService.types';
import { stripPassword, validateEmail, validatePasswordStrength } from '../../lib/validator_utils';
import { hashPassword, comparePassword } from '../../lib/bcrypt_utils';

export const authService = {

  // Register 
  async register(input: RegisterInput): Promise<ServiceResult<AuthUser>> {
    const errors: Record<string, string> = {};

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

    const roleId = input.roleId ?? 'admin';
    const statusId = input.statusId ?? 'active';

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

    const hashedPassword = await hashPassword(password);
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

  // Login 
  async login(input: LoginInput): Promise<ServiceResult<AuthUser>> {
    try {
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

        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (result.length === 0) {
          return {
            success: false,
            message: 'Email atau password salah.',
          };
        }

        const user = result[0];

        if (user.statusId !== 'active') {
          return {
            success: false,
            message: 'Akun Anda tidak aktif. Hubungi administrator.',
          };
        }

        const isValid = await comparePassword(password, user.password);
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
    } catch (error) {
      console.error('Error saat proses login :', error);
      return {
        success: false,
        message: 'Terjadi kesalahan internal. Silakan coba lagi nanti.',
      };
    }
    
  },

  // Change Password 
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

    const pwError = validatePasswordStrength(newPassword);
    if (pwError) {
      return {
        success: false,
        message: 'Validasi gagal.',
        errors: { newPassword: pwError },
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: 'Validasi gagal.',
        errors: { confirmPassword: 'Konfirmasi password tidak cocok dengan password baru.' },
      };
    }

    if (currentPassword === newPassword) {
      return {
        success: false,
        message: 'Validasi gagal.',
        errors: { newPassword: 'Password baru tidak boleh sama dengan password saat ini.' },
      };
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return { success: false, message: 'User tidak ditemukan.' };
    }

    const user = result[0];

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      return {
        success: false,
        message: 'Validasi gagal.',
        errors: { currentPassword: 'Password saat ini tidak sesuai.' },
      };
    }

    const hashedPassword = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: 'Password berhasil diubah.',
    };
  },

  // ── Get User By ID ────────────────────────────────────────────────────────

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