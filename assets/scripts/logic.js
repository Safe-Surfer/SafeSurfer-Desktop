// SafeSurfer-Desktop - logic.js

//
// Copyright (C) 2018 Caleb Woodbine <info@safesurfer.co.nz>
//
// This file is part of SafeSurfer-Desktop.
//
// SafeSurfer-Desktop is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SafeSurfer-Desktop is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with SafeSurfer-Desktop.  If not, see <https://www.gnu.org/licenses/>.
//

// include libraries
const {dialog} = global.desktop.logic.dialogBox(),
  electron = require('electron'),
  ipcRenderer = electron.ipcRenderer,
  app = electron.app ? electron.app : electron.remote.app,
  packageJSON = window.desktop.global.packageJSON(),
  APPBUILD = parseInt(packageJSON.APPBUILD),
  APPVERSION = packageJSON.version,
  BUILDMODE = packageJSON.appOptions.BUILDMODE,
  isBeta = packageJSON.appOptions.isBeta,
  updatesEnabled = process.env.SAFESURFER_APPUPDATES !== undefined ? JSON.parse(process.env.SAFESURFER_APPUPDATES) : packageJSON.appOptions.enableUpdates,
  enableNotifications = packageJSON.appOptions.enableNotifications,
  os = require('os'),
  path = require('path'),
  bonjour = global.desktop.logic.bonjour,
  Request = global.desktop.logic.request(),
  $ = require('jquery'),
  store = global.desktop.global.store(),
  i18n = global.desktop.global.i18n(),
  logging = global.desktop.global.logging(),
  LINUXPACKAGEFORMAT = global.desktop.global.linuxpackageformat === undefined ? undefined : global.desktop.global.linuxpackageformat;

// an object to keep track of multiple things
window.appStates = {
  serviceEnabled: [undefined, undefined,],
  internet: [undefined, undefined,],
  internetCheckCounter: 0,
  lifeguardFound: [undefined, undefined,],
  lifeguardOnNetworkLock: false,
  appHasLoaded: false,
  enableLogging: packageJSON.appOptions.enableLogging,
  notificationCounter: 0,
  userIsAdmin: undefined,
  progressBarCounter: 0,
  elevationFailureCount: 0,
  elevateWindows_unable: false,
  toggleLock: false,
  macOSuseDHCP: true,
  guiSudo: "pkexec",
  binFolder: process.env.SSCLILOCATION === undefined ? `${path.resolve(path.dirname(process.argv[0]), '..', '..', 'bin')}/` : process.env.SSCLILOCATION
}

logging(`INFO: platform  - ${os.platform()}`);
logging(`INFO: cwd       - ${process.cwd()}`);

window.actions = Object.freeze({
  buttons: {
    unlock: function() {
      store.set('lockDeactivateButtons', false);
      logging('[unlockButton]: button has been unlocked');
    },

    lock: function() {
      store.set('lockDeactivateButtons', true);
      logging('[unlockButton]: button has been locked');
    }
  },

  logging: {
    enable: function() {
      window.appStates.enableLogging = true;
    },

    disable: function() {
      window.appStates.enableLogging = false;
    }
  },

  stats: {
    clear: function() {
      store.delete('statHistory');
      console.log("Stats have been emptied locally");
    },

    uncompleted: function() {
      store.set('statHasAnswer', false);
      console.log("Stats will be prompted again");
    }
  },

  config: {
    macOS: {
      dhcp: function() {
        appStates.macOSuseDHCP = !appStates.macOSuseDHCP;
      }
    }
  },

  diagnostics: {
    generate: function() {
      // bundle together a bunch of information that will be of use to diagnosing issues
      var info = {
        appBuild: APPBUILD,
        appStates: appStates,
        appVersion: APPVERSION,
        buildMode: BUILDMODE,
        date: global.desktop.logic.moment().format('X'),
        electronVersion: process.versions.electron,
        node_dns_changerVersion: window.desktop.logic.node_dns_changer.version(),
        os: os.platform(),
        processEnv: process.env,
        userLocale: app.getLocale(),
        storedInformation: store.store
      }
      if (os.platform() === 'linux') {
        info.linuxPackageFormat = LINUXPACKAGEFORMAT;
      }
      // encode with base64, so it make it easier to send (as it's just a huge block of data)
      return global.desktop.logic.base64Encode().encode(JSON.stringify(info),'base64');
    },
    decode: function(info) {
      return JSON.parse(global.desktop.logic.base64Encode().decode(info,'base64'));
    }
  },

  flushdnscache: function() {
    // flush the DNS cache per OS
    appFrame.flushDNScache();
  },

  updatemenu: function() {
    ipcRenderer.send('updateAppMenu', true);
  },

  status: function() {
    // display human readable information
    var text = `${i18n.__("Status")}

    - ${i18n.__("Safe Surfer desktop version:")} ${APPVERSION}
    - ${i18n.__("Safe Surfer desktop build:")} ${APPBUILD}
    - ${i18n.__("node_dns_changer version:")} ${window.desktop.logic.node_dns_changer.version()}
    ---------------------------------------------
    - ${i18n.__("Operating system:")} ${os.platform()}
    - ${i18n.__("Locale:")} ${app.getLocale()}
    ---------------------------------------------
    - ${i18n.__("The service is enabled:")} ${appStates.serviceEnabled[0] === true ? i18n.__('Yes') : i18n.__('No')}
    - ${i18n.__("LifeGuard discovered on network:")} ${appStates.lifeguardFound[0] === true ? i18n.__('Yes') : i18n.__('No')}
    - ${i18n.__("Internet is available:")} ${appStates.internet[0] === true ? i18n.__('Yes') : i18n.__('No')}
    - ${i18n.__("The app has loaded:")} ${appStates.appHasLoaded === true ? i18n.__('Yes') : i18n.__('No')}
    - ${i18n.__("The buttons are locked:")} ${store.get('lockDeactivateButtons') === true ? i18n.__('Yes') : i18n.__('No')}
    - ${i18n.__("Opted into beta releases:")} ${store.get('betaCheck') === true ? i18n.__('Yes') : i18n.__('No')}
    - ${i18n.__("Statistics enabled:")} ${store.get('statisticAllow') === true ? i18n.__('Yes') : i18n.__('No')}`
    if (os.platform() === 'win32') text += `\n    - ${i18n.__("Your version of Windows is compatible:")} ${window.appStates.windowsVersionCompatible === true ? i18n.__('Yes') : i18n.__('No')}`
    return text;
  }
});

