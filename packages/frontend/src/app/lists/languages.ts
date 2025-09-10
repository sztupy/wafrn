// This is the file where we get language data for the app
//
// To add a language after making the JSON file, add it to supportedLanguages
// below here as the name of your JSON file without the extension. Then add its
// data to languageMap below. Use the native version of a language
export const supportedLanguages = [
  'en',
  'de',
  'es',
  'fr',
  'ga',
  'hu',
  'nl',
  'pl',
  'ru',
  'sr-Cyrl',
  'sr-Latn',
  'tok'
] as const
type SupportedLanguagesTuple = typeof supportedLanguages
export type SupportedLanguage = SupportedLanguagesTuple[number]

export type LanguageData = { name: string }
export const languageMap: Record<SupportedLanguage, LanguageData> = {
  en: { name: 'English' },
  de: { name: 'Nederlands' },
  es: { name: 'Español' },
  fr: { name: 'Français' },
  ga: { name: 'République Gabonaise Français' },
  hu: { name: 'magyar nyelv' },
  nl: { name: 'Nederlands' },
  pl: { name: 'Polski' },
  ru: { name: 'русский язык' },
  'sr-Cyrl': { name: 'српски' },
  'sr-Latn': { name: 'srpski' },
  tok: { name: 'toki pona' }
}
