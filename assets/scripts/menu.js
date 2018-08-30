// create app menu
const {app, BrowserWindow, Menu, clipboard, electron} = require('electron'),
 shell = require('electron').shell,
 ipcRenderer = require('electron').ipcRenderer,
 os = require('os'),
 remote = require('electron').remote,
 Store = require('electron-store'),
 store = new Store(),
 BUILDMODEJSON = require('../../buildconfig/buildmode.json'),
 APPBUILD = BUILDMODEJSON.APPBUILD,
 APPVERSION = BUILDMODEJSON.APPVERSION,
 BUILDMODE = BUILDMODEJSON.BUILDMODE,
 updatesEnabled = BUILDMODEJSON.enableUpdates,
 i18n = new (require('./i18n.js'));
var accountIsAssigned = false,
 appUpdateAutoCheck = store.get('appUpdateAutoCheck');
if (appUpdateAutoCheck === undefined) store.set('appUpdateAutoCheck', true);

module.exports = (app, mainWindow) => {
	const menu = [
	{
		label: i18n.__('General'),
		submenu:
		[
			{label: i18n.__('Sites of concern'), click() {childWindow.show()} },
			{
				label: i18n.__('Toggle'),
				submenu:
				[
					{label: i18n.__('Activate'), click() {mainWindow.webContents.send('goForceEnable')} },
					{label: i18n.__('Deactivate'), click() {mainWindow.webContents.send('goForceDisable')} }
				]
			},
			{type:'separator'},
			{label: i18n.__('Exit'), click() {app.quit()}, accelerator: 'CmdOrCtrl+Q' }
		]
	},
	{
		label: i18n.__('Support'),
		submenu:
		[
			{label: i18n.__('Check status in browser'), click() {shell.openExternal('http://check.safesurfer.co.nz/')} },
	  		{label: i18n.__('Report a bug'), click() {shell.openExternal('https://safesurfer.desk.com/')} },
			{label: i18n.__('Restart'), click() {app.relaunch(); app.quit()} }
		]

	},
	{
		label: i18n.__('Info'),
		submenu:
		[
	  		{label: i18n.__('About us'), click() {shell.openExternal('http://www.safesurfer.co.nz/the-cause/')} },
	  		{label: i18n.__('Contact us'), click() {shell.openExternal('http://www.safesurfer.co.nz/contact/')} },
	  		{label:String("Version: "+APPVERSION+" - Build: "+APPBUILD), click() {mainWindow.webContents.send('goBuildToClipboard')} },
			{type:'separator'},
	  		{label: i18n.__('Help'), click() {shell.openExternal('https://www.safesurfer.co.nz/faqs/')}, accelerator: 'CmdOrCtrl+H' }
	  	]

	},
	];
	if (updatesEnabled == true && os.platform() != 'linux') menu[1].submenu[3] = {
		label: i18n.__('Updates'),
		submenu:
		[
			{label: i18n.__('Check for update'), click() {mainWindow.webContents.send('checkIfUpdateAvailable')} },
			{label: i18n.__('Automatically check for updates'), type: 'checkbox', checked: appUpdateAutoCheck, click() {mainWindow.webContents.send('toggleAppUpdateAutoCheck', appUpdateAutoCheck)} },
		]
	};
	if (BUILDMODE == "dev") menu[1].submenu[4] = {label: i18n.__('Dev tools'), role: 'toggleDevTools', accelerator: 'CmdOrCtrl+D' }
	if (accountIsAssigned == true) menu[3] = {
		label: i18n.__('Account'),
		submenu:
		[
			{label: i18n.__('My Account'), click() {} },
		]
	}
	return menu;
}
