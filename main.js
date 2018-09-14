// SafeSurfer-Desktop - main.js

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

// import libraries
const {app, BrowserWindow, Menu, clipboard} = require('electron'),
 ipcMain = require('electron').ipcMain,
 shell = require('electron').shell,
 electron = require('electron'),
 path = require('path'),
 url = require('url'),
 os = require('os'),
 Store = require('electron-store'),
 store = new Store(),
 BUILDMODEJSON = require('./buildconfig/buildmode.json'),
 APPBUILD = BUILDMODEJSON.APPBUILD,
 APPVERSION = BUILDMODEJSON.APPVERSION,
 BUILDMODE = BUILDMODEJSON.BUILDMODE,
 updatesEnabled = BUILDMODEJSON.enableUpdates,
 i18n = new (require('./assets/scripts/i18n.js'));

let mainWindow;
let childWindow;

var appUpdateAutoCheck = store.get('appUpdateAutoCheck');
if (appUpdateAutoCheck === undefined) store.set('appUpdateAutoCheck', true);
var accountIsAssigned = store.get('accountInformation');

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 550,
		height: 600,
		minWidth: 550,
		minHeight: 600,
		title: 'Safe Surfer (beta)',
		icon: path.join(__dirname, 'assets', 'media', 'icons', 'png', '2000x2000.png')
	});

	// load in main html document
 	mainWindow.loadFile('index.html');
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
	// set menu from menu.js
	const appMenu = require('./assets/scripts/menu.js');
	Menu.setApplicationMenu(Menu.buildFromTemplate(appMenu(app, mainWindow)));
}

	app.on('ready', function() {
		createWindow();
	});

	app.on('window-all-closed', function () {
	  if (process.platform !== 'darwin') {
	    app.quit();
	  }
	})

	app.on('activate', function () {
	  if (mainWindow === null) {
	    createWindow();
	  }
});
