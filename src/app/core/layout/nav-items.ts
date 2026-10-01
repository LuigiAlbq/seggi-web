export interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Início', icon: 'pi pi-home', route: '/', exact: true },
  { label: 'Categorias', icon: 'pi pi-tags', route: '/categorias' },
  { label: 'Produtos', icon: 'pi pi-box', route: '/produtos' },
  { label: 'Armazéns', icon: 'pi pi-warehouse', route: '/armazens' },
];
