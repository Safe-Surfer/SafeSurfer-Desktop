// SafeSurfer-Desktop - renderer.js

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

const {ipcRenderer} = require('electron'),
 Store = require('electron-store'),
 store = new Store(),
 USERNAME = process.env.USER,
 os = require('os'),
 isAdmin = require('is-admin'),
 {dialog} = require('electron').remote,
 shell = require('electron').shell,
 BUILDMODEJSON = require('./buildconfig/buildmode.json'),
 updatesEnabled = BUILDMODEJSON.enableUpdates,
 requireRoot = BUILDMODEJSON.requireRoot,
 i18n = new (require('./assets/scripts/i18n.js')),
 logging = require('./assets/scripts/logging.js');

// translate HTML elements
$('#bigTextProtected').text(i18n.__('YOU ARE PROTECTED'));
$('#subTextProtected').text(i18n.__('YOU ARE SAFE TO SURF THE INTERNET'));
$('#bigTextUnprotected').text(i18n.__('DANGER AHEAD'));
$('#subTextUnprotected').text(i18n.__('YOU ARE NOT PROTECTED IN THE ONLINE SURF'));
$('#bigTextNoInternet').text(i18n.__("IT APPEARS THAT YOU'VE YOUR LOST INTERNET CONNECTION."));
$('#toggleButton').text(i18n.__('CHECKING SERVICE STATE'));

// if auto-update checking is enabled and updates are enabled, check for them
if (store.get('appUpdateAutoCheck') == true && updatesEnabled == true && (os.platform() != 'linux' || BUILDMODEJSON.BUILDMODE == 'dev')) appFrame.checkForAppUpdate({
	current: false,
	showErrors: false
});

// if user hasn't provided a response to telemetry
if (store.get('telemetryHasAnswer') != true) {
	setTimeout(() => {appFrame.telemetryPrompt()},5000);
};

// initalise rest of app
appFrame.checkServiceState();
setTimeout(function() {
	// run main process which loops
	appFrame.finishedLoading();
	appFrame.mainReloadProcess();
}, 1000);

