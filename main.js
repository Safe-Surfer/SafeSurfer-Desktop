// import libraries
const {app, BrowserWindow, Menu} = require('electron');
const shell = require('electron').shell;
const electron = require('electron');
const path = require('path');
const url = require('url');
const ipc = require('electron').ipcRenderer;
const {ipcRenderer} = require('electron');
const store = require('store');

let mainWindow;
let childWindow;

var appUpdateAutoCheck = store.get('appUpdateAutoCheck');
if (appUpdateAutoCheck === undefined) store.set('appUpdateAutoCheck', true);

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
	var menu = Menu.buildFromTemplate([
	{
		label: 'General',
		submenu:
		[
			{label:'Sites of concern', click() {childWindow.show()} },
			{label:'Force enable', click() {mainWindow.webContents.send('goForceEnable')} },
			{type:'separator'},
			{label:'Exit', click() {app.quit()}, accelerator: 'CmdOrCtrl+Q' }
		]
	},
	{
		label: 'Support',
		submenu:
		[
			{label:'Check status in browser', click() {shell.openExternal('http://check.safesurfer.co.nz/')} },
          		{label:'Report a bug', click() {shell.openExternal('https://safesurfer.desk.com/')} },
          		{
          			label: 'Updates',
          			submenu:
          			[
          				{label:'Check for update', click() {mainWindow.webContents.send('checkIfUpdateAvailable')} },
          				{label:'Automatically check for updates', type: 'checkbox', checked: appUpdateAutoCheck, click() {mainWindow.webContents.send('toggleAppUpdateAutoCheck', appUpdateAutoCheck)} },
          			]
          		},
			{label:'Reload', click() {mainWindow.reload()} },
			{label: 'Dev tools', click() {mainWindow.webContents.openDevTools()}, accelerator: 'CmdOrCtrl+D' }
        	]

	},
	{
		label: 'Info',
		submenu:
		[
          		{label:'About us', click() {shell.openExternal('http://www.safesurfer.co.nz/the-cause/')} },
                	{type:'separator'},
          		{label:'Help', click() {shell.openExternal('https://www.safesurfer.co.nz/faqs/')}, accelerator: 'CmdOrCtrl+H' }
          	]

	},
	{
		label: 'Account',
		submenu:
		[
			{label:'My Account', click() {} },
		]
	}
	])
	Menu.setApplicationMenu(menu);
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