// print some useful commands
window.help = `Help menu
----------
Here are a list of commands which may be of use.
The commands are run the same way you type 'help'.

View statuses
  actions.status()

Toggle logging
  actions.logging.enable()
  actions.logging.disable()

Toggle button lock
  actions.buttons.unlock()
  actions.buttons.lock()

Delete cached stats
  actions.stats.clear()

Flush DNS cache manually
  actions.flushdnscache()


If this is not the help that you require, please consider contacting our support
  http://www.safesurfer.co.nz/contact`;

// functions
const appFrame = {
  callProgram: async function(command) {
    // call a child process
    return new Promise((resolve, reject) => {
      logging(`[callProgram]: calling - ${command}`);
      // command will be executed as: comand [ARGS]
      require('child_process').exec(command, (err, stdout, stderr) => {
        logging(`[callProgram]: output -\n${stdout}\n`);
        if (err || stderr) {
          logging(`[callProgram]: output error - ${err} - ${stderr}\n`);
          resolve(false);
        }
        if (!err && !stderr) resolve(true);
      });
    });
  },

  exec: function(command) {
    // a standard platform based exec function
    return new Promise((resolve, reject) => {
      switch (os.platform()) {
        case 'linux':
          appFrame.callProgram(`${appStates.guiSudo} ${command}`).then(response => {
            resolve(response);
          });
          break;

        default:
          appFrame.callProgram(command).then(response => {
            resolve(response);
          });
          break;
      }
    });
  },

  elevateWindows: function() {
    // call a child process
    appFrame.exec(`powershell Start-Process '${process.argv0}' -ArgumentList '.' -Verb runAs`).then((response) => {
      logging(`[elevateWindows]: response was '${response}'.`);
      if (response == true) window.close();
    });
  },

  checkUserPrivileges: function() {
    // keep note of which user the app is run as
    if (os.platform() != 'win32') {
      window.appStates.userIsAdmin = true;
      return
    }
    global.desktop.logic.isAdmin().then(admin => {
      window.appStates.userIsAdmin = admin;
      if (admin == false) appFrame.elevateWindows();
    });
  },

  flushDNScache: function() {
    // flush the DNS cache per OS
    var flushedMessage = function() {
      dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok')], message: i18n.__('The DNS cache has been flushed.')})
    }

    switch (os.platform()) {
      case 'linux':
        appFrame.exec(`${appStates.binFolder}sscli flush`).then(response => {
          if (response === true) flushedMessage();
        });
        break;

      case 'darwin':
        appFrame.exec("osascript -e 'do shell script \"killall -HUP mDNSResponder; killall mDNSResponderHelper; dscacheutil -flushcache\" with prompt \"Reboot to apply settings\\n\" with administrator privileges'").then(response => {
          if (response === true) flushedMessage();
        });
        break;

      case 'win32':
        appFrame.exec('ipconfig /flushdns').then(response => {
          if (response === true) flushedMessage();
        });
        break;
    }
  },

  displayProtection: function() {
    // show the user that the service has been enabled
    if (window.appStates.internet[0] == true) {
      logging("[displayProtection]: service state is protected");
      $(".serviceActiveScreen").show();
      $(".serviceInactiveScreen").hide();
      // if buttons have been locked
      $('#subTextProtected').html(i18n.__('YOU ARE SAFE TO SURF THE INTERNET').toUpperCase());
      if (store.get('lockDeactivateButtons') == true) {
        $("#bigTextProtected").html(i18n.__("YOU ARE PROTECTED").toUpperCase());
        $("#toggleButton").html(i18n.__("LOCKED").toUpperCase());
        $('.serviceToggle').addClass('serviceToggle_locked');
        $('.topTextBox_active').removeClass('topTextBox_active_lifeguard');
        $('.serviceToggle').removeClass('serviceToggle_lifeguard');
      }
      // if a lifeguard has been found
      else if (window.appStates.lifeguardFound[0] == true) {
        $("#bigTextProtected").html(i18n.__("PROTECTED BY LIFEGUARD").toUpperCase());
        $("#toggleButton").html(i18n.__("CONFIGURE LIFEGUARD").toUpperCase());
        $('.serviceToggle').addClass('serviceToggle_lifeguard');
        $('.topTextBox_active').addClass('topTextBox_active_lifeguard');
        $('.serviceToggle').removeClass('serviceToggle_locked');
      }
      else {
        // if lifeguard is not found
        $("#bigTextProtected").html(i18n.__("YOU ARE PROTECTED").toUpperCase());
        $("#toggleButton").html(i18n.__("STOP PROTECTION").toUpperCase());
        $('.serviceToggle').removeClass('serviceToggle_lifeguard');
        $('.serviceToggle').removeClass('serviceToggle_locked');
        $('.topTextBox_active').removeClass('topTextBox_active_lifeguard');
      }
      // make sure that button is persistent
      $('.serviceToggle').show();
      $('.appNoInternetConnectionScreen').hide();
      $('.appNoInternetConnectionScreen').parent().css('z-index', 2);
    }
    else if (store.get('lockDeactivateButtons') == true) {
      $("#bigTextProtected").html(i18n.__("YOU ARE PROTECTED").toUpperCase());
      $("#toggleButton").html(i18n.__("LOCKED").toUpperCase());
      $('.serviceToggle').addClass('serviceToggle_locked');
    }
  },

  displayUnprotection: function() {
    // show the user that the service has been enabled
    if (window.appStates.internet[0] == true) {
      logging("[displayUnprotection]: service state is unprotected");
      $(".serviceInactiveScreen").show();
      $(".serviceActiveScreen").hide();
      $('#bigTextUnprotected').text(i18n.__('DANGER AHEAD').toUpperCase());
      $("#toggleButton").html(i18n.__("GET PROTECTED").toUpperCase());
      $('#subTextUnprotected').text(i18n.__('YOU ARE NOT PROTECTED IN THE ONLINE SURF').toUpperCase());
      $('.serviceToggle').show();
      $('.appNoInternetConnectionScreen').hide();
      $('.appNoInternetConnectionScreen').parent().css('z-index', 2);
    }
  },

  displayNoInternetConnection: function() {
    // show the user that they don't have an internet connection
    $('#bigTextNoInternet').text(i18n.__("IT APPEARS THAT YOU'VE LOST YOUR INTERNET CONNECTION.").toUpperCase());
    $('.appNoInternetConnectionScreen').show();
    $('.appNoInternetConnectionScreen').parent().css('z-index', 58);
    $('.bigText_nointernet').show();
    $('.serviceActiveScreen').hide();
    $('.serviceInactiveScreen').hide();
    $('.serviceToggle').hide();
  },

  hideNoInternetConnection: function() {
    // hide the internet connection loss screen
    $('.serviceToggle').show();
    $('.appNoInternetConnectionScreen').hide();
    $('.appNoInternetConnectionScreen').parent().css('z-index', 2);
  },

  toggleServiceState: function() {
    // switch between states
    logging("[toggleServiceState]: In switch");
    window.appStates.notificationCounter = 0;
    if (window.appStates.toggleLock === true) return;
    switch (window.appStates.serviceEnabled[0]) {
      // if service is enabled
      case true:
        logging('[toggleServiceState]: trying toggle disable');
        if (window.appStates.lifeguardFound[0] == true) window.open('http://mydevice.safesurfer.co.nz', 'Safe Surfer - Lifeguard');
        else {
          if (store.get('lockDeactivateButtons') != true) appFrame.displayDisableWarning();
          else appFrame.lockAlertMessage();
        }
        break;

      // if service is disabled
      case false:
        logging('[toggleServiceState]: trying toggle enable');
        appFrame.enableServicePerPlatform({});
        break;

      default:
        dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok')], message: i18n.__("The state of the service is being determined. Please wait.")});
        break;
    }
  },

  displayDisableWarning: function() {
    // make sure the user really wants to disable the service
    dialog.showMessageBox({type: 'info', buttons: [i18n.__('No'), i18n.__('Yes')], message: i18n.__("Are you sure that you want to disable Safe Surfer on this computer?")}, response => {
      if (response == 1) appFrame.disableServicePerPlatform({});
    });
  },

  affirmServiceState: function() {
    // affirm the state of the service
    logging("[affirmServiceState]: Affirming the state");
    switch (window.appStates.serviceEnabled[0]) {
      case false:
        logging('[affirmServiceState]: trying affirm disable');
        appFrame.displayUnprotection();
        return;
        break;

      case true:
        logging('[affirmServiceState]: trying affirm enable');
        appFrame.displayProtection();
        return;
        break;
    }
  },

  checkServiceState: function() {
    // check the state of the service
    logging('[checkServiceState]: Getting state of service');
    Request.get('http://check.safesurfer.co.nz', (error, response, body) => {
      // since the request has succeeded, we can count the app as loaded
      window.appStates.appHasLoaded = true;
      if ((error < 200 || error >= 300) && error != null) {
        logging(`[checkServiceState]: HTTP error: ${error}`);
        return;
      }
      //else window.appStates.internet[0] = true;

      var metaResponse = global.desktop.logic.letsGetMeta(body),
        metaSearchProtected = body.search('<meta name="ss_status" content="protected">'),
        metaSearchUnprotected = body.search('<meta name="ss_status" content="unprotected">');

      logging(`[checkServiceState]: metaResponse.ss_status :: ${metaResponse.ss_status}`);
      if (metaSearchUnprotected != -1 || metaResponse.ss_state == 'unprotected') {
        window.appStates.serviceEnabled[0] = false;
        logging('[checkServiceState]: Get Request - Service disabled');
      }
      // if the meta tag returns protected
      else if (metaSearchProtected != -1 || metaResponse.ss_status == 'protected') {
        window.appStates.serviceEnabled[0] = true;
        logging('[checkServiceState]: Get Request - Service enabled');
      }
      // if neither are returned
      else if (metaResponse.ss_status !== 'protected' && metaResponse.ss_status !== 'unprotected' ) {
        logging("[checkServiceState]: Get Request - Can't see protection state from meta tag");
        // check internet connection
        if (window.appStates.internet[0] == true) {
          logging('[checkServiceState]: Get Request - Unsure of state');
        }
        else if (error !== undefined || window.appStates.internet[0] != true) logging('[checkServiceState]: NETWORK - Internet connection unavailable');
      }
    });
  },

  resetToggling: function() {
    $('#progressBar').css("height", "0px");
    window.appStates.progressBarCounter = 0;
    window.appStates.notificationCounter = 0;
    $('.progressInfoBar').css("height", "0px");
    window.appStates.toggleLock = false;
  },

  enableServicePerPlatform: function({forced = false, alerts = true}) {
    // apply DNS settings
    $('#progressBar').css("height", "20px");
    $(".progressInfoBar_text").html(i18n.__("Please wait while the service is being enabled"));
    $('.progressInfoBar').css("height", "30px");
    if (enableNotifications == true && window.appStates.notificationCounter == 0) new Notification('Safe Surfer', {
      body: i18n.__('Woohoo! Getting your computer setup now.'),
      icon: path.join(__dirname, "..", "media", "icons", "win", "icon.ico")
    });
    window.appStates.notificationCounter += 1;
    window.appStates.toggleLock = true;
    switch (os.platform()) {
      case 'linux':
        appFrame.exec(`${appStates.binFolder}sscli enable ${forced === true ? "force": ""}`).then(response => {
          if (response === true && forced === true && alerts === true) appFrame.toggleSuccess();
          else if (response === false) appFrame.resetToggling();
        });
        break;

      default:
        // if the host OS is not Linux, use the node_dns_changer module to modify system DNS settings
        setTimeout(function() {
          global.desktop.logic.node_dns_changer.setDNSservers({
            DNSservers: ['104.197.28.121','104.155.237.225'],
            DNSbackupName: 'before_safesurfer',
            loggingEnable: window.appStates.enableLogging,
            mkBackup: true
          }).then(response => {
            if (response === true && forced === true && appStates.serviceEnabled[0] === true && alerts === true) appFrame.toggleSuccess();
          });
          // if service has still not been enabled, try again
          if (window.appStates.serviceEnabled[0] == false && os.platform() != 'darwin') {
            logging("[enableServicePerPlatform]: Service is still not enabled -- trying again.");
            // don't repeat if macOS
            appFrame.enableServicePerPlatform({forced, alerts: false});
          }
        },3000);
        break;
    }
  },

  disableServicePerPlatform: function({forced = false, alerts = true}) {
    // restore DNS settings
    $(".progressInfoBar_text").html(i18n.__("Please wait while the service is being disabled"));
    $('.progressInfoBar').css("height", "30px");
    $('#progressBar').css("height", "20px");
    if (enableNotifications == true && window.appStates.notificationCounter == 0) new Notification('Safe Surfer', {
      body: i18n.__('OK! Restoring your settings now.'),
      icon: path.join(__dirname, "..", "media", "icons", "win", "icon.ico")
    });
    window.appStates.notificationCounter += 1;
    window.appStates.toggleLock = true;
    switch (os.platform()) {
      case 'linux':
        // if sscli is able to be copied to /tmp, run it
        appFrame.exec(`${appStates.binFolder}sscli disable ${forced === true ? "force": ""}`).then(response => {
            if (response === true && forced === true && alerts === true) appFrame.toggleSuccess();
            else if (response === false) appFrame.resetToggling();
          });
        break;

      default:
        // if the host OS is not Linux, use the node_dns_changer module to modify system DNS settings
        setTimeout(function() {
          global.desktop.logic.node_dns_changer.restoreDNSservers({
            DNSbackupName: 'before_safesurfer',
            loggingEnable: window.appStates.enableLogging,
            rmBackup: os.platform() === 'darwin' ? false : true,
            macOSuseDHCP: appStates.macOSuseDHCP
          }).then(response => {
            if (response === true && forced === true && appStates.serviceEnabled[0] === false && alerts === true) appFrame.toggleSuccess();
          });
          // if service has still not been enabled, try again
          if (window.appStates.serviceEnabled[0] == true && os.platform() != 'darwin') {
            logging("[disableServicePerPlatform]: Service is still not disabled -- trying again.");
            // don't repeat if macOS
            appFrame.disableServicePerPlatform({forced, alerts: false});
          }
        },3000);
        break;
    }
  },

  checkIfOnLifeGuardNetwork: async function() {
    // check if current device is on lifeguard network
    return new Promise((resolve, reject) => {
      logging('[checkIfOnLifeGuardNetwork]: Checking if on lifeguard network');
      // start searching for lifeguard with bonjour
      bonjour.findOne({type: "sslifeguard"}, (service) => {
        // if a lifeguard is found
        if (service.fqdn.indexOf('_sslifeguard._tcp') != -1) {
          logging(`[checkIfOnLifeGuardNetwork]: found ${service.fqdn}`);
          resolve(true);
        }
      });
    });
  },

  publishDesktopAppOnNetwork: function(state) {
    // bonjour public to network for device discovery
    if (state == "enable") bonjour.publish({name: 'Safe Surfer Desktop', type: 'ssdesktop', port: 3158});
    if (state == "disable") bonjour.unpublishAll();
  },

  internetConnectionCheck: async function() {
    // check the user's internet connection
    return new Promise((resolve, reject) => {
      global.desktop.logic.connectivity()((online) => {
        logging(`[internetConnectionCheck]: ${online}`);
        window.appStates.appHasLoaded = true;
        window.appStates.internet[0] = online;
        resolve(online);
      });
    });
  },

  finishedLoading: function() {
    // close loading screen
    $('.appLoadingScreen').hide();
    window.appStates.appHasLoaded = true;
  },

  checkForAppUpdate: function(options) {
    // for for app update
    var remoteData,
     versionList = [],
     serverAddress = "142.93.48.189",
     serverPort = 80,
     serverDataFile = "/files/desktop/version-information.json",
     updateErrorDialog = {type: 'info', buttons: [i18n.__('Manually check on downloads page'), i18n.__('Ok')], message: i18n.__("Whoops, I couldn't find updates... Something seems to have gone wrong.")};

    logging(`[checkForAppUpdate]: About to fetch http://${serverAddress}:${serverPort}${serverDataFile}`);
    Request.get(`http://${serverAddress}:${serverPort}${serverDataFile}`, (error, response, body) => {
      if ((error < 200 || error >= 300) && error != null) {
        // if something goes wrong
        logging(`[checkForAppUpdate]: HTTP error ${error}`);
        if (options.showErrors == true) {
          dialog.showMessageBox(updateErrorDialog, updateResponse => {
            return;
          });
        }
        return console.dir(error);
      }
      //window.appStates.internet[0] = true;
      // read the data as JSON
      remoteData = JSON.parse(body);
      var versionRecommended;
      buildRecommended = parseInt(store.get('betaCheck') == true ? remoteData.recommendedBuild : remoteData.recommendedBetaBuild);
      remoteData.versions.map(build => {
        if (build.build == buildRecommended) versionRecommended = build;
        versionList = [...versionList, build.build];
      });

      var genLink = `${remoteData.linkBase}/files/desktop/${buildRecommended}-${versionRecommended.version}/SafeSurfer-Desktop-${versionRecommended.version}-${buildRecommended}-${os.arch()}`;
      switch (os.platform()) {
        case 'linux':
          if (LINUXPACKAGEFORMAT == 'appimage') genLink = `${genLink}.AppImage`;
          else genLink = remoteData.linkBase;
          break;

        case 'win32':
          genLink = `${genLink}.exe`;
          break;

        case 'darwin':
          genLink = `${genLink}.dmg`;
          break;
      }

      if (buildRecommended > parseInt(APPBUILD) && versionList.indexOf(buildRecommended) == -1) {
        // update available
        dialog.showMessageBox({type: 'info', buttons: [i18n.__('Yes'), i18n.__('No'), i18n.__('View changelog')], message: `${i18n.__('There is an update available' )} (v${versionRecommended.version}:${versionRecommended.build}${versionRecommended.buildMode}). ${i18n.__('Do you want to install it now?')}`}, updateResponse => {
          if (updateResponse == 0) {
            logging("[checkForAppUpdate]: User wants update.");
            if (versionRecommended.altLink === undefined) global.desktop.logic.electronOpenExternal(genLink);
            else global.desktop.logic.electronOpenExternal(versionRecommended.altLink);
          }
          else if (updateResponse == 2) {
            global.desktop.logic.electronOpenExternal(`https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/${versionRecommended.version}`);
          }
          else return;
        });
      }

      else if (buildRecommended == parseInt(APPBUILD) && versionList.indexOf(buildRecommended) == -1 && options.current == true) {
        // up to date
        logging("[checkForAppUpdate]: User has the latest version installed.");
        dialog.showMessageBox({type: 'info', buttons: ['Ok'], message: i18n.__("You're up to date.")}, updateResponse => {});
        return;
      }

      else if (buildRecommended < parseInt(APPBUILD) && versionList.indexOf(buildRecommended) == -1) {
        // user must downgrade
        dialog.showMessageBox({type: 'info', buttons: [i18n.__('Yes'), i18n.__('No')], message: `${i18n.__('Please downgrade to version')} ${versionRecommended.version}:${versionRecommended.build}${versionRecommended.buildMode}. ${i18n.__('Do you want to install it now?')}`}, updateResponse => {
          if (updateResponse == 0) {
            logging("[checkForAppUpdate]: User wants to downgrade.");
            if (versionRecommended.altLink === undefined) global.desktop.logic.electronOpenExternal(genLink);
            else global.desktop.logic.electronOpenExternal(versionRecommended.altLink);
          }
          else return;
        });
      }

      else {
        // if something goes wrong
        if (options.showErrors == true) {
          dialog.showMessageBox(updateErrorDialog, updateResponse => {
            logging("[checkForAppUpdate]: Error.");
            if (updateResponse == 0) global.desktop.logic.electronOpenExternal(serverAddress);
            return;
          });
        }
      }
    });
  },

  collectStatistics_general: function() {
    // if the user agrees to it, collect non identifiable information about their setup
    var dataGathered = {
      TYPESEND: "general",
      DATESENT: global.desktop.logic.moment().format('X'),
      APPVERSION: APPVERSION,
      APPBUILD: APPBUILD,
      TYPE: os.type(),
      PLATFORM: os.platform(),
      RELEASE: os.release(),
      CPUCORES: os.cpus().length,
      ARCH: os.arch(),
      LOCALE: app.getLocale(),
      LIFEGUARDSTATE: window.appStates.lifeguardFound[0],
      BUILDMODE: BUILDMODE,
      ISSERVICEENABLED: window.appStates.serviceEnabled[0],
    };
    if (os.platform() == 'linux' && LINUXPACKAGEFORMAT !== undefined && LINUXPACKAGEFORMAT !== '') dataGathered.LINUXPACKAGEFORMAT = LINUXPACKAGEFORMAT;
    return JSON.stringify(dataGathered);
  },

  storeInitalData: function(input) {
  // write inital data from sharing to cache
    if (store.get('statHistory') === undefined) store.set('statHistory', [input]);
    else {
      var previous = store.get('statHistory');
      previous = [...previous, input];
      store.set('statHistory', previous);
    }
  },

  sendStatistics: function(source) {
    // send information to server
    var dataToSend = global.desktop.logic.base64Encode().encode(source,'base64');
    // make a post request to the database
    Request.post('http://142.93.48.189:3000/', {form:{tel_data:dataToSend}}, (err, response, body) => {
      store.set('statisticAllow', true);
      logging({"[sendStatistics]: DATA": 'Sent.', "[sendStatistics]: STATDATA": source});
      if (err >= 400 && err <= 599) {
        logging('[sendStatistics]: Could not send -- error ${err}');
        return;
      }
    });
  },

  statPrompt: function() {
    // ask if user wants to participate in statistics
    var sharingData = appFrame.collectStatistics_general(),
      dialogUserAllow = function() {
        appFrame.sendStatistics(sharingData);
        store.set('statHasAnswer', true);
        store.set('statisticAllow', true);
        appFrame.storeInitalData(sharingData);
      },
      dialogUserDisallow = function() {
        store.set('statHasAnswer', true);
        store.set('statisticAllow', false);
        dialog.showMessageBox({type: 'info', buttons: [i18n.__('Return')], message: i18n.__("Nothing has been sent.")}, dialogResponse => {});
      }

    dialog.showMessageBox({type: 'info', buttons: [i18n.__('Yes, I will participate'), i18n.__('I want to see what will be sent'), i18n.__('No, thanks')], message: `${i18n.__("Statistics")}\n\n${i18n.__("We want to improve this app, one way that we can achieve this is by collecting small non-identifiable pieces of information about the devices that our app runs on.")}\n${i18n.__("As a user you\'re able to help us out.--You can respond to help us out if you like.")}\n- ${i18n.__("Safe Surfer team")}`}, dialogResponse => {
      logging("[statPrompt]: User has agreed to the prompt.");
      // if user agrees to sending stats
      switch (dialogResponse) {
        case 0:
          dialogUserAllow();
          break;

        case 1:
          dialog.showMessageBox({type: 'info', buttons: [i18n.__('Send'), i18n.__("Don't send")], message: `${i18n.__("Here is what will be sent:")}\n\n${sharingData}\n\n${i18n.__("In case you don't understand this data, it includes (such things as):")}\n- ${i18n.__("Which operating system you use")}\n- ${i18n.__("How many CPU cores you have")}\n - ${i18n.__("The language you have set")}\n - ${i18n.__("If the service is setup on your computer")}\n\n${i18n.__("We are also interested in updates, so with statistic sharing we will also be notified of which version you've updated to.")}`}, dialogResponse => {
            // if user agrees to sending stats
            switch (dialogResponse) {
              case 0:
                dialogUserAllow();
                break;

              case 1:
                dialogUserDisallow();
                break;
            }
          });
          break;

        case 2:
          dialogUserDisallow();
          break;
      }
      ipcRenderer.send('updateAppMenu', true);
    });
  },

  versionInformationCopy: function() {
    // copy app build information to clipboard
    dialog.showMessageBox({type: 'info', buttons: [i18n.__('No, return to app'), i18n.__('Just copy information'), i18n.__('Yes')], message: i18n.__('Do you want to copy the version information of this build of SafeSurfer-Desktop and go to the GitLab page to report an issue?')}, dialogResponse => {
      if (dialogResponse != 0) global.desktop.logic.electronClipboardWriteText(`Platform: ${process.platform}\nVersion: ${APPVERSION}\nBuild: ${APPBUILD}\nBuildMode: ${BUILDMODE}\nnode_dns_changer version: ${window.desktop.logic.node_dns_changer.version()}\nelectron version: ${process.versions.electron}`);
      if (dialogResponse == 2) global.desktop.logic.electronOpenExternal('https://gitlab.com/safesurfer/SafeSurfer-Desktop/issues/new');
    });
  },

  forceToggleWarning: function({wantedState}) {
    // display warning message as this could break settings
    if (window.appStates.lifeguardFound[0] == true) dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok')], message: i18n.__("You can't toggle the service, since you're on a LifeGuard network.")}, dialogResponse => {});
    else {
      if (wantedState == window.appStates.serviceEnabled[0]) {
        dialog.showMessageBox({type: 'info', buttons: [i18n.__('No, nevermind'), i18n.__('I understand and wish to continue')], message: `${i18n.__('The service is already in the state which you request.')}\n${i18n.__('Forcing the service to be enabled in this manner may have consequences.')}\n${i18n.__('Your computer\'s network configuration could break by doing this action.')}`}, dialogResponse => {
          if (dialogResponse == 1) {
            if (window.appStates.serviceEnabled[0] == true) appFrame.enableServicePerPlatform({forced: true});
            else {
              if (store.get('lockDeactivateButtons') != true) appFrame.disableServicePerPlatform({forced: true});
              else appFrame.lockAlertMessage();
            }
          }
        });
      }
      else {
        if (window.appStates.serviceEnabled[0] == true) {
          if (store.get('lockDeactivateButtons') != true) appFrame.disableServicePerPlatform({forced: true});
          else appFrame.lockAlertMessage();
        }
        else appFrame.enableServicePerPlatform({forced: true});
      }
    }
  },

  showUnprivillegedMessage: function() {
    // display dialog for if the app hasn't been started with root privileges
    logging("[showUnprivillegedMessage]: User is not admin -- displaying dialog message.");
    dialog.showMessageBox({type: 'info', buttons: [i18n.__('Show me how'), i18n.__('Exit')], message: i18n.__('To adjust network settings on your computer, you must run this app as an Administrator.')}, updateResponse => {
      if (updateResponse == 1) window.close();
      if (updateResponse == 0) {
        appFrame.openWindowsUACHelpPage();
        setTimeout(function() {
          window.close();
        },250);
      }
    });
  },

  sendAppStateNotifications: function() {
    // send notifications if the app state has changed to the user
    if (window.appStates.serviceEnabled[0] == true && enableNotifications == true) new Notification('Safe Surfer', {
      body: i18n.__('You are now safe to surf the internet. Safe Surfer has been setup.'),
      icon: path.join(__dirname, "..", "media", "icons", "win", "icon.ico")
    });
    else if (window.appStates.serviceEnabled[0] == false && enableNotifications == true) new Notification('Safe Surfer', {
      body: i18n.__('Safe Surfer has been disabled. You are now unprotected.'),
      icon: path.join(__dirname, "..", "media", "icons", "win", "icon.ico")
    });
  },

  lockDeactivateButtons: function() {
    // disallow pressing of deactivate
    $("#toggleButton").html(i18n.__("LOCKED").toUpperCase());
    store.set('lockDeactivateButtons', true);
  },

  lockEnableMessage: async function() {
    // tell the user to reboot
    return new Promise((resolve, reject) => {
      dialog.showMessageBox({type: 'info', buttons: [i18n.__('Yes'), i18n.__('No')], message: `${i18n.__("Lock deactivate buttons")}\n${i18n.__("Great you're now protected! Would you like to lock the buttons that allow deactivation?")}\n${i18n.__("Unlocking the buttons will require help from support.")}`}, response => {
        if (response == 1) resolve(true);
        if (response == 0) dialog.showMessageBox({type: 'info', buttons: [i18n.__('No, nevermind'), i18n.__("Yes, I'm absolutely sure")], message: `${i18n.__("Lock deactivate buttons")}\n${i18n.__("Are you absolutely sure that you want to lock deactivate buttons?")}`}, response => {
          if (response == 0) resolve(true);
          if (response == 1) {
            appFrame.lockDeactivateButtons();
            resolve(true);
          }
        });
      });
    });
  },

  lockAlertMessage: function() {
    // tell the user to go to support for help on unlocking it
    dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok'), i18n.__('Get support')], message: `${i18n.__("Locked deactivate buttons")}\n${i18n.__("The toggle buttons are locked, unlocking them will require help from support to unlock the buttons.")}`}, response => {
      if (response == 1) global.desktop.logic.electronOpenExternal('http://www.safesurfer.co.nz/contact');
    });
  },

  displayRebootMessage: function() {
    // tell the user to reboot
    dialog.showMessageBox({type: 'info', buttons: [i18n.__('Restart now'), i18n.__('Ignore')], message: `${i18n.__("Ok, your computer is setup.")}\n${i18n.__("We recommend you restart your computer to ensure that the settings have applied everywhere on it.")}`}, updateResponse => {
      if (updateResponse == 0) {
        switch (os.platform()) {
          case 'win32':
            appFrame.exec('shutdown /r /t 0');
            break;
          case 'linux':
            appFrame.exec(`/sbin/reboot`);
            break;
          case 'darwin':
            appFrame.exec("osascript -e 'do shell script \"reboot\" with prompt \"Reboot to apply settings\\n\" with administrator privileges'");
            break;
          default:
            dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok')], message: i18n.__("I'm unable to reboot for you, please reboot manually.")});
            break;
        }
      }
    });
  },

  donationMessage: async function() {
    // give the user a message about donating
    return new Promise((resolve, reject) => {
      dialog.showMessageBox({type: 'info', buttons: [i18n.__('No'), i18n.__('Donate')], message: `${i18n.__('Thank you for using the Safe Surfer desktop app.')}\n${i18n.__('Would you like to support the project and help fund future projects?')}`}, response => {
        if (response == 1) global.desktop.logic.electronOpenExternal('http://www.safesurfer.co.nz/donate-now/');
        resolve(true);
      });
    });
  },

  collectStatistics_update: function() {
    // if the user agrees to it, collect non identifiable information about their setup
    var dataGathered = {
      DATESENT: global.desktop.logic.moment().format('X'),
      TYPESEND: "update",
      APPBUILD: APPBUILD,
      BUILDMODE: BUILDMODE,
      APPVERSION: APPVERSION,
      PLATFORM: os.platform(),
      ISSERVICEENABLED: window.appStates.serviceEnabled[0]
    }
    if (os.platform() == 'linux' && LINUXPACKAGEFORMAT !== undefined && LINUXPACKAGEFORMAT !== '') dataGathered.LINUXPACKAGEFORMAT = LINUXPACKAGEFORMAT;
    return JSON.stringify(dataGathered);
  },

  checkForVersionChange: function() {
    // if the version of the app has been updated, let the statistic server know, if allowed by user
    var previousVersionData;
    logging("[checkForVersionChange]: Checking if user has reached a newer version");
    previousVersionData = store.get('lastVersionInstalled');
    if (previousVersionData !== undefined && previousVersionData.APPBUILD < APPBUILD) {
      var featureList = "";
      require('../data/releaseNotes.json').items.map(i => {
        featureList += `- ${i}\n`;
      });
      dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok'), i18n.__('Read detailed changelog')], message: `${i18n.__("What's new in version:")} ${APPVERSION}\n\n${i18n.__("Here are the improvements and fixes included in this version:")}\n${featureList}`}, response => {
        if (response === 1) desktop.logic.electronOpenExternal(`https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/${APPVERSION}`);
      });
      store.set('lastVersionInstalled', {APPBUILD: APPBUILD, APPVERSION: APPVERSION});
      if (store.get('statisticAllow') == true) {
        logging('[checkForVersionChange]: Sending update data');
        appFrame.sendStatistics(appFrame.collectStatistics_update());
        var previous = store.get('statHistory');
        previous = [...previous, JSON.stringify(dataGathered)];
        store.set('statHistory', previous);
      }
    }
    else logging('[checkForVersionChange]: User has not reached new version.');
  },

  toggleSuccess: function() {
    appFrame.resetToggling();
    if (window.appStates.serviceEnabled[0] == true) {
      appFrame.lockEnableMessage().then(response => {
        if (response) return appFrame.donationMessage();
      }).then(response => {
        if (response) return appFrame.displayRebootMessage();
      });
    }
    else appFrame.displayRebootMessage();
  },

  mainReloadProcess: function() {
    // reload function
    logging("[mainReloadProcess]: begin reload");
    appFrame.checkServiceState();

    if (appStates.internetCheckCounter === 3) {
      appFrame.internetConnectionCheck();
      appStates.internetCheckCounter = 0;
    }
    else appStates.internetCheckCounter += 1;

    if (window.appStates.internet[0] == true) {
      appFrame.hideNoInternetConnection();
      if (window.appStates.serviceEnabled[0] != window.appStates.serviceEnabled[1] && window.appStates.serviceEnabled[1] !== undefined) {
        if (window.appStates.toggleLock == true) {
          // if the state changes of the service being enabled changes
          logging('[mainReloadProcess]: State has changed.');
          appFrame.sendAppStateNotifications();
          window.appStates.serviceEnabled[1] = window.appStates.serviceEnabled[0];
          appFrame.toggleSuccess();
        }
      }
    }
    else {
      appFrame.displayNoInternetConnection();
      appStates.lifeguardOnNetworkLock = false;
    }

    if (appStates.serviceEnabled[0] === false) appStates.lifeguardOnNetworkLock = false;

    // if the service is enabled, check if a lifeguard is on the network
    if (appStates.lifeguardOnNetworkLock !== true) appFrame.checkIfOnLifeGuardNetwork().then((lgstate) => {
      window.appStates.lifeguardFound[0] = lgstate;
      if (appStates.lifeguardFound[0] === true) appStates.lifeguardOnNetworkLock = true;
    });

    if (window.appStates.lifeguardFound[0] != window.appStates.lifeguardFound[1]) {
      // if the state of a lifeguard being on the network changes
      logging('[mainReloadProcess]: LIFEGUARDSTATE State has changed.');
      window.appStates.lifeguardFound[1] = window.appStates.lifeguardFound[0];
      if (appStates.lifeguardFound[0] === true) appStates.lifeguardOnNetworkLock = true;
    }

    if (window.appStates.internet[0] != window.appStates.internet[1]) {
      // if the state of the internet connection changes
      logging('[mainReloadProcess]: NETWORK State has changed.');
      window.appStates.internet[1] = window.appStates.internet[0];
    }

    // if there are undefined states
    if (window.appStates.serviceEnabled[1] === undefined) window.appStates.serviceEnabled[1] = window.appStates.serviceEnabled[0];
    if (window.appStates.internet[1] === undefined) window.appStates.internet[1] = window.appStates.internet[0];
    if (window.appStates.lifeguardFound[1] === undefined) window.appStates.lifeguardFound[1] = window.appStates.lifeguardFound[0];
    if (window.appStates.progressBarCounter == 20) {
      window.appStates.progressBarCounter = 0;
      window.appStates.toggleLock = false;
      $('#progressBar').css("height", "0px");
      $('.progressInfoBar').css("height", "0px");
    }
    else if ($("#progressBar").css("height") == "20px") window.appStates.progressBarCounter += 1;

    // update the screen to show how the service state (... etc) is
    appFrame.affirmServiceState();
    if (appStates.lifeguardOnNetworkLock !== true) window.appStates.lifeguardFound[0] = false;
    logging("[mainReloadProcess]: end reload");
    setTimeout(appFrame.mainReloadProcess, 1000);
  },

  initApp: function() {
    // initalise rest of app
    appFrame.checkServiceState();
    setTimeout(() => {
      // run main process which loops
      logging("[initApp]: finishing initalising");
      appFrame.finishedLoading();
      appFrame.mainReloadProcess();
      // if user hasn't provided a response to statistics
      appFrame.checkForVersionChange();
      if (store.get('statHasAnswer') != true && appStates.userIsAdmin == true) {
        setTimeout(() => {
          appFrame.statPrompt();
        }, 3000);
      }
    }, 1000);
  },

  openWindowsUACHelpPage: function() {
    // launch a page about how to launch the app as an Administrator (for Windows users)
    global.desktop.logic.electronOpenExternal('https://safesurfer.desk.com/customer/en/portal/articles/2957007-run-app-as-administrator');
  },

  permissionLoop: function() {
    // loop until user is admin
    setTimeout(() => {
      logging(`[permissionLoop]: loop #${appStates.elevationFailureCount}`);
      if (appStates.userIsAdmin != true) {
        if (appStates.elevationFailureCount < 33) {
          $('#privBar').css("height", "40px");
          $('#privBarText').text(i18n.__('Please wait while the app asks for Administrative privileges'));
        }
        else {
          logging("[permissionLoop]: unable to elevate, now providing users with help");
          $('#privBarText_error').bind('click', appFrame.openWindowsUACHelpPage);
          $('#privBarText_tryAgain').bind('click', appFrame.elevateWindows);
          $('#privBarText_error').text(i18n.__('Help me to run this app as an Administrator'));
          $('#privBarText_tryAgain').text(i18n.__('Try again'));
          $('#privBarText').text(i18n.__("I can't seem run this app as an Administrator for you."));
          $('#privBar').css("height", "155px");
          appStates.elevateWindows_unable = true;
        }
        appStates.elevationFailureCount += 1;
        if (appStates.elevateWindows_unable !== true) appFrame.permissionLoop();
      }
      else {
        logging("[permissionLoop]: elevation successful... now relaunching with Administrator privileges");
        $('#privBar').css("height", "0px");
        appFrame.initApp();
      }
    }, 500);
  },

  windowsVersionCheck: function() {
    // if user is running Windows, make sure that the user is running a compatible version of Windows
    if (os.platform() != 'win32') {
      return;
    }
    var releaseVer = os.release().split('.');
    if (parseInt(releaseVer[0]) == 6 && parseInt(releaseVer[1]) >= 1 || parseInt(releaseVer[0]) == 10) {
      window.appStates.windowsVersionCompatible = true;
      return;
    }
    window.appStates.windowsVersionCompatible = false;
    logging("[windowsVersionCheck]: User is not on a compatible version of Windows");
    dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok'), i18n.__('Help')], message: i18n.__("The version of Windows that you seem to be running appears to be not compatible with this app.")}, msgResponse => {
      if (msgResponse == 1) global.desktop.logic.electronOpenExternal('https://safesurfer.desk.com/desktop-app-required-specs');
    });
  }
};

