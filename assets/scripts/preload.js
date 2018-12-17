// SafeSurfer-Desktop - preload.js

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

var Store = require('electron-store'),
 store = new Store()

global.desktop = Object.freeze({
  global: {
    jquery: () => require('jquery'),
    linuxpackageformat: process.env.LINUXPACKAGEFORMAT === undefined ? undefined : process.env.LINUXPACKAGEFORMAT,
    packageJSON: () => require('../../package.json'),
    i18n: () => new (require('./i18n.js')),
    logging: () => require('./logging.js'),
    Store: () => require('electron-store'),
    store: () => new Store(),
    loadLogic: () => require('./logic.js')
  },
  logic: {
    node_dns_changer: require('node_dns_changer'),
    bonjour: require('bonjour')(),
    electronClipboardWriteText: (text) => require('electron').clipboard.writeText(text),
    electronOpenExternal: (link) => require('electron').shell.openExternal(link),
    dialogBox: () => require('electron').remote,
    shelljs_which: (prog) => require('shelljs').which(prog),
    shelljs_test: require('shelljs').test,
    isAdmin: () => require('is-admin')(),
    base64Encode: () => require('nodejs-base64-encode'),
    connectivity: () => require('connectivity')
  }
});
