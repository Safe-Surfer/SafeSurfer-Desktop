// SafeSurfer-Desktop - logic.js

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

// include libraries
const BUILDMODEJSON = require('./buildconfig/buildmode.json'),
 APPBUILD = BUILDMODEJSON.APPBUILD,
 APPVERSION = BUILDMODEJSON.APPVERSION,
 BUILDMODE = BUILDMODEJSON.BUILDMODE,
 enableNotifications = BUILDMODEJSON.enableNotifications,
 os = require('os'),
 child_process = require('child_process'),
 dns = require('dns'),
 bonjour = require('bonjour')(),
 {dialog} = require('electron').remote,
 Request = require("request"),
 shell = require('electron').shell,
 {ipcRenderer, clipboard} = require('electron'),
 electron = require('electron'),
 app = electron.app ? electron.app : electron.remote.app,
 Store = require('electron-store'),
 store = new Store(),
 encode = require('nodejs-base64-encode'),
 moment = require('moment'),
 dns_changer = require('node_dns_changer'),
 getMeta = require("lets-get-meta")
 i18n = new (require('./assets/scripts/i18n.js')),
 logging = require('./assets/scripts/logging.js');
var LINUXPACKAGEFORMAT = require('./buildconfig/packageformat.json'),
 resp,
 remoteData,
 teleMsgHasBeenSummoned = false;

var appStates = {
	serviceEnabled: undefined,
	serviceEnabled_previous: undefined,
	internet: undefined,
	internet_previous: undefined,
	lifeguardFound: undefined,
	lifeguardFound_previous: undefined,
	appHasLoaded: false,
	enableLogging: BUILDMODEJSON.enableLogging,
	windowsNotificationCounter: 0
}

if (LINUXPACKAGEFORMAT === undefined) LINUXPACKAGEFORMAT="???";
logging.log("Platform:", os.platform(), appStates.enableLogging);
logging.log(process.cwd());

function displayProtection() {
	// enable DNS
	if (appStates.internet == true) {
		logging.log("Protected", appStates.enableLogging);
		$(".serviceActiveScreen").show();
		$(".serviceInactiveScreen").hide();
		// if a lifeguard has been found
		if (appStates.lifeguardFound == true) {
			$("#bigTextProtected").html(i18n.__("PROTECTED BY LIFEGUARD"));
			$("#toggleButton").html(i18n.__("CONFIGURE LIFEGUARD"));
			$('.serviceToggle').addClass('serviceToggle_lifeguard')
			$('.topTextBox_active').addClass('topTextBox_active_lifeguard');
		}
		else {
			$("#bigTextProtected").html(i18n.__("YOU ARE PROTECTED"));
			$("#toggleButton").html(i18n.__("STOP PROTECTION"));
			$('.serviceToggle').removeClass('serviceToggle_lifeguard');
			$('.topTextBox_active').removeClass('topTextBox_active_lifeguard');
		}
		$('.serviceToggle').show();
		$('.appNoInternetConnectionScreen').hide();
		$('.appNoInternetConnectionScreen').parent().css('z-index', 2);
	}
}

function displayUnprotection() {
	// disable DNS
	if (appStates.internet == true) {
		logging.log("Unprotected", appStates.enableLogging);
		$(".serviceInactiveScreen").show();
		$(".serviceActiveScreen").hide();
		$("#toggleButton").html(i18n.__("GET PROTECTED"));
		$('.serviceToggle').show();
		$('.appNoInternetConnectionScreen').hide();
		$('.appNoInternetConnectionScreen').parent().css('z-index', 2);
	}
}

function toggleServiceState() {
	// switch between states
	logging.log("In switch", appStates.enableLogging);
	switch(appStates.serviceEnabled) {
		case true:
			logging.log('Toggling enable', appStates.enableLogging);
			if (appStates.lifeguardFound == true) {
				shell.openExternal('http://mydevice.safesurfer.co.nz/')
				return 0;
			}
			else {
				disableServicePerPlatform();
				checkServiceState();
			}
		break;

		case false:
			logging.log('Toggling disable', appStates.enableLogging);
			enableServicePerPlatform();
			checkServiceState();
		break;
	}
}

