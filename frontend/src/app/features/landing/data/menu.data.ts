export type MenuCategory = 'm' | 'l' | 'xl' | 'bowls' | 'sides' | 'drinks';

export interface MenuItem {
  name: string;
  price: number;
  weight: string;
  category: MenuCategory;
  isPopular: boolean;
}

export interface MenuTab {
  label: string;
  value: MenuCategory | 'all';
}

export const MENU_TABS: readonly MenuTab[] = [
  { label: 'All', value: 'all' },
  { label: 'M (350g)', value: 'm' },
  { label: 'L (450g)', value: 'l' },
  { label: 'XL', value: 'xl' },
  { label: 'Bowls', value: 'bowls' },
  { label: 'Sides', value: 'sides' },
  { label: 'Drinks', value: 'drinks' },
];

export const MENU_ITEMS: readonly MenuItem[] = [
  { name: 'Tacos M Pui', price: 37, weight: '350g', category: 'm', isPopular: true },
  { name: 'Tacos M Vita', price: 40, weight: '350g', category: 'm', isPopular: true },
  { name: 'Tacos M Crispy Bang', price: 37, weight: '350g', category: 'm', isPopular: true },
  { name: 'Tacos M Cordon Bleu', price: 37, weight: '350g', category: 'm', isPopular: false },
  { name: 'Tacos M Mix', price: 37, weight: '350g', category: 'm', isPopular: false },
  { name: 'Tacos M Nugget', price: 37, weight: '350g', category: 'm', isPopular: false },

  { name: 'Tacos L Pui', price: 50, weight: '450g', category: 'l', isPopular: true },
  { name: 'Tacos L Crispy', price: 50, weight: '450g', category: 'l', isPopular: true },
  { name: 'Tacos L Mix', price: 50, weight: '450g', category: 'l', isPopular: true },
  { name: 'Tacos L Vita', price: 52, weight: '450g', category: 'l', isPopular: false },

  { name: 'Tacos XL Pui', price: 60, weight: 'XL', category: 'xl', isPopular: true },
  { name: 'Tacos XL Crispy', price: 60, weight: 'XL', category: 'xl', isPopular: true },
  { name: 'Tacos XL Mix', price: 60, weight: 'XL', category: 'xl', isPopular: false },
  { name: 'Tacos XL Vita', price: 64, weight: 'XL', category: 'xl', isPopular: false },

  { name: 'Cartofi prăjiți 200g', price: 12, weight: '200g', category: 'sides', isPopular: true },
];