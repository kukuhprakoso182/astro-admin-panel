-- Migration: 0001_initial
-- Generated from: admin_panel.sql
-- Jalankan: npx drizzle-kit migrate

CREATE TABLE `icons` (
  `id`        VARCHAR(50)  NOT NULL,
  `name`      VARCHAR(50)  NOT NULL,
  `section`   VARCHAR(50)  NOT NULL,
  `is_active` BOOLEAN      NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE `statuses` (
  `id`        VARCHAR(50) NOT NULL,
  `name`      VARCHAR(50) NOT NULL,
  `is_active` BOOLEAN     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE `roles` (
  `id`          VARCHAR(50) NOT NULL,
  `name`        VARCHAR(50) NOT NULL,
  `child_roles` TEXT,
  `is_active`   BOOLEAN     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE `permissions` (
  `id`        VARCHAR(50) NOT NULL,
  `name`      VARCHAR(50) NOT NULL,
  `is_active` BOOLEAN     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE `menus` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100)    NOT NULL,
  `link`       VARCHAR(100)    NOT NULL DEFAULT '#',
  `link_alias` VARCHAR(100)    NOT NULL DEFAULT '#',
  `icon`       VARCHAR(100)    NOT NULL DEFAULT '#',
  `parent`     BIGINT          NOT NULL DEFAULT 0,
  `order`      BIGINT          NOT NULL DEFAULT 0,
  `is_active`  BOOLEAN         NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE `users` (
  `id`         CHAR(36)     NOT NULL,
  `role_id`    VARCHAR(50)  NOT NULL,
  `status_id`  VARCHAR(50)  NOT NULL,
  `name`       VARCHAR(100) NOT NULL,
  `email`      VARCHAR(100) NOT NULL,
  `password`   VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP    NULL DEFAULT NULL,
  `updated_at` TIMESTAMP    NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_id_idx`   (`role_id`),
  KEY `users_status_id_idx` (`status_id`),
  CONSTRAINT `users_role_id_fk`   FOREIGN KEY (`role_id`)   REFERENCES `roles`    (`id`),
  CONSTRAINT `users_status_id_fk` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE `role_menu_permission` (
  `role_id`       VARCHAR(50)     NOT NULL,
  `menu_id`       BIGINT UNSIGNED NOT NULL,
  `permission_id` VARCHAR(50)     NOT NULL,
  PRIMARY KEY (`role_id`, `menu_id`, `permission_id`),
  KEY `rmp_menu_id_idx`       (`menu_id`),
  KEY `rmp_permission_id_idx` (`permission_id`),
  CONSTRAINT `rmp_role_id_fk`       FOREIGN KEY (`role_id`)       REFERENCES `roles`       (`id`),
  CONSTRAINT `rmp_menu_id_fk`       FOREIGN KEY (`menu_id`)       REFERENCES `menus`       (`id`),
  CONSTRAINT `rmp_permission_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;