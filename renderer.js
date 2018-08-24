// SafeSurfer-Desktop - renderer.js

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

const {ipcRenderer} = require('electron');
const store = require('store');
const USERNAME = process.env.USER;
const os = require('os');
const isAdmin = require('is-admin');
const {dialog} = require('electron').remote;
const shell = require('electron').shell;

var userNotRoot;
var ENABLELOGGING = false;
var dialogNotRunningAsAdmin = {type: 'info', buttons: ['Show me how', 'Exit'], message: 'To adjust network settings on your computer, you must run this app as admin.'};

function showCloseDialog() {
	// display dialog for if the app hasn't been started with root privileges
	dialog.showMessageBox(dialogNotRunningAsAdmin, updateResponse => {
		if (updateResponse == 1) window.close();
		if (updateResponse == 0) {
			shell.openExternal('https://safesurfer.co.nz/faq/how-to-uac.php');
			setTimeout(function() {
				window.close();
			},250);
		}
	});
}

switch(os.platform()) {
	// display dialog per platform
	case 'linux': case 'darwin':
		if (USERNAME != 'root') {
			userNotRoot=true;
			showCloseDialog();
		}
		break;
	case 'win32':
		isAdmin().then(admin => {
			if (admin == false) {
				userNotRoot=true;
				showCloseDialog();
			}
		});
		break;
}

if (store.get('appUpdateAutoCheck') == true) checkForAppUpdate({
	current: false,
	showErrors: false
});

// continue program if app has admin rights
if (userNotRoot != true) mainReloadProcess();
