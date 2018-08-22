// main.js - safesurfer
// by safesurfer

// include libraries
const APPVERSION = "1.0.0"
const CURRENTBUILD = 1;
const LINUXPACKAGEFORMAT = require('./buildconfig.json');
const os = require('os');
const child_process = require('child_process');
const dns = require('dns');
const cheerio = require('cheerio');
const bonjour = require('bonjour')();
const {dialog} = require('electron').remote;
const Request = require("request");
const shell = require('electron').shell;
const {ipcRenderer} = require('electron');
const store = require('store');
const encode = require('nodejs-base64-encode');
const moment = require('moment');
const dns_changer = require('node_dns_changer');

const respOptions = {
  uri: `http://check.safesurfer.co.nz`,
  transform: function (body) {
    return cheerio.load(body);
  }
};

const hostOS = os.platform();
switch (hostOS) {
	case 'win32':
		process.chdir('./assets/osScripts')
}

//var scriptRoot_linux = "/opt/SafeSurfer-Desktop/assets/osScripts";
var scriptRoot_linux = process.cwd() + "/assets/osScripts";
var scriptRoot_macOS = "/Applications/SafeSurfer-Desktop.app/Contents/Resources/assets/osScripts";
//var scriptRoot_macOS = "/Users/caleb/Projects/SafeSurfers/safesurfer-desktop/assets/osScripts";
var scriptRoot_windows = process.cwd();
//var scriptRoot_windows = "C:\\Users\\calebw\\Projects\\SafeSurfer\\safesurfer-desktop\\assets\\osScripts";

var serviceEnabled;
var stateInChanging;
var servicePreviousState;
var userInternetCheck;
var previousUserInternetCheck;
var resp;
var hasFoundLifeGuard;
var remoteData;
var ENABLELOGGING = false;
var APPHASLOADED = false;

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
	  }
	  else {
	  	$("#bigTextProtected").html("YOU ARE PROTECTED");
	  	$("#toggleButton").html("STOP PROTECTION");
		$('.serviceToggle').removeClass('serviceToggle_lifeguard')
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
				//alert('Your Life Guard is already protecting you.\nEnjoy your safety!\n\nTo enable reguardless, go to \'General -> Force enable\' in the app menu.')
				shell.openExternal('http://mydevice.safesurfer.co.nz/')
				return 0;
			}
			else {
				//alert('Safe Surfer needs your permission to make network changes.\nYou will get a prompt to allow Safe Surfer to perform the changes.')
				disableServicePerPlatform();
				checkServiceState();
			}

			/*if (affirmServiceState() == 0) {
				new Notification('Safe Surfer', {
    					body: 'You are now safe to surf the internet. Safe Surfer has been setup.'
  	  			});
  	  		}*/
		break;

		case false:
			if (ENABLELOGGING == true) console.log('Toggling disable');
			//alert('Safe Surfer needs your permission to make network changes.\nYou will get a prompt to allow Safe Surfer to perform the changes.')
			enableServicePerPlatform();
			checkServiceState();
			/*if (affirmServiceState() == 0) {
				new Notification('Safe Surfer', {
    					body: 'Safe Surfer has been disabled. You are now unprotected'
  	  			});
  	  		}*/
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
	dns.lookup('check.safesurfer.co.nz', function(err, address) {
		if (ENABLELOGGING == true) console.log("checkServiceState - address ::", address);
		if (ENABLELOGGING == true) console.log("checkServiceState - err     ::", err);
		// ip address returned when service is disabled
		if (address == "104.197.143.234") {
			serviceEnabled = false;
			if (ENABLELOGGING == true) console.log('DNS Request: Service disabled');
		}
		// ip address returned when service is enabled
		else if (address == "130.211.44.88") {
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
			if (err !== undefined) {
				if (ENABLELOGGING == true) console.log('Network: Internet connection unavailable');
				$('.appNoInternetConnectionScreen').show();
				$('.appNoInternetConnectionScreen').parent().css('z-index', 58);
				$('.bigText_nointernet').show();
				$('.serviceActiveScreen').hide();
				$('.serviceInactiveScreen').hide();
				$('.serviceToggle').hide();
			}
	  	}
	  	if (err === undefined) {
			$('.serviceToggle').show();
			$('.appNoInternetConnectionScreen').hide();
			$('.appNoInternetConnectionScreen').parent().css('z-index', 2);

		}
		APPHASLOADED = true;
  	});
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
		// Node.js will invoke this callback when the
		if (ENABLELOGGING == true) console.log(stdout);
		return stdout;
	});
}

