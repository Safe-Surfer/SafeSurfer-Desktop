// SafeSurfer-Desktop - logic.js

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

// include libraries

// note: make app more secure and use global.desktop.buildmodejson() instead of require()
const BUILDMODEJSON = require('./buildconfig/buildmode.json'),
 APPBUILD = BUILDMODEJSON.APPBUILD,
 APPVERSION = BUILDMODEJSON.APPVERSION,
 BUILDMODE = BUILDMODEJSON.BUILDMODE,
 enableNotifications = BUILDMODEJSON.enableNotifications,
 requireRoot = BUILDMODEJSON.requireRoot,
 os = require('os'),
 child_process = require('child_process'),
 dns = require('dns'),
 path = require('path'),
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
 isAdmin = require('is-admin'),
 getMeta = require("lets-get-meta")
 i18n = new (require('./assets/scripts/i18n.js')),
 logging = require('./assets/scripts/logging.js'),
 connectivity = require('connectivity');
var LINUXPACKAGEFORMAT = require('./buildconfig/packageformat.json'),
 resp,
 remoteData;

// an object to keep track of multiple things
var appStates = {
	serviceEnabled: undefined,
	serviceEnabled_previous: undefined,
	internet: undefined,
	internet_previous: undefined,
	lifeguardFound: undefined,
	lifeguardFound_previous: undefined,
	appHasLoaded: false,
	enableLogging: BUILDMODEJSON.enableLogging,
	notificationCounter: 0,
	userIsAdmin: undefined
}

// if a linux package format can't be found, then state unsureness
if (LINUXPACKAGEFORMAT === undefined) LINUXPACKAGEFORMAT="???";
logging.log("INFO.platform:", os.platform(), appStates.enableLogging);
logging.log(process.cwd());

function displayProtection() {
	// enable DNS
	if (appStates.internet == true) {
		logging.log("STATE: protected", appStates.enableLogging);
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
			// if lifeguard is not found
			$("#bigTextProtected").html(i18n.__("YOU ARE PROTECTED"));
			$("#toggleButton").html(i18n.__("STOP PROTECTION"));
			$('.serviceToggle').removeClass('serviceToggle_lifeguard');
			$('.topTextBox_active').removeClass('topTextBox_active_lifeguard');
		}
		// make sure that button is persistent
		$('.serviceToggle').show();
		$('.appNoInternetConnectionScreen').hide();
		$('.appNoInternetConnectionScreen').parent().css('z-index', 2);
	}
}

function displayUnprotection() {
	// disable DNS
	if (appStates.internet == true) {
		logging.log("STATE: Unprotected", appStates.enableLogging);
		$(".serviceInactiveScreen").show();
		$(".serviceActiveScreen").hide();
		$("#toggleButton").html(i18n.__("GET PROTECTED"));
		$('.serviceToggle').show();
		$('.appNoInternetConnectionScreen').hide();
		$('.appNoInternetConnectionScreen').parent().css('z-index', 2);
	}
}

function displayNoInternetConnection() {
	// show the user that they don't have an internet connection
	$('.appNoInternetConnectionScreen').show();
	$('.appNoInternetConnectionScreen').parent().css('z-index', 58);
	$('.bigText_nointernet').show();
	$('.serviceActiveScreen').hide();
	$('.serviceInactiveScreen').hide();
	$('.serviceToggle').hide();
}

function hideNoInternetConnection() {
	// hide the internet connection loss screen
	$('.serviceToggle').show();
	$('.appNoInternetConnectionScreen').hide();
	$('.appNoInternetConnectionScreen').parent().css('z-index', 2);
}

function toggleServiceState() {
	// switch between states
	logging.log("USER: In switch", appStates.enableLogging);
	appStates.notificationCounter = 0;
	// if user's privileges are Admin, or if the host OS is Linux
	if (appStates.userIsAdmin == true || os.platform() == 'linux') {
		switch(appStates.serviceEnabled) {
			case true:
				logging.log('STATE: trying toggle enable', appStates.enableLogging);
				if (appStates.lifeguardFound == true) {
					window.open('http://mydevice.safesurfer.co.nz');
				}
				else {
					disableServicePerPlatform({});
				}
			break;

			case false:
				logging.log('STATE: trying toggle disable', appStates.enableLogging);
				enableServicePerPlatform({});
			break;
		}
	}
	else {
		showUnprivillegedMessage();
	}
}

