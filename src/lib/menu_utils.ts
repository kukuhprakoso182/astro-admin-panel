import { route } from 'ziggy-js'; // atau sesuaikan dengan router yang digunakan

interface MenuItem {
  id: number;
  name: string;
  icon: string;
  link: string;
  link_alias: string;
  order: number;
  parent: number;
  is_active: number;
  children: MenuItem[];
}

class MenuUtils {
  static getSidebar(segments: string[], role: string): string {
    const menus = this.getMenus(role);
    return this.sidebarGenerator(menus, segments);
  }

  static getPreviewTreeMenu(): string {
    return this.sidebarGenerator(this.buildTreeMenu(this.getMenusByParams()), [], true);
  }

  private static sidebarGenerator(
    menus: MenuItem[],
    segments: string[],
    isPreview: boolean = false
  ): string {
    let sidebar = '';
    const hover = !isPreview
      ? 'hover:bg-slate-500 hover:rounded-lg hover:text-lap-white'
      : '';

    for (const item of menus) {
      const link = segments.join('/');
      const isActive =
        link.startsWith(item.link) ||
        link === this.findLink(link, item.children);
      let bgSelectMenu = isActive ? 'bg-slate-500 drop-shadow-xl rounded-lg text-lap-white' : '';

      if (isPreview) {
        bgSelectMenu = '';
      }

      let icon = '';
      if (item.icon !== '#') {
        icon = `<i class="${item.icon} ri-lg"></i>`;
      } else {
        icon = '<span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>';
      }

      const order = isPreview ? `[${item.order}] ` : '';

      if (item.children && item.children.length > 0) {
        const showNestedMenu = isActive ? '' : 'hidden';
        const rotateToggle = isActive ? 'rotate-180' : '';

        sidebar += '<li class="relative my-2">';
        sidebar += `<a href="#" class="flex items-center justify-between p-2 ${hover} menu-toggle">`;
        sidebar += `<span class="flex gap-2 items-center text-sm">${icon}${order}${item.name}</span>`;
        sidebar += `<svg class="w-4 h-4 transition-transform duration-200 transform ${rotateToggle}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
        sidebar += '</a>';
        sidebar += `<ul class="ml-4 nested-menu ${showNestedMenu}">`;
        sidebar += this.sidebarGenerator(item.children, segments, isPreview);
        sidebar += '</ul>';
      } else {
        const linkAlias = !isPreview ? route(item.link_alias) : '#';
        sidebar += '<li class="my-2">';
        sidebar += `<a href="${linkAlias}" class="flex items-center justify-between p-2 ${bgSelectMenu} ${hover}">`;
        sidebar += `<span class="flex gap-2 items-center text-sm">${icon}${order}${item.name}</span>`;
        sidebar += '</a>';
      }

      sidebar += '</li>';
    }

    return sidebar;
  }

  private static getMenus(role: string): MenuItem[] {
    let menus = CacheUtils.get<MenuItem[]>('menus', [role]);

    if (!menus) {
      menus = this.getMenusByParams(role);
      CacheUtils.put('menus', [role], menus);
    }

    return this.buildTreeMenu(menus);
  }

  private static getMenusByParams(role: string = ''): MenuItem[] {
    // Sesuaikan dengan ORM/query builder yang digunakan di sisi TypeScript
    // Contoh menggunakan fetch/axios ke API endpoint
    // Di sini diasumsikan data sudah tersedia sebagai array
    throw new Error('Implement API call to fetch menus');
  }

  private static buildTreeMenu(menus: MenuItem[], parent: number = 0): MenuItem[] {
    const tree: MenuItem[] = [];

    for (const element of menus) {
      if (element.parent === parent) {
        const children = this.buildTreeMenu(menus, element.id);
        element.children = children.length > 0 ? children : [];

        if (element.order !== 0) {
          tree.push(element);
        }
      }
    }

    return tree;
  }

  private static findLink(path: string, menus: MenuItem[]): string | undefined {
    for (const menu of menus) {
      if (menu.link && path.replace(/^\//, '').startsWith(menu.link)) {
        return path;
      }

      if (menu.children && Array.isArray(menu.children)) {
        const found = this.findLink(path, menu.children);
        if (found) {
          return path;
        }
      }
    }
    return undefined;
  }
}

export default MenuUtils;