function affirmServiceState() {
	// affirm the state of the service
	logging.log("Affirming the state", appStates.enableLogging);
	checkServiceState();
	switch(appStates.serviceEnabled) {
		case false:
			logging.log('Affirming disable', appStates.enableLogging);
			displayUnprotection();
			return 0;
			break;

		case true:
			logging.log('Affirming enable', appStates.enableLogging);
			displayProtection();
			return 0;
			break;
	}
}

function checkServiceState() {
	// check the state of the service
	logging.log('Getting state of service', appStates.enableLogging);
  	try {
	  	Request.get('http://check.safesurfer.co.nz', (error, response, body) => {
	  		var metaResponse = getMeta(body);
			logging.log(String("checkServiceState - metaResponse.ss_status :: " + metaResponse.ss_status), appStates.enableLogging);
			logging.log(String("checkServiceState - err                    :: " + error), appStates.enableLogging);
			// if the meta tag returns unprotected
			if (metaResponse.ss_status == 'unprotected') {
				appStates.serviceEnabled = false;
				logging.log('DNS Request: Service disabled', appStates.enableLogging);
			}
			// if the meta tag returns protected
			if (metaResponse.ss_status == 'protected') {
				appStates.serviceEnabled = true;
				logging.log('DNS Request: Service enabled', appStates.enableLogging);
				checkIfOnLifeGuardNetwork();
			}
			// if neither are returned
			else {
	      			appStates.serviceEnabled = false;
				// check internet connection
				if (appStates.internet == true) {
	    				logging.log('DNS Request: Unsure of state', appStates.enableLogging);
				}
				else if (error !== undefined) {
					logging.log('NETWORK: Internet connection unavailable', appStates.enableLogging);
					$('.appNoInternetConnectionScreen').show();
					$('.appNoInternetConnectionScreen').parent().css('z-index', 58);
					$('.bigText_nointernet').show();
					$('.serviceActiveScreen').hide();
					$('.serviceInactiveScreen').hide();
					$('.serviceToggle').hide();
				}
		  	}
		  	if (error === undefined) {
				$('.serviceToggle').show();
				$('.appNoInternetConnectionScreen').hide();
				$('.appNoInternetConnectionScreen').parent().css('z-index', 2);

			}
			appStates.appHasLoaded = true;
	  	});
	}
  	catch(err) {
  		logging.log(String("Failed to get response :: " + err), appStates.enableLogging);
  	}
}

function callProgram(command) {
	// call a child process
	logging.log(String('> Calling command: ' + command), appStates.enableLogging);
	var command_split = command.split(" ");
	var command_arg = [];
	// concatinate 2+ into a variable
	for (var i=1; i<command_split.length; i++) {
		command_arg.push(command_split[i]);
	}
	var child = require('child_process').execFile(command_split[0],command_arg, function(err, stdout, stderr) {
		logging.log(stdout, appStates.enableLogging);
		return stdout;
	});
}

function enableServicePerPlatform() {
	// apply DNS settings
	if (enableNotifications == true && appStates.windowsNotificationCounter == 0) new Notification('Safe Surfer', {
		body: i18n.__('Woohoo! Getting your computer setup now.')
	});
	appStates.windowsNotificationCounter+=1;
	if (os.platform() != 'linux') {
		setTimeout(function () {
			dns_changer.setDNSservers({
			    DNSservers:['104.197.28.121','104.155.237.225'],
			    DNSbackupName:'before_safesurfer',
			    loggingEnable:appStates.enableLogging
			});
			if (appStates.serviceEnabled == false) {
				logging.log("ENABLE: Service is still not enabled -- trying again.", appStates.enableLogging)
				enableServicePerPlatform();
			}
		},1200);
	}

	else {
		if (process.execPath.includes("/opt/SafeSurfer-Desktop") == true) {
			callProgram('pkexec sscli enable');
		}
		else {
			callProgram(String('pkexec '+process.cwd()+'/support/linux/shared-resources/sscli enable'));
		}
	}
}

