const path = require("path"),
 electron = require('electron'),
 logging = require('./logging.js'),
 fs = require('fs'),
 BUILDMODEJSON = require('../../buildconfig/buildmode.json');
let loadedLanguage,
 app = electron.app ? electron.app : electron.remote.app;
var testLanguage = BUILDMODEJSON.testLanguage;

// export undefined function
module.exports = i18n;

// define translation loading function
function i18n() {
  // if there is no language set in config
	if (testLanguage == null) {
	  // if the language set in system or config for has a locale
		if(fs.existsSync(path.join(__dirname, '../translations', app.getLocale() + '.json'))) {
			loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', app.getLocale() + '.json'), 'utf8'));
		}
		// if the langauge set in system or config doesn't have a locale
		else {
			loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', 'en.json'), 'utf8'));
		}
	}
	// load config set language
	else {
		if (fs.existsSync(path.join(__dirname, '../translations', testLanguage + '.json'))) {
			loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', testLanguage + '.json'), 'utf8'));
		}
		// if language in config doesn't exist, load english
		else {
			loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', 'en.json'), 'utf8'));
		}
	}
}

// export function
i18n.prototype.__ = function(phrase) {
    let translation = loadedLanguage[phrase];
    // if the translation doesn't exist
    if (translation === undefined || translation === '') {
      // use the phrase which doesn't have a translation from en.json
      translation = phrase;
      logging.log(String("i18n: phrase not defined: '" + phrase + "'"));
    }
    if (translation == phrase && app.getLocale() != 'en-US') {
      logging.log(String("i18n: phrase not translated: '" + phrase + "'"));
    }
    return translation;
}
