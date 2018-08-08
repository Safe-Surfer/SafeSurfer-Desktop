// main.js - safesurfer
// by safesurfer

const os = require('os');
const child_process = require('child_process');
const dns = require('dns');
const rp = require('request-promise');
const cheerio = require('cheerio');

const respOptions = {
  uri: `http://check.safesurfer.co.nz`,
  transform: function (body) {
    return cheerio.load(body);
  }
};

//const scriptRoot_linux = "/opt/safesurfer-desktop";
const scriptRoot_linux = process.cwd() + "/assets/osScripts";
const scriptRoot_macOS = "/Applications/SafeSurfer-Desktop.app/Contents/Resources/assets/osScripts";
//const scriptRoot_macOS = "/Users/caleb/Projects/SafeSurfers/safesurfer-desktop/assets/osScripts";
const scriptRoot_windows = process.cwd() + "\\assets\\osScripts";
//const scriptRoot_windows = "C:\\Users\\calebw\\Projects\\SafeSurfer\\safesurfer-desktop\\assets\\osScripts";

var serviceEnabled;
var stateInChanging;
var servicePreviousState;
var userInternetCheck;
var resp;
var ENABLELOGGING = false;
var APPHASLOADED = false;
var NETWORKCONNECTION;

if (ENABLELOGGING == true) console.log("Platform:", os.platform());

function displayProtection() {
	// enable DNS
	if (userInternetCheck == true) {
	  if (ENABLELOGGING == true) console.log("Protected");
	  $(".serviceActiveScreen").show();
	  $(".serviceInactiveScreen").hide();
	  document.getElementById('toggleButton').innerHTML = "STOP PROTECTION";
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
			alert('Safe Surfer needs your permission to make network changes.\nYou will get a prompt to allow Safe Surfer to perform the changes.')
			disableServicePerPlatform();
			checkServiceState();
			affirmServiceState();
			/*new Notification('Safe Surfer', {
    				body: 'You are now safe to surf the internet. Safe Surfer has been setup.'
  	  		});*/
		break;

		case false:
			if (ENABLELOGGING == true) console.log('Toggling disable');
			alert('Safe Surfer needs your permission to make network changes.\nYou will get a prompt to allow Safe Surfer to perform the changes.')
			enableServicePerPlatform();
			checkServiceState();
			affirmServiceState();
			/*new Notification('Safe Surfer', {
    				body: 'Safe Surfer has been disabled. You are now unprotected'
  	  		});*/
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
			break;

		case true:
			if (ENABLELOGGING == true) console.log('Affirming enable');
			displayProtection();
			break;
	}
}

function checkServiceState() {
	// check the state of the service
	if (ENABLELOGGING == true) console.log('Getting state of service');
  //resp = rp(respOptions)
  //if (resp.response.body.indexOf('<meta name="ss_status" content="unprotected"><!-- DO NOTE REMOVE - USED FOR STATUS CHECK -->') > -1) {
	dns.lookup('check.safesurfer.co.nz', function(err, address) {
		if (ENABLELOGGING == true) console.log(address);
		if (address == "104.197.143.234") {
			serviceEnabled = false;
			if (ENABLELOGGING == true) console.log('DNS Request: Service disabled');
		}

		else if (address == "130.211.44.88") {
			serviceEnabled = true;
			if (ENABLELOGGING == true) console.log('DNS Request: Service enabled');
		}

		else {
		  // check internet connection
			if (userInternetCheck == true) {
            serviceEnabled = false;
            if (ENABLELOGGING == true) console.log('DNS Request: Unsure of state');
      			}
			else {
				    NETWORKCONNECTION = false;
				    if (ENABLELOGGING == true) console.log('Network: Internet connection unavailable');
				    $('.appNoInternetConnectionScreen').show();
				    $('.appNoInternetConnectionScreen').parent().css('z-index', 58);
				    $('.serviceActiveScreen').hide();
				    $('.serviceInactiveScreen').hide();
				    $('.serviceToggle').hide();

			}
	  	}
		$('.serviceToggle').show();
		$('.appNoInternetConnectionScreen').hide();
		$('.appNoInternetConnectionScreen').parent().css('z-index', 2);
		APPHASLOADED = true;
  	});
}

function callProgram(command) {
	// call a child process
	//return child_process.execSync(command).toString().trim();

	/*var child = child_process.exec(command, function (error, stdout, stderr) {
	if(error) console.log(error);
	if(stderr) console.log(stderr);
	console.log("Return of '" + command + "': " + stdout)
	return stdout;
	});*/
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
	hostOS = os.platform();
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
			var result = callProgram(string('bash ' + scriptRoot_macOS + '/safesurfer-enable_dns_macos.sh'))
			break;
			// windows
		case 'win32':
			//var result = callProgram(String('powershell.exe Start-Process ' + scriptRoot_windows + '\\safesurfer-enable_dns_windows.bat -Verb runAs'));
			var result = callProgram(scriptRoot_windows + '\\elevate.exe wscript ' + scriptRoot_windows +  '\\silent.vbs ' + scriptRoot_windows + '\\safesurfer-enable_dns_windows.bat');
			break;
		// unsupported or unknown platform
		default:
			break;
	}
	return 0;
}

function disableServicePerPlatform() {
	// revoke the DNS server addresses from config
	hostOS = os.platform();
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
			  var result = callProgram(string('bash ' + scriptRoot_macOS + '/safesurfer-disable_dns_macos.sh'))
			break;
		// windows
		case 'win32':
			//var result = callProgram(String('powershell.exe Start-Process ' + scriptRoot_windows + '\\safesurfer-disable_dns_windows.bat -Verb runAs'));
			var result = callProgram(scriptRoot_windows + '\\elevate.exe wscript ' + scriptRoot_windows +  '\\silent.vbs ' + scriptRoot_windows + '\\safesurfer-disable_dns_windows.bat');
			break;
		// unsupported or unknown platform
		default:

		break;
	}
	return 0;
}

function internetConnectionCheck() {
  // check the user's internet connection
  dns.lookup('8.8.8.8', function(err) {
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
		if (serviceEnabled != servicePreviousState) affirmServiceState();
		servicePreviousState = serviceEnabled;
	}

	if (ENABLELOGGING == true) console.log("__ Refresh End   __")
	setTimeout(mainReloadProcess, 500);
}

if (ENABLELOGGING == true) console.log(callProgram('pwd'));