function disableServicePerPlatform() {
	// restore DNS settings
	if (enableNotifications == true && appStates.windowsNotificationCounter == 0) new Notification('Safe Surfer', {
		body: i18n.__('OK! Restoring your settings now.')
	});
	appStates.windowsNotificationCounter+=1;
	if (os.platform() != 'linux') {

		setTimeout(function () {
			dns_changer.restoreDNSservers({
			    DNSbackupName:'before_safesurfer',
			    loggingEnable:appStates.enableLogging
			});
			if (appStates.serviceEnabled == true) {
				logging.log("DISABLE: Service is still not disabled -- trying again.", appStates.enableLogging)
				disableServicePerPlatform();
			}
		},1200);
	}

	else {
		if (process.execPath.includes("/opt/SafeSurfer-Desktop") == true) {
			callProgram('pkexec sscli disable');
		}
		else {
			callProgram(String('pkexec '+process.cwd()+'/support/linux/shared-resources/sscli disable'));
		}
	}
}

function checkIfOnLifeGuardNetwork() {
	// check if current device is on lifeguard network
	logging.log('Checking if on lifeguard network', appStates.enableLogging);
	var result;
	var count = 0;
	appStates.lifeguardFound = false;
	// start searching for lifeguard with bonjour
	bonjour.find({ type: "sslifeguard" }, function(service) {
	  count++;
	  logging.log(String(count + " :: " + service.fqdn), appStates.enableLogging);
	  if (service.fqdn.indexOf('_sslifeguard._tcp') != -1) {
		appStates.lifeguardFound=true;
		logging.log(String('Found status: ' + appStates.lifeguardFound), appStates.enableLogging);
		affirmServiceState();
		return true;
	  }
	})
	logging.log(String('appStates.lifeguardFound is ' + appStates.lifeguardFound), appStates.enableLogging);
}

function publishDesktopAppOnNetwork(state) {
	// bonjour public to network for device discovery
	if (state == "enable") bonjour.publish({ name: 'Safe Surfer Desktop', type: 'ssdesktop', port: 3158 });
	if (state == "disable") bonjour.unpublishAll();
}

function internetConnectionCheck() {
	// check the user's internet connection
	dns.lookup('google.com', function(err) {
		if (err) {
			appStates.internet = false;
		}
		else {
			appStates.internet = true;
		}
	});
}

function finishedLoading() {
	// close loading screen
	$('.appLoadingScreen').hide();
	appStates.appHasLoaded = true;
}

function checkForAppUpdate(options) {
	// for for app update
	var baseLink,
	 versionList = [],
	 versionNew,
	 serverAddress = "104.236.242.185",
	 serverPort = 8080,
	 serverDataFile = "/version-information.json",
	 updateCurrentDialog = {type: 'info', buttons: ['Ok'], message: String(i18n.__("You're up to date."))},
	 updateErrorDialog = {type: 'info', buttons: ['Ok'], message: String(i18n.__("Whoops, I couldn't find updates... Something seems to have gone wrong."))};

	Request.get(String("http://" + serverAddress + ":" + serverPort + serverDataFile), (error, response, body) => {
		if(error) {
			// if something goes wrong
			if (options.showErrors == true) {
				dialog.showMessageBox(updateErrorDialog, updateResponse => {
					logging.log("UPDATE: Error with updates.", appStates.enableLogging);
					return;
				})
			}
			return console.dir(error);
		}
		//console.dir(JSON.parse(body));
		remoteData=JSON.parse(body);
		for (item in remoteData.versions) {
			versionList.push(remoteData.versions[item].build);
		}
		var iteration;
		for (i in remoteData.versions) {
			if (remoteData.versions[i].build == remoteData.recommendedBuild) {
				iteration = i;
				//logging.log(remoteData.versions[i].build);
				break;
			}
		}
		var updateAvailableDialog = {type: 'info', buttons: [i18n.__('Yes'), i18n.__('No')], message: String(i18n.__('There is an update available' ) + '(v' + remoteData.versions[iteration].version + '). ' + i18n.__('Do you want to install it now?'))},
		 updateDowngradeDialog = {type: 'info', buttons: [i18n.__('Yes'), i18n.__('No')], message: String(i18n.__('Please downgrade to version ') + remoteData.versions[iteration].version + '. ' + i18n.__('Do you want to install it now?'))};
		if (remoteData.recommendedBuild > APPBUILD && versionList.indexOf(remoteData.recommendedBuild) != -1) {
			// update available
			dialog.showMessageBox(updateAvailableDialog, updateResponse => {
				if (updateResponse == 0) {
					logging.log("UPDATE: User wants update.", appStates.enableLogging);
					versionNew = remoteData.versions[iteration].version;
					if (remoteData.versions[iteration].altLink === undefined) {
						shell.openExternal(remoteData.baseLink);
					}
					else {
						shell.openExternal(remoteData.versions[iteration].altLink);
					}
				}
				else {
					return;
				}
			});

		}
		else if (remoteData.recommendedBuild == APPBUILD && versionList.indexOf(remoteData.recommendedBuild) != -1 && options.current == true) {
			// up to date
			dialog.showMessageBox(updateCurrentDialog, updateResponse => {
				if (updateResponse == 0) {
					logging.log("UPDATE: User has the latest version installed.", appStates.enableLogging);
					return;
				}
				else {
					return;
				}
			})
		}
		else if (remoteData.recommendedBuild < APPBUILD && versionList.indexOf(remoteData.recommendedBuild) != -1) {
			// user must downgrade
			dialog.showMessageBox(updateDowngradeDialog, updateResponse => {
				if (updateResponse == 0) {
					logging.log("UPDATE: User wants to downgrade.", appStates.enableLogging);
				}
				else {
					return;
				}
			})
			versionNew = remoteData.versions[iteration].version;
			shell.openExternal('https://safesurfer.co.nz/download/desktop');
		}
		else {
			// if something goes wrong
			if (options.showErrors == true) {
				dialog.showMessageBox(updateErrorDialog, updateResponse => {
					logging.log("UPDATE: Error.", appStates.enableLogging);
					return;
				})
			}
		}
	});
}

