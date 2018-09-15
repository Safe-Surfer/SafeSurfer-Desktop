const path = require("path"),
 electron = require('electron'),
 logging = require('./logging.js'),
 fs = require('fs'),
 BUILDMODEJSON = require('../../buildconfig/buildmode.json');
let loadedLanguage,
 app = electron.app ? electron.app : electron.remote.app;
var testLanguage = BUILDMODEJSON.testLanguage;

module.exports = i18n;

function i18n() {
	if (testLanguage == null) {
		if(fs.existsSync(path.join(__dirname, '../translations', app.getLocale() + '.json'))) {
			loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', app.getLocale() + '.json'), 'utf8'));
		}
		else {
			loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', 'en.json'), 'utf8'));
		}
	}
	else {
		if(fs.existsSync(path.join(__dirname, '../translations', testLanguage + '.json'))) {
			loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', testLanguage + '.json'), 'utf8'));
		}
		else {
			loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', 'en.json'), 'utf8'));
		}
	}
}

i18n.prototype.__ = function(phrase) {
    let translation = loadedLanguage[phrase];
    if(translation === undefined) {
      translation = phrase;
      logging.log(String("i18n: phrase not defined: '" + phrase + "'"));
    }
    if (translation == phrase && app.getLocale() != 'en-US') {
      logging.log(String("i18n: phrase not translated: '" + phrase + "'"));
    }
    return translation;
}