function enableServicePerPlatform() {
	// force the DNS server addresses to config
	/*if (ENABLELOGGING == true) console.log(String('> Enabling on platform: ' + hostOS));
	switch(hostOS) {
		// linux
		case 'linux':
			var result = callProgram(String('pkexec ' + scriptRoot_linux + "/safesurfer-enable_dns_linux.sh"));
			break;
		// macOS
		case 'darwin':
			var result = callProgram(String('bash ' + scriptRoot_macOS + '/safesurfer-enable_dns_macos.sh'))
			break;
		// windows
		case 'win32':
			var result = callProgram(String(scriptRoot_windows + '\\elevate.exe wscript ' + scriptRoot_windows +  '\\silent.vbs ' + scriptRoot_windows + '\\safesurfer-enable_dns_windows.bat'));
			break;
		// unsupported or unknown platform
		default:
			break;
	}
	return 0;*/
	dns_changer.setDNSservers({
	    DNSservers:['104.197.28.121','104.155.237.225'],
	    DNSbackupName:'before_safesurfer',
	    loggingEnable:ENABLELOGGING
	});

}

function disableServicePerPlatform() {
	// revoke the DNS server addresses from config
	/*if (ENABLELOGGING == true) console.log(String('> Disabling on platform: ' + hostOS));
	switch(hostOS) {
		// linux
		case 'linux':
			var result = callProgram(String('pkexec ' + scriptRoot_linux + "/safesurfer-disable_dns_linux.sh"));
			break;
		// macOS
		case 'darwin':
			//var result = callProgram(String('osascript -e "do shell script "' + scriptRoot_macOS + '/safesurfer-disable_dns_macos.sh\' with prompt "Safe Surfer need your permission to change settings." with administrator privileges"'));
				//var result = callProgram(String('osascript -e "do shell script \'' + scriptRoot_macOS + '/safesurfer-disable_dns_macos.sh' + '\' with administrator privileges"'));
			  var result = callProgram(String('bash ' + scriptRoot_macOS + '/safesurfer-disable_dns_macos.sh'))
			break;
		// windows
		case 'win32':
			//var result = callProgram(String('powershell.exe Start-Process ' + scriptRoot_windows + '\\safesurfer-disable_dns_windows.bat -Verb runAs'));
			var result = callProgram(String(scriptRoot_windows + '\\elevate.exe wscript ' + scriptRoot_windows +  '\\silent.vbs ' + scriptRoot_windows + '\\safesurfer-disable_dns_windows.bat'));
			break;
		// unsupported or unknown platform
		default:

		break;
	}
	return 0;*/
	dns_changer.restoreDNSservers({
	    DNSbackupName:'before_safesurfer',
	    loggingEnable:ENABLELOGGING
	});

}

function checkIfOnLifeGuardNetwork() {
	// check if current device is on lifeguard network
	if (ENABLELOGGING == true) console.log('Checking if on lifeguard network')
	var result;
	var count = 0;
	hasFoundLifeGuard = false;
	// start searching for lifeguard with bonjour
	bonjour.find({ type: "sslifeguard" }, function(service) {
	  count++
	  if (ENABLELOGGING == true) console.log(String(count + " :: " + service.fqdn))
	  if (service.fqdn.indexOf('_sslifeguard._tcp') != -1) {
		hasFoundLifeGuard=true;
		if (ENABLELOGGING == true) console.log(String('Found status: ' + hasFoundLifeGuard))
		affirmServiceState();
		return true;
	  }
	})
	if (ENABLELOGGING == true) console.log('hasFoundLifeGuard is', hasFoundLifeGuard)
}