function collectTelemetry() {
	// if the user agrees to it, collect non identifiable information about their setup
	var teleData = {};
	teleData.DATESENT = moment().format('X');
	teleData.TYPE = os.type();
	teleData.PLATFORM = os.platform();
	teleData.RELEASE = os.release();
	teleData.CPUCORES = os.cpus().length;
	teleData.LOCALE = app.getLocale();
	teleData.ISSERVICEENABLED = appStates.serviceEnabled;
	if (os.platform() != 'win32') teleData.LINUXPACKAGEFORMAT = LINUXPACKAGEFORMAT.linuxpackageformat;
	return JSON.stringify(teleData);
}

function sendTelemetry() {
	// send information to server
	var dataToSend = encode.encode(collectTelemetry(),'base64');
	Request.post('http://104.236.242.185:3000/', {form:{tel_data:dataToSend}}, (err, response, body) => {
		if (response || body) logging.log('TEL SEND: Sent.', appStates.enableLogging);
		if (err) {
			logging.log('TEL SEND: Could not send.', appStates.enableLogging);
			return;
		}
	});
	//return dataToSend;
}

function telemetryPrompt() {
	// ask if user wants to participate in telemetry collection
	var teleMsg = {type: 'info', buttons: [i18n.__('Yes, I will participate'), i18n.__('I want to see what will be sent'), i18n.__('No, thanks')], message: i18n.__("We want to improve this app, one way that we can achieve this is by collecting small non-identifiable pieces of information about the devices that our app runs on.\nAs a user you\'re able to help us out.--You can respond to help us out if you like.\n - Safe Surfer team")};
	dialog.showMessageBox(teleMsg, dialogResponse => {
		logging.log("TELE: User has agreed to the prompt.", appStates.enableLogging);
		if (dialogResponse == 0) {
			sendTelemetry();
		}
		else if (dialogResponse == 1) {
			var previewTeleData = {type: 'info', buttons: [i18n.__('Send'), i18n.__("Don't send")], message: String(i18n.__("Here is what will be sent:")+"\n\n"+(collectTelemetry())+"\n\n"+i18n.__("In case you don't understand this data, it includes (such things as):\n - Which operation system you use\n - How many CPU cores you have\n - The language you have set \n - If the service is setup on your computer"))};
			dialog.showMessageBox(previewTeleData, dialogResponse => {
				if (dialogResponse == 0) sendTelemetry();
			});
		}
		else if (dialogResponse == 2) {
			var nothingSent = {type: 'info', buttons: [i18n.__('Return')], message: i18n.__("Nothing has been sent.")};
			dialog.showMessageBox(nothingSent, dialogResponse => { });
		}
	});
	store.set('telemetryHasAnswer', true);
}

