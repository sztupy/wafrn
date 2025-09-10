// This is the file where we get language data for the app
//
// To add a language after making the JSON file, add it to supportedLanguages
// below here as the name of your JSON file without the extension. Then add its
// data to languageMap below. Use the native version of a language
export const supportedLanguages = ['en', 'pl', 'es', 'fr']
type SupportedLanguagesTuple = typeof supportedLanguages
export type SupportedLanguage = SupportedLanguagesTuple[number]

export type LanguageData = { name: string }
export const languageMap: Record<SupportedLanguage, LanguageData> = {
  en: { name: 'English' },
  pl: { name: 'Polski' },
  es: { name: 'Español' },
  fr: { name: 'français' }
}
