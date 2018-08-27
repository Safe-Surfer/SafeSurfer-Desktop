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
 Store = require('electron-store'),
 store = new Store(),
 encode = require('nodejs-base64-encode'),
 moment = require('moment'),
 dns_changer = require('node_dns_changer'),
 getMeta = require("lets-get-meta");
var LINUXPACKAGEFORMAT = require('./buildconfig/packageformat.json'),
 windowsNotificationCounter = 0,
 serviceEnabled,
 servicePreviousState,
 userInternetCheck,
 previousUserInternetCheck,
 resp,
 hasFoundLifeGuard,
 remoteData,
 ENABLELOGGING = false,
 APPHASLOADED = false;

var appStates = {
	"serviceEnabled":true,
	"serviceEnabled_previous":null,
	"internet":null,
	"internet_previous":null,
	"lifeguardFound":null,
	"lifeguardFound_previous":null
}

if (LINUXPACKAGEFORMAT === undefined) LINUXPACKAGEFORMAT="???";
if (ENABLELOGGING == true) console.log("Platform:", os.platform());
if (ENABLELOGGING == true) console.log(process.cwd());

function displayProtection() {
	// enable DNS
	if (userInternetCheck == true) {
		if (ENABLELOGGING == true) console.log("Protected");
		$(".serviceActiveScreen").show();
		$(".serviceInactiveScreen").hide();
		// if a lifeguard has been found
		if (hasFoundLifeGuard == true) {
			$("#bigTextProtected").html("PROTECTED BY LIFEGUARD");
			$("#toggleButton").html("CONFIGURE LIFEGUARD");
			$('.serviceToggle').addClass('serviceToggle_lifeguard')
			$('.topTextBox_active').addClass('topTextBox_active_lifeguard');
		}
		else {
			$("#bigTextProtected").html("YOU ARE PROTECTED");
			$("#toggleButton").html("STOP PROTECTION");
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
	if (userInternetCheck == true) {
		if (ENABLELOGGING == true) console.log("Unprotected");
		$(".serviceInactiveScreen").show();
		$(".serviceActiveScreen").hide();
		$("#toggleButton").html("GET PROTECTED");
		$('.serviceToggle').show();
		$('.appNoInternetConnectionScreen').hide();
		$('.appNoInternetConnectionScreen').parent().css('z-index', 2);
	}
}

function toggleServiceState() {
	// switch between states
	if (ENABLELOGGING == true) console.log("In switch");
	switch(serviceEnabled) {
		case true:
			if (ENABLELOGGING == true) console.log('Toggling enable');
			if (hasFoundLifeGuard == true) {
				shell.openExternal('http://mydevice.safesurfer.co.nz/')
				return 0;
			}
			else {
				disableServicePerPlatform();
				checkServiceState();
			}
		break;

		case false:
			if (ENABLELOGGING == true) console.log('Toggling disable');
			enableServicePerPlatform();
			checkServiceState();
		break;
	}
}

function affirmServiceState() {
	// affirm the state of the service
	if (ENABLELOGGING == true) console.log("Affirming the state");
	checkServiceState();
	switch(serviceEnabled) {
		case false:
			if (ENABLELOGGING == true) console.log('Affirming disable');
			displayUnprotection();
			return 0;
			break;

		case true:
			if (ENABLELOGGING == true) console.log('Affirming enable');
			displayProtection();
			return 0;
			break;
	}
}

function checkServiceState() {
	// check the state of the service
	if (ENABLELOGGING == true) console.log('Getting state of service');
  	//resp = rp(respOptions)
  	//if (resp.response.body.indexOf('<meta name="ss_status" content="unprotected"><!-- DO NOTE REMOVE - USED FOR STATUS CHECK -->') > -1) {
  	try {
	  	Request.get('http://check.safesurfer.co.nz', (error, response, body) => {
	  		var metaResponse = getMeta(body);
		//dns.lookup('check.safesurfer.co.nz', function(err, address) {
			if (ENABLELOGGING == true) console.log("checkServiceState - metaResponse ::", metaResponse);
			//if (ENABLELOGGING == true) console.log("checkServiceState - address ::", address);
			if (ENABLELOGGING == true) console.log("checkServiceState - err     ::", error);
			// ip address returned when service is disabled
			//console.log(getMeta(body).ss_status);
			//if (address == "104.197.143.234") {
			if (metaResponse.ss_status == 'unprotected') {
				serviceEnabled = false;
				if (ENABLELOGGING == true) console.log('DNS Request: Service disabled');
			}
			// ip address returned when service is enabled
			//else if (address == "130.211.44.88") {
			if (metaResponse.ss_status == 'protected') {
				serviceEnabled = true;
				if (ENABLELOGGING == true) console.log('DNS Request: Service enabled');
				checkIfOnLifeGuardNetwork();
			}
			// if neither are returned
			else {
	      			serviceEnabled = false;
				// check internet connection
				if (userInternetCheck == true) {
	    				if (ENABLELOGGING == true) console.log('DNS Request: Unsure of state');
				}
				else if (error !== undefined) {
					if (ENABLELOGGING == true) console.log('NETWORK: Internet connection unavailable');
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
			APPHASLOADED = true;
	  	});
	}
  	catch(err) {
  		console.log("Failed to get response :::", err)
  	}
}

function callProgram(command) {
	// call a child process
	if (ENABLELOGGING == true) console.log(String('> Calling command: ' + command));
	var command_split = command.split(" ");
	var command_arg = [];
	// concatinate 2+ into a variable
	for (var i=1; i<command_split.length; i++) {
		command_arg.push(command_split[i]);
	}
	var child = require('child_process').execFile(command_split[0],command_arg, function(err, stdout, stderr) {
		if (ENABLELOGGING == true) console.log(stdout);
		return stdout;
	});
}

function enableServicePerPlatform() {
	// apply DNS settings
	if (enableNotifications == true && windowsNotificationCounter == 0) new Notification('Safe Surfer', {
		body: 'Woohoo! Getting your computer setup now.'
	});
	windowsNotificationCounter+=1;
	if (os.platform() != 'linux') {
		setTimeout(function () {
			dns_changer.setDNSservers({
			    DNSservers:['104.197.28.121','104.155.237.225'],
			    DNSbackupName:'before_safesurfer',
			    loggingEnable:ENABLELOGGING
			});
			if (serviceEnabled == false) {
				if (ENABLELOGGING == true) console.log("ENABLE: Service is still not enabled -- trying again.")
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
	if (enableNotifications == true && windowsNotificationCounter == 0) new Notification('Safe Surfer', {
		body: 'OK! Restoring your settings now.'
	});
	windowsNotificationCounter+=1;
	if (os.platform() != 'linux') {

		setTimeout(function () {
			dns_changer.restoreDNSservers({
			    DNSbackupName:'before_safesurfer',
			    loggingEnable:ENABLELOGGING
			});
			if (serviceEnabled == true) {
				if (ENABLELOGGING == true) console.log("DISABLE: Service is still not disabled -- trying again.")
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
	if (ENABLELOGGING == true) console.log('Checking if on lifeguard network');
	var result;
	var count = 0;
	hasFoundLifeGuard = false;
	// start searching for lifeguard with bonjour
	bonjour.find({ type: "sslifeguard" }, function(service) {
	  count++;
	  if (ENABLELOGGING == true) console.log(String(count + " :: " + service.fqdn));
	  if (service.fqdn.indexOf('_sslifeguard._tcp') != -1) {
		hasFoundLifeGuard=true;
		if (ENABLELOGGING == true) console.log(String('Found status: ' + hasFoundLifeGuard));
		affirmServiceState();
		return true;
	  }
	})
	if (ENABLELOGGING == true) console.log('hasFoundLifeGuard is', hasFoundLifeGuard);
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
			userInternetCheck = false;
		}
		else {
			userInternetCheck = true;
		}
	});
}

function finishedLoading() {
	// close loading screen
	$('.appLoadingScreen').hide();
	APPHASLOADED = true;
}

function checkForAppUpdate(options) {
	// for for app update
	var baseLink,
	 versionList = [],
	 versionNew,
	 serverAddress = "104.236.242.185",
	 serverPort = 8080,
	 serverDataFile = "/version-information.json",
	 updateCurrentDialog = {type: 'info', buttons: ['Ok'], message: String('You\'re up to date.')},
	 updateErrorDialog = {type: 'info', buttons: ['Ok'], message: String('Whoops, I couldn\'t find updates... Something seems to have gone wrong.')};

	Request.get(String("http://" + serverAddress + ":" + serverPort + serverDataFile), (error, response, body) => {
		if(error) {
			// if something goes wrong
			if (options.showErrors == true) {
				dialog.showMessageBox(updateErrorDialog, updateResponse => {
					if (ENABLELOGGING == true) console.log("UPDATE: Error with updates.");
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
				//console.log(remoteData.versions[i].build);
				break;
			}
		}
		var updateAvailableDialog = {type: 'info', buttons: ['Yes', 'No'], message: String('There is an update available (v' + remoteData.versions[iteration].version + '). Do you want to install it now?')},
		 updateDowngradeDialog = {type: 'info', buttons: ['Yes', 'No'], message: String('Please downgrade to version ' + remoteData.versions[iteration].version + '. Do you want to install it now?')};
		if (remoteData.recommendedBuild > APPBUILD && versionList.indexOf(remoteData.recommendedBuild) != -1) {
			// update available
			dialog.showMessageBox(updateAvailableDialog, updateResponse => {
				if (updateResponse == 0) {
					if (ENABLELOGGING == true) console.log("UPDATE: User wants update.");
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
					if (ENABLELOGGING == true) console.log("UPDATE: User has the latest version installed.");
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
					if (ENABLELOGGING == true) console.log("UPDATE: User wants to downgrade.");
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
					if (ENABLELOGGING == true) console.log("UPDATE: Error.");
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
	teleData.ISSERVICEENABLED = serviceEnabled;
	if (os.platform() != 'win32') teleData.LINUXPACKAGEFORMAT = LINUXPACKAGEFORMAT.linuxpackageformat;
	return JSON.stringify(teleData);
}

function sendTelemetry() {
	// send information to server
	var dataToSend = encode.encode(collectTelemetry(),'base64');
	Request.post('http://104.236.242.185:3000/', {form:{tel_data:dataToSend}}, (err, response, body) => {
		if (response || body) console.log('TEL SEND: Sent.');
		if (err) {
			console.log('TEL SEND: Could not send.');
			return;
		}
	});
	//return dataToSend;
}

function telemetryPrompt() {
	// ask if user wants to participate in telemetry collection
	var teleMsg = {type: 'info', buttons: ['Yes, I will participate', 'I want to see what will be sent', 'No, thanks'], message: "We want to improve this app, one way that we can achieve this is by collecting small non-identifiable pieces of information about the devices that our app runs on.\nAs a user you\'re able to help us out.--You can respond to help us out if you like.\n - Safe Surfer team"};
	dialog.showMessageBox(teleMsg, dialogResponse => {
		if (ENABLELOGGING == true) console.log("TELE: User has agreed to the prompt.");
		if (dialogResponse == 0) {
			sendTelemetry();
		}
		else if (dialogResponse == 1) {
			var previewTeleData = {type: 'info', buttons: ['Send', 'Don\'t send'], message: String("Here is what will be sent:\n\n"+(collectTelemetry())+"\n\nIn case you don't understand this data, it includes (such things as):\n - Which operation system you use\n - How many CPU cores you have\n - If the service is setup on your computer")};
			dialog.showMessageBox(previewTeleData, dialogResponse => {
				if (dialogResponse == 0) sendTelemetry();
			});
		}
		else if (dialogResponse == 2) {
			var nothingSent = {type: 'info', buttons: ['Return'], message: "Nothing has been sent."};
			dialog.showMessageBox(nothingSent, dialogResponse => { });
		}
	});
	store.set('telemetryHasAnswer', true);
}

function versionInformationCopy() {
	// copy app build information to clipboard
	var dialogBuildInformationCopy = {type: 'info', buttons: ['No, return to app', 'Just copy information', 'Yes'], message: 'Do you want to copy the version information of this build of SafeSurfer-Desktop and go to the GitLab page to report an issue?'};
	dialog.showMessageBox(dialogBuildInformationCopy, dialogResponse => {
		clipboard.writeText(String('Platform: '+process.platform+'\nVersion: '+APPVERSION+'\nBuild: '+APPBUILD+'\nBuildMode: '+ BUILDMODE))
		if (dialogResponse == 2) shell.openExternal('https://gitlab.com/safesurfer/SafeSurfer-Desktop/issues');
	});
}

function forceToggleWarning({wantedState}) {
	// display warning message as this could break settings
	var toggleWarning = {type: 'info', buttons: ['No, nevermind', 'I understand and wish to continue'], message: 'The service is already in the state which you request.\nForcing the service to be enabled in this manner may have consequences.\nYour computer\'s network configuration could break by doing this action.'},
	 continu = false;
	if (wantedState == serviceEnabled) {
		dialog.showMessageBox(toggleWarning, dialogResponse => {
			if (dialogResponse == 1) continu = true;
		});
	}
	else continu = true;
	return continu;
}

function mainReloadProcess() {
	// reload function
	if (ENABLELOGGING == true) console.log("__ Refresh Start __");
	if (APPHASLOADED == false) {
	  if (ENABLELOGGING == true) console.log("STATE: App not loaded");
		internetConnectionCheck();
		setTimeout(function(){
			checkServiceState();
		}, 750);
	}

	else {
		finishedLoading();
		if (store.get('telemetryHasAnswer') != true) telemetryPrompt();
		internetConnectionCheck();
		checkServiceState();
		if (userInternetCheck == true) {
			if (serviceEnabled != servicePreviousState && servicePreviousState !== undefined) {
				if (ENABLELOGGING == true) console.log('SERVICE STATE: State has changed.');
				affirmServiceState();
				if (serviceEnabled == true) {
					if (enableNotifications == true) new Notification('Safe Surfer', {
	    					body: 'You are now safe to surf the internet. Safe Surfer has been setup.'
	  	  			});
	  	  		}
	  	  		else if (serviceEnabled == false) {
					if (enableNotifications == true) new Notification('Safe Surfer', {
	    					body: 'Safe Surfer has been disabled. You are now unprotected.'
	  	  			});
	  	  		}
			}
			servicePreviousState = serviceEnabled;
		}
		if (userInternetCheck != previousUserInternetCheck) {
			if (ENABLELOGGING == true) console.log('INTERNET: State has changed.');
			affirmServiceState();
  			previousUserInternetCheck = userInternetCheck;
		}
		if (hasFoundLifeGuard != appStates.lifeguardFound_previous) {
			affirmServiceState
			appStates.lifeguardFound_previous = hasFoundLifeGuard;
		}
	}

	if (ENABLELOGGING == true) console.log("__ Refresh End   __");
	setTimeout(mainReloadProcess, 1000);
}

ipcRenderer.on('toggleAppUpdateAutoCheck', (event, arg) => {
	if (ENABLELOGGING == true) console.log("UPDATES: Auto check stated changed to",!arg)
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
