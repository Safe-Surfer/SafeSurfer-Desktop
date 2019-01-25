// SafeSurfer-Desktop - i18n.js

//
// Copyright (C) 2018 Caleb Woodbine <info@safesurfer.co.nz>
//
// This file is part of SafeSurfer-Desktop.
//
// SafeSurfer-Desktop is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SafeSurfer-Desktop is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with SafeSurfer-Desktop.  If not, see <https://www.gnu.org/licenses/>.
//

const path = require('path')
const electron = require('electron')
const logging = require('./logging.js')
const fs = require('fs')
const testLanguage = require('../../package.json').appOptions.testLanguage
let loadedLanguage

let app = electron.app ? electron.app : electron.remote.app
var locale = testLanguage === null ? app.getLocale() : testLanguage

// export undefined function
module.exports = i18n

// define translation loading function
function i18n () {
  // if there is no language set in config
  if (fs.existsSync(path.join(__dirname, '..', 'translations', locale + '.json'))) loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'translations', locale + '.json'), 'utf8'))
  // if the langauge set in system or config doesn't have a locale
  else loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'translations', 'en.json'), 'utf8'))
}

// export function
i18n.prototype.__ = function (phrase) {
  let translation = loadedLanguage[phrase]
  // if the translation doesn't exist
  if (translation === undefined || translation === '') {
    // use the phrase which doesn't have a translation from en.json
    translation = phrase
    logging(`[i18n] ${locale} phrase not defined: '${phrase}'`)
  }
  if (translation == phrase && locale != 'en-US') logging(`[i18n] ${locale} phrase not translated: '${phrase}'`)
  else if (translation === undefined) logging(`[i18n] ${locale} phrase '${phrase}' is not in translation JSON files`)
  return translation
}
