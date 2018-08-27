// SafeSurfer-Desktop - main.js

//
// Copyright (C) 2018 MY NAME <MY EMAIL>
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
 shell = require('electron').shell,
 electron = require('electron'),
 path = require('path'),
 url = require('url'),
 ipc = require('electron').ipcRenderer,
 {ipcRenderer} = require('electron'),
 Store = require('electron-store'),
 store = new Store(),
 BUILDMODEJSON = require('./buildconfig/buildmode.json'),
 APPBUILD = BUILDMODEJSON.APPBUILD,
 APPVERSION = BUILDMODEJSON.APPVERSION,
 BUILDMODE = BUILDMODEJSON.BUILDMODE,
 updatesEnabled = BUILDMODEJSON.enableUpdates;

let mainWindow;
let childWindow;

var appUpdateAutoCheck = store.get('appUpdateAutoCheck');
if (appUpdateAutoCheck === undefined) store.set('appUpdateAutoCheck', true);
var accountIsAssigned = false;

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 550,
		height: 600,
		minWidth: 550,
		minHeight: 600,
		icon: path.join(__dirname, 'ss-logo.png')
	});

	// load in main html document
 	mainWindow.loadFile('index.html');
	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	// create app menu
	var menu = [
	{
		label: '&General',
		submenu:
		[
			{label:'Sites of concern', click() {childWindow.show()} },
			{
				label: 'Toggle',
				submenu:
				[
					{label:'Force enable', click() {mainWindow.webContents.send('goForceEnable')} },
					{label:'Force disable', click() {mainWindow.webContents.send('goForceDisable')} }
				]
			},
			{type:'separator'},
			{label:'Exit', click() {app.quit()}, accelerator: 'CmdOrCtrl+Q' }
		]
	},
	{
		label: '&Support',
		submenu:
		[
			{label:'Check status in browser', click() {shell.openExternal('http://check.safesurfer.co.nz/')} },
          		{label:'Report a bug', click() {shell.openExternal('https://safesurfer.desk.com/')} },
			{label:'Reload', click() {mainWindow.reload()} }
        	]

	},
	{
		label: '&Info',
		submenu:
		[
          		{label:'About us', click() {shell.openExternal('http://www.safesurfer.co.nz/the-cause/')} },
          		{label:String("Version: "+APPVERSION+" - Build: "+APPBUILD), click() {mainWindow.webContents.send('goBuildToClipboard')} },
          		{label:'Contact', click() {shell.openExternal('http://www.safesurfer.co.nz/contact/')} }
                	{type:'separator'},
          		{label:'Help', click() {shell.openExternal('https://www.safesurfer.co.nz/faqs/')}, accelerator: 'CmdOrCtrl+H' }
          	]

	},
	];
	if (updatesEnabled == true) menu[1].submenu[3] = {
		label: 'Updates',
		submenu:
		[
			{label:'Check for update', click() {mainWindow.webContents.send('checkIfUpdateAvailable')} },
			{label:'Automatically check for updates', type: 'checkbox', checked: appUpdateAutoCheck, click() {mainWindow.webContents.send('toggleAppUpdateAutoCheck', appUpdateAutoCheck)} },
		]
	};
	if (BUILDMODE == "dev") menu[1].submenu[4] = {label: '&Dev tools', click() {mainWindow.webContents.openDevTools()}, accelerator: 'CmdOrCtrl+D' }
	if (accountIsAssigned == true) menu[3] = {
		label: '&Account',
		submenu:
		[
			{label:'My Account', click() {} },
		]
	}
	Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
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
})
