#!/usr/bin/node

//
// Copyright (C) 2018 Caleb Woodbine <info@safesurfer.co.nz>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
const fs = require('fs'),
  path = require('path'),
  dirAssets;
if (fs.existsSync(path.join('..', 'assets', 'translations'))) dirAssets = path.join('..', 'assets', 'translations');
else if (fs.existsSync(path.resolve(path.join('.', 'assets', 'translations')))) dirAssets = path.resolve(path.join('.', 'assets', 'translations'));
const enTranslation = require(path.join(`${dirAssets}`, 'en.json'));
var languageToFix,
  localeName,
  localeFile,
  keysAdded = 0,
  keysDeleted = 0,
  editCount = 0;

// iterate through all translation files
fs.readdirSync(`${dirAssets}`).forEach(file => {
  keysAdded = 0;
  keysDeleted = 0;
  if (file.split('.')[0] != 'en') {
    localeName = path.join(`${dirAssets}`,`${file.split('.')[0]}.json`);
    localeFile = require(`${localeName}`);
    // iterate through all keys in English base translation
    for (var key in enTranslation) {
      // if a key from English base isn't in the current translation
      if (!(enTranslation[key] in localeFile)) {
        localeFile[enTranslation[key]] = "";
        keysAdded += 1;
      }
    }
    // iterate through all keys in translation
    for (var key in localeFile) {
      // if a key is in translation but not base, delete it
      if (!(key in enTranslation)) {
        delete localeFile[key];
        keysDeleted += 1;
      }
    }
    // if anything has been edited
    if (keysAdded != 0 || keysDeleted != 0) {
      console.log(`[${editCount}] ${file.split('.')[0]} edited. ${keysAdded} have been added. ${keysDeleted} have been removed.`);
      // write edited locale
      fs.writeFile(localeName, JSON.stringify(localeFile, null, 4), (err) => {
        if (err !== null) console.log(err);
      });
      editCount += 1;
    }
  }
});

// summary
console.log(`${editCount > 0 ? "\n" : ""}${editCount} have been edited.`)