function affirmServiceState() {
	// affirm the state of the service
	logging.log("STATE: Affirming the state", appStates.enableLogging);
	switch(appStates.serviceEnabled) {
		case false:
			logging.log('STATE: trying affirm disable', appStates.enableLogging);
			displayUnprotection();
			return 0;
			break;

		case true:
			logging.log('STATE: trying affirm enable', appStates.enableLogging);
			displayProtection();
			return 0;
			break;
	}
}

function checkServiceState() {
	// check the state of the service
	logging.log('STATE: Getting state of service', appStates.enableLogging);
  	Request.get('http://check.safesurfer.co.nz', (error, response, body) => {
  		if (error) {
  			appStates.internet = false;
  		}
  		else {
  			appStates.internet = true;
  		}

  		var metaResponse = getMeta(body);
  		var searchForResp = body.search('<meta name="ss_status" content="protected">');
		  logging.log(String("checkServiceState - metaResponse.ss_status :: " + metaResponse.ss_status), appStates.enableLogging);
		  logging.log(String("checkServiceState - err                    :: " + error), appStates.enableLogging);
		  if (searchForResp == -1 || metaResponse.ss_state == 'unprotected') {
	  		appStates.serviceEnabled = false;
  			logging.log('STATE: Get Request - Service disabled', appStates.enableLogging);
  			affirmServiceState();
  		}
  		// if the meta tag returns protected
		  if (searchForResp != -1 || metaResponse.ss_status == 'protected') {
	  		appStates.serviceEnabled = true;
	  		logging.log('STATE: Get Request - Service enabled', appStates.enableLogging);
	  		affirmServiceState();
	  	}
	  	// if neither are returned
	  	else {
	  		logging.log("STATE: Get Request - Can't see protection state from meta tag", appStates.enableLogging);
       	//appStates.serviceEnabled = false;
	  		// check internet connection
			  if (appStates.internet == true) {
    		  logging.log('STATE: Get Request - Unsure of state', appStates.enableLogging);
			  }
			  else if (error !== undefined || appStates.internet != true) {
				  logging.log('NETWORK: Internet connection unavailable', appStates.enableLogging);
			  }
	    }
	  	// since the request has succeeded, we can count the app as loaded
		  appStates.appHasLoaded = true;
  	});
}

function callProgram(command) {
	// call a child process
	logging.log(String('COMMAND: calling - ' + command), appStates.enableLogging);
	var command_split = command.split(" ");
	var command_arg = [];
	// concatinate 2+ into a variable
	for (var i=1; i<command_split.length; i++) {
		command_arg.push(command_split[i]);
	}
	// command will be executed as: comand [ARGS]
	var child = require('child_process').execFile(command_split[0],command_arg, function(err, stdout, stderr) {
		logging.log(String("COMMAND: output - " + stdout), appStates.enableLogging);
		return stdout;
	});
}

function enableServicePerPlatform({forced}) {
	// apply DNS settings
  if (forced === undefined) forced = "";
	if (enableNotifications == true && appStates.notificationCounter == 0) new Notification('Safe Surfer', {
		body: i18n.__('Woohoo! Getting your computer setup now.')
	});
	appStates.notificationCounter += 1;
	if (os.platform() != 'linux') {
		// if the host OS is not Linux, use the node_dns_changer module to modify system DNS settings
		setTimeout(function () {
			dns_changer.setDNSservers({
			    DNSservers:['104.197.28.121','104.155.237.225'],
			    DNSbackupName:'before_safesurfer',
			    loggingEnable:appStates.enableLogging
			});
			if (appStates.serviceEnabled == false) {
				logging.log("STATE: Service is still not enabled -- trying again.", appStates.enableLogging);
				enableServicePerPlatform();
			}
		},1200);
	}
	else {
		// if the platform is linux, use sscli to toggle DNS settings
		// if running when installed
		if (process.execPath.includes("/opt/SafeSurfer-Desktop") == true) {
			//
			callProgram(String('pkexec sscli enable ' + forced));
		}
		else {
			callProgram(String('pkexec '+process.cwd()+'/support/linux/shared-resources/sscli enable ' + forced));
		}
	}
}