if (BUILDMODE == 'dev') window.appFrame = Object.freeze(appFrame);

ipcRenderer.on('toggleAppUpdateAutoCheck', (event, arg) => {
  // if user changes the state of auto check for updates
  logging(`[windowsVersionCheck]: UPDATES Auto check state changed to ${!arg}`);
  store.set('appUpdateAutoCheck', !arg);
});

ipcRenderer.on('betaCheck', (event, arg) => {
  // if user changes the state of auto check for updates
  logging(`[windowsVersionCheck]: UPDATES Beta state changed to ${!arg}`);
  store.set('betaCheck', !arg);
});

ipcRenderer.on('checkIfUpdateAvailable', (event, arg) => {
  // when user wants to check for app update using button in menu bar
  appFrame.checkForAppUpdate({
    current: true,
    showErrors: true
  });
});

ipcRenderer.on('goForceEnable', () => {
  // when activate button is pressed from menu bar
  appFrame.forceToggleWarning({wantedState: true});
});

ipcRenderer.on('goForceDisable', () => {
  // when deactivate button is pressed from menu bar
  appFrame.forceToggleWarning({wantedState: false});
});

ipcRenderer.on('goBuildToClipboard', () => {
  // when version information is pressed from menu bar
  appFrame.versionInformationCopy();
});

