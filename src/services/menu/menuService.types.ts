export interface MenuItem {
  id: number;
  name: string;
  link: string;
  linkAlias: string;
  icon: string;
  parent: number;
  order: number;
  children: MenuItem[];
}