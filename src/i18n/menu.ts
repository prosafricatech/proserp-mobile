import { menu as englishMenu } from './en/menu';
import { menu as swahiliMenu } from './sw/menu';

export type MenuLabelKey = keyof typeof englishMenu;
export type MenuLanguage = 'en' | 'sw';

const menus = {
  en: englishMenu,
  sw: swahiliMenu,
};

export const menuLabel = (key: MenuLabelKey, language: MenuLanguage) => menus[language][key];
