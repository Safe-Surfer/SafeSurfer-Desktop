// SafeSurfer-Desktop - main.js

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

// import libraries
const {app, BrowserWindow, Menu, clipboard} = require('electron'),
  path = require('path'),
  windowStateKeeper = require('electron-window-state'),
  packageJSON = require('../../package.json'),
  isBeta = packageJSON.appOptions.isBeta;

let mainWindow,
 childWindow;

function createWindow() {
	// Create the browser window.
	let mainWindowState = windowStateKeeper({
    defaultWidth: 500,
    defaultHeight: 600
  });

  var windowObj = {
		width: mainWindowState.width,
		height: mainWindowState.height,
		minWidth: 500,
		minHeight: 600,
    'x': mainWindowState.x,
    'y': mainWindowState.y,
		title: 'Safe Surfer',
		icon: path.join(__dirname, 'assets', 'media', 'icons', 'png', '2000x2000.png'),
		webPreferences: {
		  nodeIntegration: false,
		  preload: path.join(__dirname, 'preload.js')
		}
	}
	if (isBeta == true) windowObj.title += " (beta)";
	mainWindow = new BrowserWindow(windowObj);

	// load in main html document
 	mainWindow.loadFile(path.join(__dirname, '..', 'html', 'index.html'));
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
	// set menu from menu.js
	Menu.setApplicationMenu(
	Menu.buildFromTemplate(require('./menu.js')(app, mainWindow)));
	mainWindowState.manage(mainWindow);
}

// create window when app is ready
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