ipcRenderer.on('showAboutMenu', (opt) => {
  // go to about app page
  window.open(path.join(__dirname, '..', 'html', 'about.html'), i18n.__("About this app"));
});

ipcRenderer.on('showStatHistory', (opt) => {
  // go to statistic sharing page
  window.open(path.join(__dirname, '..', 'html', 'stats.html'), i18n.__("View statistic data"));
});

ipcRenderer.on('generateDiagnostics', () => {
  // copy diagnostics information to clipboard
  dialog.showMessageBox({type: 'info', buttons: [i18n.__("Yes"), i18n.__("No")], message: `${i18n.__("Diagnostics")}\n\n${i18n.__("Are you sure you want to copy diagnostics data to your clipboard?")}\n\n${i18n.__("Only ever send the data given to Safe Surfer if necessary. The information sent may contain some data detailing about your computer.")}`}, response => {
    if (response === 0) global.desktop.logic.electronClipboardWriteText(actions.diagnostics.generate());
  });
});

ipcRenderer.on('getStatuses', () => {
  dialog.showMessageBox({type: 'info', buttons: [i18n.__("Ok")], message: actions.status()});
});

ipcRenderer.on('goFlushDNScache', () => {
  // go to statistic sharing page
  appFrame.flushDNScache();
});

