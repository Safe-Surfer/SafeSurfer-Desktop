// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer} = require('electron')
const store = require('store')

var ENABLELOGGING = false;

if (store.get('appUpdateAutoCheck') == true) checkForAppUpdate({
	current: false,
	showErrors: false
});

mainReloadProcess();
