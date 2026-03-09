import {
  mysqlTable,
  varchar,
  text,
  bigint,
  boolean,
  timestamp,
  char,
  index,
  primaryKey,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ── icons ─────────────────────────────────────────────────────────────────────
export const icons = mysqlTable('icons', {
  id:       varchar('id',      { length: 50 }).primaryKey(),
  name:     varchar('name',    { length: 50 }).notNull(),
  section:  varchar('section', { length: 50 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

// ── statuses ──────────────────────────────────────────────────────────────────
export const statuses = mysqlTable('statuses', {
  id:       varchar('id',   { length: 50 }).primaryKey(),
  name:     varchar('name', { length: 50 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

// ── roles ─────────────────────────────────────────────────────────────────────
export const roles = mysqlTable('roles', {
  id:         varchar('id',          { length: 50 }).primaryKey(),
  name:       varchar('name',        { length: 50 }).notNull(),
  childRoles: text('child_roles'),
  isActive:   boolean('is_active').notNull().default(true),
});

// ── permissions ───────────────────────────────────────────────────────────────
export const permissions = mysqlTable('permissions', {
  id:       varchar('id',   { length: 50 }).primaryKey(),
  name:     varchar('name', { length: 50 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

// ── menus ─────────────────────────────────────────────────────────────────────
export const menus = mysqlTable('menus', {
  id:        bigint('id',         { mode: 'number', unsigned: true }).primaryKey().autoincrement(),
  name:      varchar('name',      { length: 100 }).notNull(),
  link:      varchar('link',      { length: 100 }).notNull().default('#'),
  linkAlias: varchar('link_alias',{ length: 100 }).notNull().default('#'),
  icon:      varchar('icon',      { length: 100 }).notNull().default('#'),
  parent:    bigint('parent',     { mode: 'number' }).notNull().default(0),
  order:     bigint('order',      { mode: 'number' }).notNull().default(0),
  isActive:  boolean('is_active').notNull().default(true),
});

// ── users ─────────────────────────────────────────────────────────────────────
export const users = mysqlTable('users', {
  id:        char('id',       { length: 36 }).primaryKey(),  // UUID
  roleId:    varchar('role_id',   { length: 50 }).notNull().references(() => roles.id),
  statusId:  varchar('status_id', { length: 50 }).notNull().references(() => statuses.id),
  name:      varchar('name',      { length: 100 }).notNull(),
  email:     varchar('email',     { length: 100 }).notNull().unique(),
  password:  varchar('password',  { length: 100 }).notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
}, (t) => [
  index('users_role_id_idx').on(t.roleId),
  index('users_status_id_idx').on(t.statusId),
]);

// ── role_menu_permission ──────────────────────────────────────────────────────
export const roleMenuPermissions = mysqlTable('role_menu_permission', {
  roleId:       varchar('role_id',       { length: 50 }).notNull().references(() => roles.id),
  menuId:       bigint('menu_id',        { mode: 'number', unsigned: true }).notNull().references(() => menus.id),
  permissionId: varchar('permission_id', { length: 50 }).notNull().references(() => permissions.id),
}, (t) => [
  primaryKey({ columns: [t.roleId, t.menuId, t.permissionId] }),
  index('rmp_menu_id_idx').on(t.menuId),
  index('rmp_permission_id_idx').on(t.permissionId),
]);

// ── Relations ─────────────────────────────────────────────────────────────────
export const rolesRelations = relations(roles, ({ many }) => ({
  users:              many(users),
  roleMenuPermissions: many(roleMenuPermissions),
}));

export const statusesRelations = relations(statuses, ({ many }) => ({
  users: many(users),
}));

export const menusRelations = relations(menus, ({ many }) => ({
  roleMenuPermissions: many(roleMenuPermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roleMenuPermissions: many(roleMenuPermissions),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role:   one(roles,    { fields: [users.roleId],   references: [roles.id] }),
  status: one(statuses, { fields: [users.statusId], references: [statuses.id] }),
}));

export const roleMenuPermissionsRelations = relations(roleMenuPermissions, ({ one }) => ({
  role:       one(roles,       { fields: [roleMenuPermissions.roleId],       references: [roles.id] }),
  menu:       one(menus,       { fields: [roleMenuPermissions.menuId],       references: [menus.id] }),
  permission: one(permissions, { fields: [roleMenuPermissions.permissionId], references: [permissions.id] }),
}));

// ── Type exports ──────────────────────────────────────────────────────────────
export type Icon              = typeof icons.$inferSelect;
export type NewIcon           = typeof icons.$inferInsert;
export type Status            = typeof statuses.$inferSelect;
export type NewStatus         = typeof statuses.$inferInsert;
export type Role              = typeof roles.$inferSelect;
export type NewRole           = typeof roles.$inferInsert;
export type Permission        = typeof permissions.$inferSelect;
export type NewPermission     = typeof permissions.$inferInsert;
export type Menu              = typeof menus.$inferSelect;
export type NewMenu           = typeof menus.$inferInsert;
export type User              = typeof users.$inferSelect;
export type NewUser           = typeof users.$inferInsert;
export type RoleMenuPermission    = typeof roleMenuPermissions.$inferSelect;
export type NewRoleMenuPermission = typeof roleMenuPermissions.$inferInsert;