ipcRenderer.on('goOpenMyDeviceLifeGuard', () => {
  if (appStates.lifeguardFound[0] === true) window.open('http://mydevice.safesurfer.co.nz', 'Safe Surfer - Lifeguard');
  else dialog.showMessageBox({type: 'info', buttons: [, i18n.__('Ok')], message: `${i18n.__("I can't see a LifeGuard device on your network.")}`});
});

ipcRenderer.on('goLockDeactivateButtons', () => {
  // give a prompt about locking the toggle button
  if (appStates.serviceEnabled[0] != true) {
    dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok')], message: `${i18n.__('You must enable the service before you can lock it.')}`});
    return;
  }
  if (store.get('lockDeactivateButtons') === true) {
    dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok')], message: `${i18n.__('You appear to already have locked the buttons.')}`});
    return;
  }
  if (appStates.lifeguardFound[0] === true) {
    dialog.showMessageBox({type: 'info', buttons: [i18n.__('No'), i18n.__('Yes')], message: `${i18n.__('You appear to be on a LifeGuard network, the settings given from the LifeGuard cannot be disabled when on this network, are you sure you still want to lock the buttons?')}`}, response => {
      if (response === 0) return;
      if (response === 1) appFrame.lockEnableMessage();
    });
  }
  else appFrame.lockEnableMessage();
});