function versionInformationCopy() {
	// copy app build information to clipboard
	var dialogBuildInformationCopy = {type: 'info', buttons: [i18n.__('No, return to app'), i18n.__('Just copy information'), i18n.__('Yes')], message: i18n.__('Do you want to copy the version information of this build of SafeSurfer-Desktop and go to the GitLab page to report an issue?')};
	dialog.showMessageBox(dialogBuildInformationCopy, dialogResponse => {
		clipboard.writeText(String('Platform: '+process.platform+'\nVersion: '+APPVERSION+'\nBuild: '+APPBUILD+'\nBuildMode: '+ BUILDMODE))
		if (dialogResponse == 2) shell.openExternal('https://gitlab.com/safesurfer/SafeSurfer-Desktop/issues/new');
	});
}

function forceToggleWarning({wantedState}) {
	// display warning message as this could break settings
	var toggleWarning = {type: 'info', buttons: [i18n.__('No, nevermind'), i18n.__('I understand and wish to continue')], message: i18n.__('The service is already in the state which you request.\nForcing the service to be enabled in this manner may have consequences.\nYour computer\'s network configuration could break by doing this action.')},
	 continu = false;
	if (wantedState == appStates.serviceEnabled) {
		dialog.showMessageBox(toggleWarning, dialogResponse => {
			if (dialogResponse == 1) continu = true;
		});
	}
	else continu = true;
	return continu;
}

function mainReloadProcess() {
	// reload function
	logging.log("__ Refresh Start __", appStates.enableLogging);
	if (appStates.appHasLoaded == false) {
	  logging.log("STATE: App not loaded", appStates.enableLogging);
		internetConnectionCheck();
		setTimeout(function(){
			checkServiceState();
		}, 750);
	}

	else {
		finishedLoading();
		if (store.get('telemetryHasAnswer') != true && teleMsgHasBeenSummoned == false) {
			teleMsgHasBeenSummoned = true
			setTimeout(() => {telemetryPrompt()},5000)
		};
		internetConnectionCheck();
		checkServiceState();
		if (appStates.internet == true) {
			if (appStates.serviceEnabled != appStates.serviceEnabled_previous && appStates.serviceEnabled_previous !== undefined) {
				logging.log('SERVICE STATE: State has changed.', appStates.enableLogging);
				affirmServiceState();
				if (appStates.serviceEnabled == true) {
					if (enableNotifications == true) new Notification('Safe Surfer', {
	    					body: i18n.__('You are now safe to surf the internet. Safe Surfer has been setup.')
	  	  			});
	  	  		}
	  	  		else if (appStates.serviceEnabled == false) {
					if (enableNotifications == true) new Notification('Safe Surfer', {
	    					body: i18n.__('Safe Surfer has been disabled. You are now unprotected.')
	  	  			});
	  	  		}
			}
			appStates.serviceEnabled_previous = appStates.serviceEnabled;
		}
		if (appStates.internet != appStates.internet_previous) {
			logging.log('INTERNET: State has changed.', appStates.enableLogging);
			affirmServiceState();
  			appStates.internet_previous = appStates.internet;
		}
		if (appStates.lifeguardFound != appStates.lifeguardFound_previous) {
			affirmServiceState
			appStates.lifeguardFound_previous = appStates.lifeguardFound;
		}
	}

	logging.log("__ Refresh End   __", appStates.enableLogging);
	setTimeout(mainReloadProcess, 1000);
}

ipcRenderer.on('toggleAppUpdateAutoCheck', (event, arg) => {
	logging.log(String("UPDATES: Auto check stated changed to " + !arg), appStates.enableLogging);
	if (arg == true) {
		store.set('appUpdateAutoCheck', false);
	}

	else if (arg == false) {
		store.set('appUpdateAutoCheck', true);
	}
});

ipcRenderer.on('checkIfUpdateAvailable', (event, arg) => {
	checkForAppUpdate({
		current: true,
		showErrors: true
	});
});

ipcRenderer.on('goForceEnable', () => {
	if (forceToggleWarning({wantedState: true}) == true) enableServicePerPlatform();
});

ipcRenderer.on('goForceDisable', () => {
	if (forceToggleWarning({wantedState: false}) == true) disableServicePerPlatform();
});

ipcRenderer.on('goBuildToClipboard', () => {
	versionInformationCopy();
});
