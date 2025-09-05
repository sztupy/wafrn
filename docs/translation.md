# Translating Wafrn

Wafrn translations are done via JSON files located at `packages/frontend/src/assets/i18n/`. The primary language of Wafrn is English so there are a lot of small places where the translation files are not used yet.

- [Contributing to an existing language](#contributing-to-an-existing-language)
- [Adding a new language](#adding-a-new-language)
- [Enabling a language on the frontend](#enabling-a-language-on-the-frontend)

Note that adding languages is not as simple as creating the JSON file, you must follow the steps under the header [Enabling a language on the frontend](#enabling-a-language-on-the-frontend) due to technical reasons.

## Contributing to an existing language

First, locate the language you wish to add translations for in the `packages/frontend/src/assets/i18n/` folder. The language should be stored under its country code as a JSON file.

The translations on the `en.json` file are often not matched on other translation files due to being constantly updated. To add the missing keys, use the following commands:

```bash
npm run frontend:translations:patch -- YOUR_LANGUAGE_HERE.json
npm run frontend:translations:format
```

After this, you can edit the new translation keys and contribute through Git commands as normal.

## Adding a new language

To add a new language, copy the current `en.json` with a new name from the [country code](https://www.fincher.org/Utilities/CountryLanguageList.shtml). You may abbreviate to just the first part if there are no others under that name. Then simply use the English file to translate.

If you would rather start from a different language, follow the header [Adding a new language](#adding-a-new-language) to patch the language you wish to start from, then run:

```bash
npm run frontend:translations:patch -- THE_LANGUAGE_YOU_ARE_STARTING_FROM.json YOUR_NEW_LANGUAGE.json
```

You should now have a JSON file with up-to-date keys which you can start to translations on.

## Enabling a language on the frontend

Currently we manually add languages based on a list in `packages/frontend/src/app/app.component.ts` under the constructor function. To add a language, add the name of the language to the list.
