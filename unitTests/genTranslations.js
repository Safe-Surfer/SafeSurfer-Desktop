#!/usr/bin/node

const enTranslation = require('../assets/translations/en.json'),
  fs = require('fs');
var languageToFix,
  localeName,
  localeFile;

fs.readdirSync('../assets/translations').forEach(file => {
  if (file.split('.')[0] != 'en') {
    localeName = `../assets/translations/${file.split('.')[0]}.json`;
    localeFile = require(`${localeName}`);
    for (var key in enTranslation) {
      if (!(enTranslation[key] in localeFile)) {
        //console.log(enTranslation[key]);
        localeFile[enTranslation[key]] = "";
      }
    }
    for (var key in localeFile) {
      if (!(key in enTranslation)) {
        console.log(key);
        delete localeFile[key];
      }
    }
    console.log(file.split('.')[0]);
    fs.writeFile(localeName, JSON.stringify(localeFile, null, 4), (err) => {
      console.log(err);
    });
  }
});
