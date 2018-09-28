// SafeSurfer-Desktop - lintTranslations.js

//
// Copyright (C) 2018 Caleb Woodbine <info@safesurfer.co.nz>
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
//

const app = require('electron'),
 osLocale = require('os-locale'),
 fs = require('fs'),
 path = require('path');
var translationJSON, englishJSON, keyList = {},
 localeMod = osLocale.sync().slice(0,2),
 args = process.argv[2];

englishJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/translations', 'en' + '.json'), 'utf8'));
console.log("User locale:", localeMod, "\n");

if (args !== undefined) {
	localeMod = args;
	if (args == 'all') {
	  console.log("Checking all locales.");
	  fs.readdirSync('./assets/translations').forEach(file => {
      if (file.split('.')[0] != 'en') runLint(file.split('.')[0]);
    });
  }
  else {
    runLint(localeMod);
    console.log("Using locale:", args);
  }
}
else {
	console.log('Available locales:');
	fs.readdirSync('./assets/translations').forEach(file => {
    if (file.split('.')[0] != 'en') console.log(" |", file.split('.')[0]);
  });
  console.log(" | all  <-- check all locales");
}

function runLint(lang) {
  keyList.countOfKeys = 0;
  keyList.goodKeys = 0;
  keyList.untranslatedKeys = 0;
  if (args == 'en' || lang == 'en') {
	  console.log("Locale 'en' must be left, as it doesn't require translation.");
	  return;
  }

  if (fs.existsSync(path.join(__dirname, '../assets/translations', lang + '.json'))) {
	  translationJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/translations', lang + '.json'), 'utf8'));
  }
  else {
	  console.log('Cannot find your locale:', lang);
  }

  console.log(String("-- Checking: [" + lang + "] --"));

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

  console.log(String(
    "\nSUMMARY OF [" +
    lang +
    "]\n-------\n" +
    "UNTRANSLATED: " +
    keyList.untranslatedKeys+"\n" +
    "EDITED: " +
    keyList.goodKeys +
    "\n" +
    "TOTAL: " +
    keyList.countOfKeys +
    "\n-------"
  ));
  if (keyList.countOfKeys == keyList.goodKeys) {
	  console.log(String("\nGreat! '" + lang + "' appears to be done."));
  }
  console.log();
}