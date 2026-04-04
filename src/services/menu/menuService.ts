import { eq, asc } from 'drizzle-orm';
import { db } from '../../db/client';
import { users, roles, menus, permissions, roleMenuPermissions } from '../../db/schema';
import { MenuItem } from './menuService.types';
import type { ServiceResult } from '@/types/service';

export const menuService = {

    // Menu Sidebar
    async getMenuSidebar(userId: string): Promise<ServiceResult<MenuItem[]>> {
    const flatMenus = await db
        .selectDistinct({
            id:        menus.id,
            name:      menus.name,
            link:      menus.link,
            linkAlias: menus.linkAlias,
            icon:      menus.icon,
            parent:    menus.parent,
            order:     menus.order,
        })
        .from(users)
        .leftJoin(roleMenuPermissions, eq(roleMenuPermissions.roleId, users.roleId))
        .leftJoin(menus, eq(menus.id, roleMenuPermissions.menuId))
        .where(eq(users.id, userId))
        .orderBy(asc(menus.order));

        if (flatMenus.length === 0) {
            return {
                success: false,
                message: "Menu sidebar is empty"
            };
        }

    return {
        success: true,
        message: "Menu sidebar is exist",
        data: this.buildTreeMenu(flatMenus as MenuItem[])
    };
  },

  buildTreeMenu(menus: MenuItem[], parent: number = 0): MenuItem[] {
    const tree: MenuItem[] = [];

    for (const element of menus) {
      if (element.parent === parent) {
        // ← pakai this.buildTreeMenu bukan buildTreeMenu
        const children = this.buildTreeMenu(menus, element.id);

        const node: MenuItem = {
          ...element,
          children: children ?? [],
        };

        if (element.order !== 0) {
          tree.push(node);
        }
      }
    }

    return tree;
  },
};