ipcRenderer.on('toggleStatState', () => {
  // changing the statistic sharing state
  store.set('statisticAllow', !store.get('statisticAllow'));
});

// keep note of if the user is running as admin or not
appFrame.windowsVersionCheck();
appFrame.checkUserPrivileges();

// if auto-update checking is enabled and updates are enabled, check for them
if (updatesEnabled == true && store.get('appUpdateAutoCheck') == true) appFrame.checkForAppUpdate({
  current: false,
  showErrors: false
});

// log a message in the console for devs; yeah that's probably you if you're reading this :)
console.log(`> Are you a developer? Do you want to help us with this project?
If so, join us by going to:
  - https://gitlab.com/safesurfer/SafeSurfer-Desktop
  - http://www.safesurfer.co.nz/become-safe-safe-volunteer

Yours,
Safe Surfer team.`);

// REMOVE THIS after a while, as user's will have their stat data migrated in no time
if (store.get('teleHistory') !== undefined) store.set('statHistory', store.get('teleHistory'));
if (store.get('statHistory') !== undefined) store.delete('teleHistory');
if (store.get('lastVersionTosendStatistics') !== undefined) store.set('lastVersionInstalled', store.get('lastVersionTosendStatistics'));
if (store.get('lastVersionInstalled') !== undefined) store.delete('lastVersionTosendStatistics');

// if lastVersionInstalled hasn't been stated, save the current settings
if (store.get('lastVersionInstalled') === undefined) store.set('lastVersionInstalled', {APPBUILD: APPBUILD, APPVERSION: APPVERSION});

// connect button in html to a function
$('#toggleButton').bind('click', appFrame.toggleServiceState);

appFrame.internetConnectionCheck();
// initalise the rest of the app
if (appStates.userIsAdmin == true) appFrame.initApp();
// since the user isn't admin, we'll keep checking just in case
else appFrame.permissionLoop();
