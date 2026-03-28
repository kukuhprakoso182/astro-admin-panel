CREATE TABLE `icons` (
	`id` varchar(50) NOT NULL,
	`name` varchar(50) NOT NULL,
	`section` varchar(50) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `icons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menus` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`link` varchar(100) NOT NULL DEFAULT '#',
	`link_alias` varchar(100) NOT NULL DEFAULT '#',
	`icon` varchar(100) NOT NULL DEFAULT '#',
	`parent` bigint NOT NULL DEFAULT 0,
	`order` bigint NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `menus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(50) NOT NULL,
	`name` varchar(50) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role_menu_permission` (
	`role_id` varchar(50) NOT NULL,
	`menu_id` bigint unsigned NOT NULL,
	`permission_id` varchar(50) NOT NULL,
	CONSTRAINT `role_menu_permission_role_id_menu_id_permission_id_pk` PRIMARY KEY(`role_id`,`menu_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(50) NOT NULL,
	`name` varchar(50) NOT NULL,
	`child_roles` text,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statuses` (
	`id` varchar(50) NOT NULL,
	`name` varchar(50) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`role_id` varchar(50) NOT NULL,
	`status_id` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`password` varchar(100) NOT NULL,
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `role_menu_permission` ADD CONSTRAINT `role_menu_permission_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_menu_permission` ADD CONSTRAINT `role_menu_permission_menu_id_menus_id_fk` FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_menu_permission` ADD CONSTRAINT `role_menu_permission_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_status_id_statuses_id_fk` FOREIGN KEY (`status_id`) REFERENCES `statuses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `rmp_menu_id_idx` ON `role_menu_permission` (`menu_id`);--> statement-breakpoint
CREATE INDEX `rmp_permission_id_idx` ON `role_menu_permission` (`permission_id`);--> statement-breakpoint
CREATE INDEX `users_role_id_idx` ON `users` (`role_id`);--> statement-breakpoint
CREATE INDEX `users_status_id_idx` ON `users` (`status_id`);