export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'zh-TW'],
  localeNames: {
    en: 'English',
    'zh-TW': '繁體中文',
  },
} as const;

export type Locale = typeof i18n['locales'][number];