function disableServicePerPlatform({forced}) {
	// restore DNS settings
  if (forced === undefined) forced = "";
	if (enableNotifications == true && appStates.notificationCounter == 0) new Notification('Safe Surfer', {
		body: i18n.__('OK! Restoring your settings now.')
	});
	appStates.notificationCounter += 1;
	if (os.platform() != 'linux') {
		// if the host OS is not Linux, use the node_dns_changer module to modify system DNS settings
		setTimeout(function () {
			dns_changer.restoreDNSservers({
			    DNSbackupName:'before_safesurfer',
			    loggingEnable:appStates.enableLogging
			});
			if (appStates.serviceEnabled == true) {
				logging.log("STATE: Service is still not disabled -- trying again.", appStates.enableLogging)
				disableServicePerPlatform({});
			}
		},1200);
	}
	else {
		// if the platform is linux, use sscli to toggle DNS settings
		// if running when installed
		if (process.execPath.includes("/opt/SafeSurfer-Desktop") == true) {
			callProgram(String('pkexec sscli disable '));
		}
		else {
			// if running from home folder
			callProgram(String('pkexec '+process.cwd()+'/support/linux/shared-resources/sscli disable ' + forced));
		}
	}
}

function checkIfOnLifeGuardNetwork() {
	// check if current device is on lifeguard network
	logging.log('LIFEGUARDSTATE: Checking if on lifeguard network', appStates.enableLogging);
	var result = false;
	var count = 0;
	// start searching for lifeguard with bonjour
	bonjour.findOne({ type: "sslifeguard" }, function(service) {
		count++;
		logging.log(String("LIFEGUARDSTATE: count - " + count + " :: " + service.fqdn), appStates.enableLogging);
		// if a lifeguard is found
		if (service.fqdn.indexOf('_sslifeguard._tcp') != -1) {
			result = true;
			logging.log(String('LIFEGUARDSTATE: Found status - ' + appStates.lifeguardFound), appStates.enableLogging);
		}
		else {
			result = false;
		}
		appStates.lifeguardFound = result;
		logging.log(String('LIFEGUARDSTATE: appStates.lifeguardFound is ' + appStates.lifeguardFound), appStates.enableLogging);
	});
}

function publishDesktopAppOnNetwork(state) {
	// bonjour public to network for device discovery
	if (state == "enable") bonjour.publish({ name: 'Safe Surfer Desktop', type: 'ssdesktop', port: 3158 });
	if (state == "disable") bonjour.unpublishAll();
}

