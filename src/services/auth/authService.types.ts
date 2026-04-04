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