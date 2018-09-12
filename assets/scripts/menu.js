// SafeSurfer-Desktop - menu.js

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

// create app menu
const {app, BrowserWindow, Menu, clipboard, electron} = require('electron'),
 shell = require('electron').shell,
 ipcRenderer = require('electron').ipcRenderer,
 os = require('os'),
 remote = require('electron').remote,
 path = require('path'),
 Store = require('electron-store'),
 store = new Store(),
 BUILDMODEJSON = require('../../buildconfig/buildmode.json'),
 APPBUILD = BUILDMODEJSON.APPBUILD,
 APPVERSION = BUILDMODEJSON.APPVERSION,
 BUILDMODE = BUILDMODEJSON.BUILDMODE,
 updatesEnabled = BUILDMODEJSON.enableUpdates,
 i18n = new (require('./i18n.js'));
var accountIsAssigned = store.get('accountInformation'),
 appUpdateAutoCheck = store.get('appUpdateAutoCheck');
if (appUpdateAutoCheck === undefined) store.set('appUpdateAutoCheck', true);

module.exports = (app, mainWindow) => {
	const menu = [
	{
		label: i18n.__('General'),
		submenu:
		[
			/*{label: i18n.__('Sites of concern'), click() {childWindow.show()} },*/
			{
				label: i18n.__('Toggle'),
				submenu:
				[
					{label: i18n.__('Activate'), click() {mainWindow.webContents.send('goForceEnable')} },
					{label: i18n.__('Deactivate'), click() {mainWindow.webContents.send('goForceDisable')} }
				]
			},
			{label: i18n.__('Give feedback'), click() {shell.openExternal('http://www.safesurfer.co.nz/feedback/')} },
	  	{label: i18n.__('Help'), click() {shell.openExternal('https://community.safesurfer.co.nz/')}, accelerator: 'CmdOrCtrl+H' },
			{type:'separator'},
			{label: i18n.__('Exit'), click() {app.quit()}, accelerator: 'CmdOrCtrl+Q' }
		]
	},
	{
		label: i18n.__('Support'),
		submenu:
		[
			{label: i18n.__('Check status in browser'), click() {shell.openExternal('http://check.safesurfer.co.nz/')} },
	  		{label: i18n.__('Report a bug'), click() {shell.openExternal('https://gitlab.com/safesurfer/SafeSurfer-Desktop/blob/master/BUGS.md')} },
			{label: i18n.__('Restart'), click() {app.relaunch(); app.quit()} }
		]

	},
	{
		label: i18n.__('Info'),
		submenu:
		[
	  		{label: i18n.__('About us'), click() {shell.openExternal('http://www.safesurfer.co.nz/the-cause/')} },
	  		{label: i18n.__('Contact us'), click() {shell.openExternal('http://www.safesurfer.co.nz/contact/')} },
	  		{label: i18n.__('Contribute to this project'), click() {shell.openExternal('https://gitlab.com/safesurfer/SafeSurfer-Desktop')} },
			{type:'separator'},
	  		{label:String(i18n.__("Version") + ": "+APPVERSION+" - " + i18n.__("Build") + ": "+APPBUILD + " (" + BUILDMODE + ")"), click() {mainWindow.webContents.send('goBuildToClipboard')} },
			{type:'separator'},
	  		{label: i18n.__('About this app'), click() {} }
	  	]

	},
	];
	// show updates menu if enabled and platform is not Linux (as updates will be handled else where)
	if (updatesEnabled == true && (os.platform() != 'linux' || BUILDMODEJSON.BUILDMODE == 'dev')) menu[1].submenu[3] = {
		label: i18n.__('Updates'),
		submenu:
		[
			{label: i18n.__('Check for update'), click() {mainWindow.webContents.send('checkIfUpdateAvailable')} },
			{label: i18n.__('Automatically check for updates'), type: 'checkbox', checked: appUpdateAutoCheck, click() {mainWindow.webContents.send('toggleAppUpdateAutoCheck', appUpdateAutoCheck)} },
		]
	};
	// hide dev tools if not enabled
	if (BUILDMODE == "dev") {
		menu[1].submenu[4] = {label: i18n.__('Dev tools'), role: 'toggleDevTools', accelerator: 'CmdOrCtrl+D' }
	}
	if (accountIsAssigned == true) menu[3] = {
		label: i18n.__('Account'),
		submenu:
		[
			{label: i18n.__('My Account'), click() {} },
		]
	}
	return menu;
}
