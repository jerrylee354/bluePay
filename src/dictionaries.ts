
import type { Locale } from './i18n'
import { i18n } from './i18n'

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  'zh-TW': () => import('./dictionaries/zh-TW.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  const selectedLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  return dictionaries[selectedLocale]();
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>
