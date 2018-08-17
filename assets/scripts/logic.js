// main.js - safesurfer
// by safesurfer

const CURRENTBUILD = 1;
const LINUXPACKAGEFORMAT = "rpm"
const os = require('os');
const child_process = require('child_process');
const dns = require('dns');
const rp = require('request-promise');
const cheerio = require('cheerio');
const path = require('path');
const hostOS = os.platform();
const bonjour = require('bonjour')();
const {dialog} = require('electron').remote
const Request = require("request");
const shell = require('electron').shell;
const {ipcRenderer} = require('electron')
const store = require('store')

const respOptions = {
  uri: `http://check.safesurfer.co.nz`,
  transform: function (body) {
    return cheerio.load(body);
  }
};

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
	  if (hasFoundLifeGuard == true) {
	  		document.getElementById('toggleButton').innerHTML = "PROTECTED WITH LIFEGUARD";
	  		$('.serviceToggle').addClass('serviceToggle_lifeguard')
	  }
	  else {
			document.getElementById('toggleButton').innerHTML = "STOP PROTECTION";
			$('.serviceToggle').removeClass('serviceToggle_lifeguard')
	  }
	  //enableServicePerPlatform();
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
	  document.getElementById('toggleButton').innerHTML = "GET PROTECTED";
	  //disableServicePerPlatform();
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
				alert('Your Life Guard is already protecting you.\nEnjoy your safety!')
				return 0;
			}
			else {
				alert('Safe Surfer needs your permission to make network changes.\nYou will get a prompt to allow Safe Surfer to perform the changes.')
			}
			disableServicePerPlatform();
			checkServiceState();
			if (affirmServiceState() == 3) {
			    new Notification('Safe Surfer', {
    				body: 'You are now safe to surf the internet. Safe Surfer has been setup.'
  	  		});
  	  }
		break;

		case false:
			if (ENABLELOGGING == true) console.log('Toggling disable');
			alert('Safe Surfer needs your permission to make network changes.\nYou will get a prompt to allow Safe Surfer to perform the changes.')
			enableServicePerPlatform();
			checkServiceState();
			if (affirmServiceState() == 3) {
			    new Notification('Safe Surfer', {
    				body: 'Safe Surfer has been disabled. You are now unprotected'
  	  		});
  	  }
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

		if (address == "104.197.143.234") {
			serviceEnabled = false;
			if (ENABLELOGGING == true) console.log('DNS Request: Service disabled');
		}

		else if (address == "130.211.44.88") {
			serviceEnabled = true;
			if (ENABLELOGGING == true) console.log('DNS Request: Service enabled');
			checkIfOnLifeGuardNetwork();
		}

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
	if (ENABLELOGGING == true) console.log(String('> Enabling on platform: ' + hostOS));
	switch(hostOS) {
		// linux
		case 'linux':
			var result = callProgram(String('pkexec ' + scriptRoot_linux + "/safesurfer-enable_dns_linux.sh"));
			/*if (result != "0" || result != "-1") {
			alert("Something went wrong!")
			}*/
			break;
		// macOS
		case 'darwin':
			//var result = callProgram(String('osascript -e "do shell script \'' + scriptRoot_macOS + '/safesurfer-enable_dns_macos.sh' + '\' with administrator privileges"'));
			var result = callProgram(String('bash ' + scriptRoot_macOS + '/safesurfer-enable_dns_macos.sh'))
			break;
			// windows
		case 'win32':
			//var result = callProgram(String('powershell.exe Start-Process ' + scriptRoot_windows + '\\safesurfer-enable_dns_windows.bat -Verb runAs'));
			var result = callProgram(String(scriptRoot_windows + '\\elevate.exe wscript ' + scriptRoot_windows +  '\\silent.vbs ' + scriptRoot_windows + '\\safesurfer-enable_dns_windows.bat'));
			break;
		// unsupported or unknown platform
		default:
			break;
	}
	return 0;
}

function disableServicePerPlatform() {
	// revoke the DNS server addresses from config
	if (ENABLELOGGING == true) console.log(String('> Disabling on platform: ' + hostOS));
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
	return 0;
}

function checkIfOnLifeGuardNetwork() {
	// check if current device is on lifeguard network
	if (ENABLELOGGING == true) console.log('Checking if on lifeguard network')
	var result;
	//var found = {};
	var count = 0;
	hasFoundLifeGuard = false;

	bonjour.find({ type: "sslifeguard" }, function(service) {
	  //if (service.fqdn in found) return
	  //found[service.fqdn] = true
	  count++
	  if (ENABLELOGGING == true) console.log(String(count + " :: " + service.fqdn))
	  if (service.fqdn.indexOf('_sslifeguard._tcp') != -1) {
		hasFoundLifeGuard=true;
		if (ENABLELOGGING == true) console.log(String('Found status: ' + hasFoundLifeGuard))
		return true;
	  }
	})
	if (ENABLELOGGING == true) console.log('hasFoundLifeGuard is', hasFoundLifeGuard)
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
	var serverAddress = "myserver"
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
		var updateAvailableDialog = {type: 'info', buttons: ['Yes', 'No'], message: String('There is an update available (v' + remoteData.versions[iteration].version + '). Do you want to install it?')}
		if (remoteData.recommendedBuild > CURRENTBUILD && versionList.indexOf(remoteData.recommendedBuild) != -1) {
			// update available

			dialog.showMessageBox(updateAvailableDialog, updateResponse => {
				if (updateResponse == 0) {
					if (ENABLELOGGING == true) console.log("UPDATE: User wants update.")
				}
				else {
					return;
				}
			})
			versionNew = remoteData.versions[iteration].version;
			switch(os.platform()) {
				case 'linux':
					if (ENABLELOGGING == true) console.log('UPDATE: Linux download...')
					shell.openExternal(baseLink + remoteData.linkBase + "/" + remoteData.name + "-" + remoteData.versions[iteration].version + "-" + remoteData.versions[iteration].build + "-linux." + LINUXPACKAGEFORMAT);
					break;
				case 'darwin':
					if (ENABLELOGGING == true) console.log('UPDATE: macOS download...')
					shell.openExternal(baseLink + remoteData.linkBase + "/" + remoteData.name + "-" + remoteData.versions[iteration].version + "-" + remoteData.versions[iteration].build + "-macos.dmg");
					break;
				case 'win32':
					if (ENABLELOGGING == true) console.log('UPDATE: Windows download...')
					shell.openExternal(baseLink + remoteData.linkBase + "/" + remoteData.name + "-" + remoteData.versions[iteration].version + "-" + remoteData.versions[iteration].build + "-windows.exe");
					break;
			}

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
			// downgrade to a lower version
			/*console.log("/---------------------------------------\\");
			console.log("| You must downgrade to a lower version |");
			console.log("\\---------------------------------------/");*/
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
