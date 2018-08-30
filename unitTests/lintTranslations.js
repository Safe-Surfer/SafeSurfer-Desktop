const app = require('electron'),
 osLocale = require('os-locale'),
 fs = require('fs'),
 path = require('path');
var translationJSON, englishJSON, keyList = {},
 localeMod = osLocale.sync().slice(0,2),
 args = process.argv[2];

keyList.countOfKeys = 0;
keyList.goodKeys = 0;
keyList.untranslatedKeys = 0;
englishJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/translations', 'en' + '.json'), 'utf8'))

console.log("User locale:", localeMod)

if (args !== undefined) {
	localeMod = args;
	console.log("Using locale:", args);
}

if (args == 'en' || localeMod == 'en') {
	console.log("Locale 'en' must be left, as it doesn't require translation.")
	process.exit(0)
}

if (fs.existsSync(path.join(__dirname, '../assets/translations', localeMod + '.json'))) {
	translationJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/translations', localeMod + '.json'), 'utf8'))
}
else {
	console.log('Cannot find your locale:', localeMod);
}

for (var key in translationJSON) {
	if (translationJSON.hasOwnProperty(key)) {
		if (key == translationJSON[key]) {
        		console.log(String("UNTRANSLATED KEY #" + keyList.countOfKeys + " :: " + translationJSON[key]));
        		keyList.untranslatedKeys++;
		}
		else {
			keyList.goodKeys++;
		}
    	}
    	keyList.countOfKeys++;
}

console.log(String("\nSUMMARY\n-------\n\n" +"UNTRANSLATED: "+keyList.untranslatedKeys+"\n" + "EDITED: "+keyList.goodKeys+"\n"+"TOTAL: "+keyList.countOfKeys));
if (keyList.countOfKeys == keyList.goodKeys) {
	console.log(String("\nGreat! '"+localeMod+"' appears to be done."))
}