function publishDesktopAppOnNetwork(state) {
	// bonjour public to network for device discovery
	if (state == "enable") bonjour.publish({ name: 'Safe Surfer Desktop', type: 'ssdesktop', port: 3158 })
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
	var baseLink;
	var versionList = [];
	var versionNew;
	var serverAddress = "104.236.242.185"
	var serverPort = 8080
	var serverDataFile = "/version-information.json"

	var updateCurrentDialog = {type: 'info', buttons: ['Ok'], message: String('You\'re up to date.')}
	var updateErrorDialog = {type: 'info', buttons: ['Ok'], message: String('Whoops, I couldn\'t find updates... Something seems to have gone wrong.')}

	Request.get(String("http://" + serverAddress + ":" + serverPort + serverDataFile), (error, response, body) => {
		if(error) {
			// if something goes wrong
			if (options.showErrors == true) {
				dialog.showMessageBox(updateErrorDialog, updateResponse => {
					if (ENABLELOGGING == true) console.log("UPDATE: Error with updates.")
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
		var updateAvailableDialog = {type: 'info', buttons: ['Yes', 'No'], message: String('There is an update available (v' + remoteData.versions[iteration].version + '). Do you want to install it now?')}
		var updateDowngradeDialog = {type: 'info', buttons: ['Yes', 'No'], message: String('Please downgrade to version ' + remoteData.versions[iteration].version + '. Do you want to install it now?')}
		if (remoteData.recommendedBuild > CURRENTBUILD && versionList.indexOf(remoteData.recommendedBuild) != -1) {
			// update available

			dialog.showMessageBox(updateAvailableDialog, updateResponse => {
				if (updateResponse == 0) {
					if (ENABLELOGGING == true) console.log("UPDATE: User wants update.")
					versionNew = remoteData.versions[iteration].version;
					shell.openExternal('https://safesurfer.co.nz/download/desktop');
				}
				else {
					return;
				}
			});

		}
		else if (remoteData.recommendedBuild == CURRENTBUILD && versionList.indexOf(remoteData.recommendedBuild) != -1 && options.current == true) {
			// up to date
			dialog.showMessageBox(updateCurrentDialog, updateResponse => {
				if (updateResponse == 0) {
					if (ENABLELOGGING == true) console.log("UPDATE: User has the latest version installed.")
					return;
				}
				else {
					return;
				}
			})
		}
		else if (remoteData.recommendedBuild < CURRENTBUILD && versionList.indexOf(remoteData.recommendedBuild) != -1) {
			// user must downgrade
			dialog.showMessageBox(updateDowngradeDialog, updateResponse => {
				if (updateResponse == 0) {
					if (ENABLELOGGING == true) console.log("UPDATE: User wants to downgrade.")
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
					if (ENABLELOGGING == true) console.log("UPDATE: Error.")
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
	if (os.platform() != 'win32') teleData.LINUXPACKAGEFORMAT = LINUXPACKAGEFORMAT;
	return JSON.stringify(teleData);
}

function sendTelemetry() {
	// send information to server
	var dataToSend = encode.encode(collectTelemetry(),'base64');
	Request.post('http://104.236.242.185:3000/', {form:{tel_data:dataToSend}}, (err, response, body) => {
		if (response || body) console.log('TEL SEND: Sent.');
		if (err) {
			console.log('TEL SEND: Cannot send.');
			return;
		}
	});
	//return dataToSend;
}

function mainReloadProcess() {
	// reload function
	if (ENABLELOGGING == true) console.log("__ Refresh Start __")
	if (APPHASLOADED == false) {
	  if (ENABLELOGGING == true) console.log("STATE: App not loaded")
		internetConnectionCheck();
		setTimeout(function(){
			checkServiceState();
		}, 750);
	}

	else {
		finishedLoading();
		internetConnectionCheck();
		checkServiceState();
		if (userInternetCheck == true) {
			if (serviceEnabled != servicePreviousState) {
				if (ENABLELOGGING == true) console.log('SERVICE STATE: State has changed.')
				affirmServiceState();
			}
			servicePreviousState = serviceEnabled;
		}
		if (userInternetCheck != previousUserInternetCheck) {
			if (ENABLELOGGING == true) console.log('INTERNET: State has changed.')
			affirmServiceState();
  			previousUserInternetCheck = userInternetCheck;
		}
	}

	if (ENABLELOGGING == true) console.log("__ Refresh End   __")
	setTimeout(mainReloadProcess, 1000);
}

ipcRenderer.on('toggleAppUpdateAutoCheck', (event, arg) => {
	if (arg == true) {
		store.set('appUpdateAutoCheck', false);
	}

	else if (arg == false) {
		store.set('appUpdateAutoCheck', true);
	}
})

ipcRenderer.on('checkIfUpdateAvailable', (event, arg) => {
	checkForAppUpdate({
		current: true,
		showErrors: true
	});
});
ipcRenderer.on('goForceEnable', () => {
	enableServicePerPlatform();
});