function internetConnectionCheck() {
	// check the user's internet connection
	connectivity(function (online) {
		if (online) {
			appStates.internet = true;
			appStates.appHasLoaded = true;
		}
		else {
			appStates.internet = false;
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
	 serverAddress = "142.93.48.189",
	 serverPort = 80,
	 serverDataFile = "/files/desktop/version-information.json",
	 updateCurrentDialog = {type: 'info', buttons: ['Ok'], message: String(i18n.__("You're up to date."))},
	 updateErrorDialog = {type: 'info', buttons: ['Ok'], message: String(i18n.__("Whoops, I couldn't find updates... Something seems to have gone wrong."))};

	Request.get(String("http://" + serverAddress + ":" + serverPort + serverDataFile), (error, response, body) => {
		if(error) {
		  appStates.internet = false;
			// if something goes wrong
			if (options.showErrors == true) {
				dialog.showErrorBox(updateErrorDialog, updateResponse => {
					logging.log("UPDATE: Error with updates.", appStates.enableLogging);
					return;
				})
			}
			return console.dir(error);
		}
		appStates.internet = true;
		// read the data as JSON
		remoteData=JSON.parse(body);
		for (item in remoteData.versions) {
			versionList.push(remoteData.versions[item].build);
		}
		var iteration,
		  versionRecommended;
		if (store.get('betaCheck') == false) {
		  buildRecommended = remoteData.recommendedBuild;
		}
		else {
		  buildRecommended = remoteData.recommendedBetaBuild;
		}
		for (i in remoteData.versions) {
			if (remoteData.versions[i].build == buildRecommended) {
				iteration = i;
				break;
			}
		}
		var updateAvailableDialog = {type: 'info', buttons: [i18n.__('Yes'), i18n.__('No')], message: String(i18n.__('There is an update available' ) + '(v' + remoteData.versions[iteration].version + '). ' + i18n.__('Do you want to install it now?'))},
		 updateDowngradeDialog = {type: 'info', buttons: [i18n.__('Yes'), i18n.__('No')], message: String(i18n.__('Please downgrade to version ') + remoteData.versions[iteration].version + '. ' + i18n.__('Do you want to install it now?'))};
		if (buildRecommended > APPBUILD && versionList.indexOf(buildRecommended) != -1) {
			// update available
			dialog.showMessageBox(updateAvailableDialog, updateResponse => {
				if (updateResponse == 0) {
					logging.log("UPDATE: User wants update.", appStates.enableLogging);
					if (remoteData.versions[iteration].altLink === undefined) {
						shell.openExternal(remoteData.linkBase);
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
		else if (buildRecommended == APPBUILD && versionList.indexOf(buildRecommended) != -1 && options.current == true) {
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
		else if (buildRecommended < APPBUILD && versionList.indexOf(buildRecommended) != -1) {
			// user must downgrade
			dialog.showMessageBox(updateDowngradeDialog, updateResponse => {
				if (updateResponse == 0) {
					logging.log("UPDATE: User wants to downgrade.", appStates.enableLogging);
					shell.openExternal(remoteData.linkBase);
				}
				else {
					return;
				}
			});

		}
		else {
			// if something goes wrong
			if (options.showErrors == true) {
				dialog.showMessageBox(updateErrorDialog, updateResponse => {
					logging.log("UPDATE: Error.", appStates.enableLogging);
					return;
				});
			}
		}
	});
}

function collectTelemetry() {
	// if the user agrees to it, collect non identifiable information about their setup
	var dataGathered = {};
	logging.log('TELE: Sending general data');
	dataGathered.TYPESEND = "general";
	dataGathered.DATESENT = moment().format('X');
	dataGathered.APPVERSION = APPVERSION;
	dataGathered.APPBUILD = APPBUILD;
	dataGathered.TYPE = os.type();
	dataGathered.PLATFORM = os.platform();
	dataGathered.RELEASE = os.release();
	dataGathered.CPUCORES = os.cpus().length;
	dataGathered.LOCALE = app.getLocale();
	dataGathered.BUILDMODE = BUILDMODEJSON.BUILDMODE;
	dataGathered.ISSERVICEENABLED = appStates.serviceEnabled;
	if (os.platform() == 'linux') dataGathered.LINUXPACKAGEFORMAT = LINUXPACKAGEFORMAT.linuxpackageformat;
	if (store.get('teleHistory') === undefined) {
	  store.set('teleHistory', [dataGathered]);
	}
	else {
	  var previous = store.get('teleHistory');
	  previous.push(dataGathered)
	  store.set('teleHistory', previous);
	}
	return JSON.stringify(dataGathered);
}

function sendTelemetry(source) {
	// send information to server
	var dataToSend = encode.encode(source,'base64');
	// make a post request to the database
	Request.post('http://142.93.48.189:3000/', {form:{tel_data:dataToSend}}, (err, response, body) => {
		if (response || body) {
		  logging.log('TELE: Sent.', appStates.enableLogging);
      if (store.get('teleID') === undefined) store.set('teleID', dataToSend.DATESENT);
		}
		if (err) {
			logging.log('TELE: Could not send.', appStates.enableLogging);
			return;
		}
		store.set('telemetryAllow', true);
		store.set('lastVersionToSendTelemetry', {APPBUILD: APPBUILD, APPVERSION: APPVERSION});
	});
}

function telemetryPrompt() {
  // ask if user wants to participate in telemetry collection
  var nothingSent = {type: 'info', buttons: [i18n.__('Return')], message: i18n.__("Nothing has been sent.")};
  var teleMsg = {type: 'info', buttons: [i18n.__('Yes, I will participate'), i18n.__('I want to see what will be sent'), i18n.__('No, thanks')], message: i18n.__("We want to improve this app, one way that we can achieve this is by collecting small non-identifiable pieces of information about the devices that our app runs on.\nAs a user you\'re able to help us out.--You can respond to help us out if you like.\n - Safe Surfer team")};
  dialog.showMessageBox(teleMsg, dialogResponse => {
    logging.log("TELE: User has agreed to the prompt.", appStates.enableLogging);
    // if user agrees to sending telemetry
    if (dialogResponse == 0) {
      sendTelemetry(collectTelemetry());
      store.set('telemetryHasAnswer', true);
      store.set('telemetryAllow', true);
    }
    // if user wants to see what will be sent
    else if (dialogResponse == 1) {
      var previewdataGathered = {type: 'info', buttons: [i18n.__('Send'), i18n.__("Don't send")], message: String(i18n.__("Here is what will be sent:")+"\n\n"+(collectTelemetry())+"\n\n"+i18n.__("In case you don't understand this data, it includes (such things as):\n - Which operating system you use\n - How many CPU cores you have\n - The language you have set \n - If the service is setup on your computer"))};
      dialog.showMessageBox(previewdataGathered, dialogResponse => {
        // if user agrees to sending telemetry
        if (dialogResponse == 0) {
          sendTelemetry(collectTelemetry());
          store.set('telemetryHasAnswer', true);
          store.set('telemetryAllow', true);
        }
				// if user doesn't agree to sending telemetry
        else if (dialogResponse == 1) {
          store.set('telemetryHasAnswer', true);
          dialog.showMessageBox(nothingSent, dialogResponse => {});
        }
      });
    }
		// if user doesn't want to participate
		else if (dialogResponse == 2) {
	    store.set('telemetryHasAnswer', true);
			dialog.showMessageBox(nothingSent, dialogResponse => {});
		}
	});
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
	 lifeguardMessage = {type: 'info', buttons: [i18n.__('Ok')], message: i18n.__("You can't toggle the service, since you're on a LifeGuard network.")},
	 continu;
	if (appStates.lifeguardFound == true) {
	  dialog.showMessageBox(lifeguardMessage, dialogResponse => {});
	}
	else {
		if (wantedState == appStates.serviceEnabled) {
		  dialog.showMessageBox(toggleWarning, dialogResponse => {
			  if (dialogResponse == 1) {
          switch(appStates.serviceEnabled) {
            case true:
              enableServicePerPlatform({forced: "force"});
              break;

            case false:
              disableServicePerPlatform({forced: "force"});
              break;
          }
			  }
		  });
	  }
	  else {
      switch(appStates.serviceEnabled) {
        case true:
          enableServicePerPlatform({forced: "force"});
          break;

        case false:
          disableServicePerPlatform({forced: "force"});
          break;
      }
	  }
	}
}

function showUnprivillegedMessage() {
	// display dialog for if the app hasn't been started with root privileges
	var dialogNotRunningAsAdmin = {type: 'info', buttons: [i18n.__('Show me how'), i18n.__('Exit')], message: i18n.__('To adjust network settings on your computer, you must run this app as an Administrator.')};
	logging.log("PRIV: User is not admin -- displaying dialog message.", appStates.enableLogging)
	dialog.showMessageBox(dialogNotRunningAsAdmin, updateResponse => {
		if (updateResponse == 1) window.close();
		if (updateResponse == 0) {
			shell.openExternal('https://community.safesurfer.co.nz/how-to-uac.php');
			setTimeout(function() {
				window.close();
			},250);
		}
	});
}

function checkUserPrivileges() {
	// keep note of which user the app is run as
	if (requireRoot == true) {
		switch(os.platform()) {
			// display dialog per platform
			/*case 'darwin':
				if (USERNAME != 'root') {
					userIsAdmin=true;
					showUnprivillegedMessage();
				}
				break;*/
			case 'win32':
				isAdmin().then(admin => {
					if (admin == false) appStates.userIsAdmin = false;
					else appStates.userIsAdmin = true;
				});
				break;
		}
	}
}

function sendAppStateNotifications() {
	// send notifications if the app state has changed to the user
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

function displayRebootMessage() {
  // tell the user to reboot
  if (appStates.serviceEnabled == true) var dialogRebootMessage = {type: 'info', buttons: [i18n.__('Ok')], message: i18n.__("Great, your computer is setup.\nTo make sure of this, we recommend that you please reboot/restart your computer.")}
  if (appStates.serviceEnabled == false) var dialogRebootMessage = {type: 'info', buttons: [i18n.__('Ok')], message: i18n.__("Ok, Safe Surfer has been removed.\nTo make sure of this, we recommend that you please reboot/restart your computer.")}
	dialog.showMessageBox(dialogRebootMessage, updateResponse => {});
}

function checkForVersionChange() {
  // if the version of the app has been updated, let the telemetry server know, if allowed by user
  var previousVersionData,
   dataGathered = {};
  if (store.get('telemetryAllow') == true) {
    previousVersionData = store.get('lastVersionToSendTelemetry');
    if (previousVersionData !== undefined && previousVersionData.APPBUILD < APPBUILD) {
      logging.log('TELE: Sending update data');
      dataGathered.TYPESEND = "update";
      dataGathered.APPBUILD;
      dataGathered.APPVERSION;
	    dataGathered.PLATFORM = os.platform();
	    dataGathered.ISSERVICEENABLED = appStates.serviceEnabled;
	    if (os.platform() == 'linux') dataGathered.LINUXPACKAGEFORMAT = LINUXPACKAGEFORMAT.linuxpackageformat;
      sendTelemetry(dataGathered);

	    var previous = store.get('teleHistory');
	    previous.push(dataGathered)
	    store.set('teleHistory', previous);
    }
    else logging.log('TELE: User has not reached new version.');
  }
}

function mainReloadProcess() {
	// reload function
	logging.log("MAIN: begin reload", appStates.enableLogging);
	internetConnectionCheck();
	checkServiceState();
	// if there is an internet connection
	if (appStates.internet == true) {
		hideNoInternetConnection();
		if (appStates.serviceEnabled != appStates.serviceEnabled_previous && appStates.serviceEnabled_previous !== undefined) {
			// if the state changes of the service being enabled changes
			logging.log('STATE: State has changed.', appStates.enableLogging);
			sendAppStateNotifications();
      appStates.serviceEnabled_previous = appStates.serviceEnabled;
      displayRebootMessage();
      appStates.notificationCounter = 0;
		}
	}
	else {
	  // if there is no internet
		displayNoInternetConnection();
	}
	// if the service is enabled, check if a lifeguard is on the network
	if (appStates.serviceEnabled == true) {
		checkIfOnLifeGuardNetwork();
	}
	else {
		appStates.lifeguardFound = false;
	}
	if (appStates.internet != appStates.internet_previous) {
		// if the state of the internet connection changes
		logging.log('NETWORK: State has changed.', appStates.enableLogging);
		appStates.internet_previous = appStates.internet;
	}
	if (appStates.lifeguardFound != appStates.lifeguardFound_previous) {
		// if the state of a lifeguard being on the network changes
		logging.log('LIFEGUARDSTATE: State has changed.', appStates.enableLogging);
		appStates.lifeguardFound_previous = appStates.lifeguardFound;
	}
	// if there are undefined states
	if (appStates.serviceEnabled_previous === undefined) appStates.serviceEnabled_previous = appStates.serviceEnabled;
	if (appStates.internet_previous === undefined) appStates.internet_previous = appStates.internet;
	if (appStates.lifeguardFound_previous === undefined) appStates.lifeguardFound_previous = appStates.lifeguardFound;
	// update the screen to show how the service state (... etc) is
	affirmServiceState();
	logging.log("MAIN: end reload", appStates.enableLogging);
	setTimeout(mainReloadProcess, 1000);
}

ipcRenderer.on('toggleAppUpdateAutoCheck', (event, arg) => {
	// if user changes the state of auto check for updates
	logging.log(String("UPDATES: Auto check state changed to " + !arg), appStates.enableLogging);
	if (arg == true) {
		store.set('appUpdateAutoCheck', false);
	}

	else if (arg == false) {
		store.set('appUpdateAutoCheck', true);
	}
});

ipcRenderer.on('betaCheck', (event, arg) => {
	// if user changes the state of auto check for updates
	logging.log(String("UPDATES: Beta state changed to " + !arg), appStates.enableLogging);
	if (arg == true) {
		store.set('betaCheck', false);
	}

	else if (arg == false) {
		store.set('betaCheck', true);
	}
});

ipcRenderer.on('checkIfUpdateAvailable', (event, arg) => {
	// when user wants to check for app update using button in menu bar
	checkForAppUpdate({
		current: true,
		showErrors: true
	});
});

ipcRenderer.on('goForceEnable', () => {
	// when activate button is pressed from menu bar
	forceToggleWarning({wantedState: true});
});

ipcRenderer.on('goForceDisable', () => {
	// when deactivate button is pressed from menu bar
	forceToggleWarning({wantedState: false});
});

ipcRenderer.on('goBuildToClipboard', () => {
	// when version information is pressed from menu bar
	versionInformationCopy();
});

ipcRenderer.on('openAboutMenu', () => {
  window.open(path.join(__dirname, 'assets', 'html', 'about.html'), 'About us');
});

ipcRenderer.on('viewTeleHistory', () => {
  window.open(path.join(__dirname, 'assets', 'html', 'tele.html'), 'View telemetry data');
});

ipcRenderer.on('toggleTeleState', () => {
  switch(store.get('telemetryAllow')) {
    case true:
      store.set('telemetryAllow', false)
      break;
    default:
      store.set('telemetryAllow', true)
      break;
  }
});

// keep note of if the user is running as admin or not
checkUserPrivileges();
checkForVersionChange();