import { getLocales } from 'expo-localization';
import englishDictionary from './en';
import swahiliDictionary from './sw';

// The web app selects language from the URL; mobile uses the device language.
const dictionaries = {
  en: englishDictionary,
  sw: swahiliDictionary,
};

export type Dictionary = typeof englishDictionary;
export type Language = keyof typeof dictionaries;

export const language: Language = getLocales()[0]?.languageCode === 'sw' ? 'sw' : 'en';

export const dictionary = dictionaries[language];

// Fills {name} placeholders: format(t.returnsIn, { days: 3 }).
export const format = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
