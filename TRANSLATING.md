# Translating parts of Safe Surfer desktop
Localisation is super useful, it will help us to reach more people and keep them safe on this digital surf which is the internet  

### Do you speak another language? If so, we would love for you to help us!
## How am I able to help?
In `assets/translations`, you can create a locale file of the language you speak to translate the app.  

## How do I start?
1. Copy `assets/translations/en.json` into a new file (with the letters of your locale language name for the name of the JSON file ... i.e: ja for japanese, fr for french, es for spanish) in the same directory.  
2. Start translating the data in the second data field of the JSON file.  

Before:  
```JSON
	"General": "General",
	"Support": "Support",
	"Info": "Info",
```

After:  
```JSON
	"General": "Allgemein",
	"Support": "Unterstützung",
	"Info": "Information",
```

## Linting/testing
You can check to make sure that you haven't forgotten any phrases here and there but using the testTranslations.js unit test, or by running the app with logging enabled in your language.  
Use `npm run lintTranslations` to lint the JSON file of your current locale.  
Use `npm run listTranslations [locale]` replacing [locale] with a locale that's in ./assets/translations.  
Use `npm run listTranslations all` to lint all locales.  
Another part is running the app, to determine if it looks good and doesn't visually break anything (i.e: text falling off areas, too long sets of words).  
You can also test the app in the language that you are wanting to translate it to without setting the language by changing `null` in `"testLanguage": null` in `buildconfig/buildmode.json` to the locale name of your language (i.e: `"testLanguage": "de"`). Note: When you're finished with your testing of the translation, and want to submit a pull request, please revert back to `"testLanguage": null` in `buildconfig/buildmode.json`  

## Some things to take note of
- The length of the translation--Please be brief yet keep as much information as possible.  
- Please test your translation (as is in previous paragraph).  
- Keep in things such as `\n` and grammatical symbols (or include ones which make the information make sense in your language) in the translated fields.  
- Do not translate such things as 'Safe Surfer' or 'Life Guard' (when referring to our router).
