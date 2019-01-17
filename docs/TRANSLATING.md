# Translating parts of Safe Surfer desktop
Localisation is super useful, it will help us to reach more people and keep them safe on this digital surf which is the internet.  

[![Translation status](https://hosted.weblate.org/widgets/safe-surfer/-/translations/svg-badge.svg)](https://hosted.weblate.org/projects/safe-surfer/translations)  

[![Translation status list](https://hosted.weblate.org/widgets/safe-surfer/-/translations/multi-auto.svg)](https://hosted.weblate.org/projects/safe-surfer/translations)  

### Do you speak another language? If so, we would love for you to help us!
## How am I able to help?
### Check out the Weblate page
You can contribute translations is via [weblate](https://hosted.weblate.org/projects/safe-surfer/translations).  
Note: Although some translations may appear as 100%, they can still need more review.  

Your translations are much appreciated.  

Notes:  
- Please don't translate such things as 'Safe Surfer' or 'Life Guard' (when referring to our router).  
- Keep in grammatical symbols (or include ones which make the information make sense in your language) in the translated fields.  
- Please don't add any spaces to the end of lines.  

## Maintaining translations (for developers)
Locale files are located in `assets/translations`  

### Linting translations
Use `npm run lintTranslations` to lint the JSON file of your current locale.  
Use `npm run lintTranslations [locale]` replacing [locale] with a locale that's in `assets/translations`.  
Use `npm run lintTranslations all` to lint all locales.  

### Generating missing strings
Sometimes translation strings don't show up on Weblate for phrases in other languages.  
Use `npm run genTranslations` to synchronise all strings to from `en.json`.  

### Testing translations
In `package.json`, the key `appOptions.testLanguage` can be used for simulating the locale set in the app without changing the language on the device.  
If you wish to run the app with a locale set, set the given key value to the name of a locale file in `assets/translations` (without the file extension), then of course launch the app.  

Testing the app can be useful for determining if the translations visually break the app, or suit where they are.  
