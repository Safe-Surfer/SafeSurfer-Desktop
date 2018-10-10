// SafeSurfer-Desktop - i18n.js

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
  switch(testLanguage) {
    case null:
      if(fs.existsSync(path.join(__dirname, '../translations', app.getLocale() + '.json'))) {
			  loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', app.getLocale() + '.json'), 'utf8'));
		  }
		  // if the langauge set in system or config doesn't have a locale
		  else {
			  loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', 'en.json'), 'utf8'));
		  }
      break;
    default:
      if (fs.existsSync(path.join(__dirname, '../translations', testLanguage + '.json'))) {
			  loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', testLanguage + '.json'), 'utf8'));
		  }
		  // if language in config doesn't exist, load english
		  else {
			  loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations', 'en.json'), 'utf8'));
		  }
      break;
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
