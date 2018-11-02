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
  app = global.desktop.logic.electron.app ? global.desktop.logic.electron.app: global.desktop.logic.electronremoteapp,
  packageJSON = window.desktop.global.packageJSON(),
  APPBUILD = parseInt(packageJSON.APPBUILD),
  APPVERSION = packageJSON.version,
  BUILDMODE = packageJSON.appOptions.BUILDMODE,
  isBeta = packageJSON.appOptions.isBeta,
  updatesEnabled = packageJSON.appOptions.enableUpdates,
  enableNotifications = packageJSON.appOptions.enableNotifications,
  os = global.desktop.logic.os(),
  path = window.desktop.logic.path(),
  bonjour = global.desktop.logic.bonjour(),
  Request = global.desktop.logic.request(),
  $ = global.desktop.global.jquery(),
  store = global.desktop.global.store(),
  i18n = global.desktop.global.i18n(),
  logging = global.desktop.global.logging(),
  LINUXPACKAGEFORMAT = global.desktop.global.linuxpackageformat === undefined ? '' : global.desktop.global.linuxpackageformat;

// an object to keep track of multiple things
window.appStates = {
  serviceEnabled: [undefined, undefined,],
  internet: [undefined, undefined,],
  lifeguardFound: [undefined, undefined,],
  appHasLoaded: false,
  enableLogging: packageJSON.appOptions.enableLogging,
  notificationCounter: 0,
  userIsAdmin: undefined,
  progressBarCounter: 0,
  elevationFailureCount: 0,
  toggleLock: false,
  guiSudo: "pkexec",
}

// if a linux package format can't be found, then state unsureness
if (typeof LINUXPACKAGEFORMAT === undefined) LINUXPACKAGEFORMAT="???";
logging(`INFO: platform  - ${os.platform()}`);
logging(`INFO: cwd       - ${process.cwd()}`);

// find path where AppImage is mounted to, if packaged for AppImage
if (LINUXPACKAGEFORMAT == 'appimage') {
  process.env.PATH.split(path.delimiter).map(i => {
    if (i.includes('/tmp/.mount_')) appStates.appimagePATH = i;
  });
}

if (os.platform() == 'linux') {
  if (window.desktop.logic.shelljs_which('pkexec') != null) window.appStates.guiSudo = 'pkexec';
  else if (window.desktop.logic.shelljs_which('xdg-su') != null) window.appStates.guiSudo = 'xdg-su';
}

// functions
const appFrame = Object.freeze({
  callProgram: async function(command) {
    // call a child process
    let promise = new Promise((resolve, reject) => {
      logging(`COMMAND: calling - '${command}'`);
      var command_split = command.split(" "),
        command_arg = [];
      // concatinate 2+ into a variable
      for (var i = 1; i < command_split.length; i++) {
        command_arg = [...command_arg, command_split[i]];
      }
      // command will be executed as: comand [ARGS]
      require('child_process').execFile(command_split[0], command_arg, function(err, stdout, stderr) {
        logging(`COMMAND: output - ${stdout}`);
        if (err) logging(`COMMAND: output error - ${err}`);
        if (stderr) logging(`COMMAND: output stderr - ${stderr}`);
        if (!err && !stderr) resolve(true);
      });
    });
    let result = await promise;
    return result;
  },

  linuxGuiSudo(command) {
    // run program with pkexec or xdg-su
    switch (window.appStates.guiSudo) {
      case 'pkexec':
        logging('SUDOGUI: Running with pkexec');
        appFrame.callProgram(`pkexec ${command}`);
        break;

      /*case 'xdg-su':
        logging('SUDOGUI: Running with xdg-su');
        appFrame.callProgram(`xdg-su -c '${command}'`);
        break;*/

      default:
        break;
    }
  },

  elevateWindows: function() {
    // call a child process
    appFrame.callProgram(`powershell Start-Process '${process.argv0}' -ArgumentList '.' -Verb runAs`).then((response) => {
      if (response == true) window.close();
    });
  },

  checkUserPrivileges: function() {
    // keep note of which user the app is run as
    switch (os.platform()) {
      case 'win32':
        global.desktop.logic.isAdmin().then(admin => {
          window.appStates.userIsAdmin = admin;
          if (admin == false) appFrame.elevateWindows();
        });
        break;
      default:
        window.appStates.userIsAdmin = true;
        break;
    }
  },

  displayProtection: function() {
    // show the user that the service has been enabled
    if (window.appStates.internet[0] == true) {
      logging("STATE: protected");
      $(".serviceActiveScreen").show();
      $(".serviceInactiveScreen").hide();
      // if a lifeguard has been found
      if (window.appStates.lifeguardFound[0] == true) {
        $("#bigTextProtected").html(i18n.__("PROTECTED BY LIFEGUARD").toUpperCase());
        $("#toggleButton").html(i18n.__("CONFIGURE LIFEGUARD").toUpperCase());
        $('.serviceToggle').addClass('serviceToggle_lifeguard');
        $('.topTextBox_active').addClass('topTextBox_active_lifeguard');
      }
      else {
        // if lifeguard is not found
        $("#bigTextProtected").html(i18n.__("YOU ARE PROTECTED").toUpperCase());
        $("#toggleButton").html(i18n.__("STOP PROTECTION").toUpperCase());
        $('.serviceToggle').removeClass('serviceToggle_lifeguard');
        $('.topTextBox_active').removeClass('topTextBox_active_lifeguard');
      }
      // make sure that button is persistent
      $('.serviceToggle').show();
      $('.appNoInternetConnectionScreen').hide();
      $('.appNoInternetConnectionScreen').parent().css('z-index', 2);
    }
  },

  displayUnprotection: function() {
    // show the user that the service has been enabled
    if (window.appStates.internet[0] == true) {
      logging("STATE: Unprotected");
      $(".serviceInactiveScreen").show();
      $(".serviceActiveScreen").hide();
      $("#toggleButton").html(i18n.__("GET PROTECTED").toUpperCase());
      $('.serviceToggle').show();
      $('.appNoInternetConnectionScreen').hide();
      $('.appNoInternetConnectionScreen').parent().css('z-index', 2);
    }
  },

  displayNoInternetConnection: function() {
    // show the user that they don't have an internet connection
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
    logging("USER: In switch");
    window.appStates.notificationCounter = 0;
    if (window.appStates.toggleLock === true) return;
    switch (window.appStates.serviceEnabled[0]) {
      // if service is enabled
      case true:
        logging('STATE: trying toggle disable');
        if (window.appStates.lifeguardFound[0] == true) window.open('http://mydevice.safesurfer.co.nz', 'Safe Surfer - Lifeguard');
        else appFrame.displayDisableWarning();
        break;

      // if service is disabled
      case false:
        logging('STATE: trying toggle enable');
        appFrame.enableServicePerPlatform({});
        break;

      default:
        dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok')], message: i18n.__("The state of the service is being determined. Please wait.")}, response => {});
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
    logging("STATE: Affirming the state");
    switch (window.appStates.serviceEnabled[0]) {
      case false:
        logging('STATE: trying affirm disable');
        appFrame.displayUnprotection();
        return;
        break;

      case true:
        logging('STATE: trying affirm enable');
        appFrame.displayProtection();
        return;
        break;
    }
  },

  checkServiceState: function() {
    // check the state of the service
    logging('STATE: Getting state of service');
    Request.get('http://check.safesurfer.co.nz', (error, response, body) => {
      // since the request has succeeded, we can count the app as loaded
      window.appStates.appHasLoaded = true;
      if (error >= 400 && error <= 599) {
        window.appStates.internet[0] = false;
        logging(`HTTP error: ${error}`);
        return;
      }
      else window.appStates.internet[0] = true;

      var metaResponse = global.desktop.logic.letsGetMeta(body),
        searchForResp = body.search('<meta name="ss_status" content="protected">');
      logging(`STATE - metaResponse.ss_status :: ${metaResponse.ss_status}`);
      if (searchForResp == -1 || metaResponse.ss_state == 'unprotected') {
        window.appStates.serviceEnabled[0] = false;
        logging('STATE: Get Request - Service disabled');
      }
      // if the meta tag returns protected
      if (searchForResp != -1 || metaResponse.ss_status == 'protected') {
        window.appStates.serviceEnabled[0] = true;
        logging('STATE: Get Request - Service enabled');
      }
      // if neither are returned
      else {
        logging("STATE: Get Request - Can't see protection state from meta tag");
        // check internet connection
        if (window.appStates.internet[0] == true) {
          logging('STATE: Get Request - Unsure of state');
        }
        else if (error !== undefined || window.appStates.internet[0] != true) logging('NETWORK: Internet connection unavailable');
      }
    });
  },

  enableServicePerPlatform: function({forced = ""}) {
    // apply DNS settings
    $('#progressBar').css("height", "20px");
    $(".progressInfoBar_text").html(i18n.__("Please wait while the service is being enabled"));
    $('.progressInfoBar').css("height", "30px");
    if (enableNotifications == true && window.appStates.notificationCounter == 0) new Notification('Safe Surfer', {
      body: i18n.__('Woohoo! Getting your computer setup now.'),
      icon: path.join(__dirname, "..", "media", "icons", "win", "icon.ico")
    });
    window.appStates.notificationCounter += 1;
    switch (os.platform()) {
      case 'linux':
        window.appStates.toggleLock = true;
        if (LINUXPACKAGEFORMAT === 'appimage') {
          if (global.desktop.logic.copy_sscli_toTmp(appStates.appimagePATH).code === 0) appFrame.linuxGuiSudo(`/tmp/sscli-appimage enable ${forced}`);
        }
        else {
          // run from project folder ./../../
          if (window.desktop.logic.testForFile(`${process.cwd()}/support/linux/shared-resources/sscli`) == true) appFrame.linuxGuiSudo(`${process.cwd()}/support/linux/shared-resources/sscli enable ${forced}`);
          // run from system if installed
          else appFrame.linuxGuiSudo(`sscli enable ${forced}`);
        }
        break;

      default:
        // if the host OS is not Linux, use the node_dns_changer module to modify system DNS settings
        window.appStates.toggleLock = true;
        setTimeout(function () {
          global.desktop.logic.node_dns_changer().setDNSservers({
            DNSservers: ['104.197.28.121','104.155.237.225'],
            DNSbackupName: 'before_safesurfer',
            loggingEnable: window.appStates.enableLogging,
            mkBackup: true
          });
          // if service has still not been enabled, try again
          if (window.appStates.serviceEnabled[0] == false && os.platform() != 'darwin') {
            logging("STATE: Service is still not enabled -- trying again.");
            // don't repeat if macOS
            appFrame.enableServicePerPlatform({forced});
          }
        },3000);
        break;
    }
  },

  disableServicePerPlatform: function({forced = ""}) {
    // restore DNS settings
    $(".progressInfoBar_text").html(i18n.__("Please wait while the service is being disabled"));
    $('.progressInfoBar').css("height", "30px");
    $('#progressBar').css("height", "20px");
    if (enableNotifications == true && window.appStates.notificationCounter == 0) new Notification('Safe Surfer', {
      body: i18n.__('OK! Restoring your settings now.'),
      icon: path.join(__dirname, "..", "media", "icons", "win", "icon.ico")
    });
    window.appStates.notificationCounter += 1;
    switch (os.platform()) {
      case 'linux':
        // if sscli is able to be copied to /tmp, run it
        window.appStates.toggleLock = true;
        if (LINUXPACKAGEFORMAT === 'appimage') {
          if (global.desktop.logic.copy_sscli_toTmp(appStates.appimagePATH).code === 0) appFrame.linuxGuiSudo(`/tmp/sscli-appimage disable ${forced}`);
        }
        else {
          // run from project folder ./../../
          if (window.desktop.logic.testForFile(`${process.cwd()}/support/linux/shared-resources/sscli`) == true) appFrame.linuxGuiSudo(`${process.cwd()}/support/linux/shared-resources/sscli disable ${forced}`);
          // run from system if installed
          else appFrame.linuxGuiSudo(`sscli disable ${forced}`);
        }
        break;

      default:
        // if the host OS is not Linux, use the node_dns_changer module to modify system DNS settings
        window.appStates.toggleLock = true;
        setTimeout(function () {
          global.desktop.logic.node_dns_changer().restoreDNSservers({
            DNSbackupName: 'before_safesurfer',
            loggingEnable: window.appStates.enableLogging,
            rmBackup: os.platform() === 'darwin' ? false : true
          });
          // if service has still not been enabled, try again
          if (window.appStates.serviceEnabled[0] == true && os.platform() != 'darwin') {
            logging("STATE: Service is still not disabled -- trying again.");
            // don't repeat if macOS
            appFrame.disableServicePerPlatform({forced});
          }
        },3000);
        break;
    }
  },

  checkIfOnLifeGuardNetwork: async function() {
    // check if current device is on lifeguard network
    let promise = new Promise((resolve, reject) => {
        logging('LIFEGUARDSTATE: Checking if on lifeguard network');
        // start searching for lifeguard with bonjour
        bonjour.findOne({type: "sslifeguard"}, (service) => {
          // if a lifeguard is found
          if (service.fqdn.indexOf('_sslifeguard._tcp') != -1) {
            logging(`LIFEGUARDSTATE: found ${service.fqdn}`);
            resolve(true);
          }
        });
      });
    let result = await promise;
    return result;
  },

  publishDesktopAppOnNetwork: function(state) {
    // bonjour public to network for device discovery
    if (state == "enable") bonjour.publish({name: 'Safe Surfer Desktop', type: 'ssdesktop', port: 3158});
    if (state == "disable") bonjour.unpublishAll();
  },

  internetConnectionCheck: async function() {
    // check the user's internet connection
    global.desktop.logic.connectivity()((online) => {
      logging(`INTERNETSTATE: ${online}`);
      window.appStates.appHasLoaded = true;
      Promise.resolve(online);
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
     updateErrorDialog = {type: 'info', buttons: ['Ok'], message: i18n.__("Whoops, I couldn't find updates... Something seems to have gone wrong.")};

    logging(`UPDATES: About to fetch http://${serverAddress}:${serverPort}${serverDataFile}`);
    Request.get(`http://${serverAddress}:${serverPort}${serverDataFile}`, (error, response, body) => {
      if (error >= 400 && error <= 599) {
        window.appStates.internet[0] = false;
        // if something goes wrong
        logging(`UPDATES: HTTP error ${error}`);
        if (options.showErrors == true) {
          dialog.showErrorBox(updateErrorDialog, updateResponse => {
            return;
          });
        }
        return console.dir(error);
      }
      window.appStates.internet[0] = true;
      // read the data as JSON
      remoteData = JSON.parse(body);
      for (var item = 0; item < remoteData.versions.length; item++) {
        versionList = [...versionList, remoteData.versions[item].build];
      }
      var iteration,
        versionRecommended;
      buildRecommended = parseInt(store.get('betaCheck') == true ? remoteData.recommendedBuild : remoteData.recommendedBetaBuild);
      for (var i = 0; i < remoteData.versions.length; i++) {
        if (remoteData.versions[i].build == buildRecommended) {
          iteration = i;
          break;
        }
      }

      if (buildRecommended > parseInt(APPBUILD) && versionList.indexOf(buildRecommended) == -1) {
        // update available
        dialog.showMessageBox({type: 'info', buttons: [i18n.__('Yes'), i18n.__('No'), i18n.__('View changelog')], message: `${i18n.__('There is an update available' )} (v${remoteData.versions[iteration].version}). ${i18n.__('Do you want to install it now?')}`}, updateResponse => {
          if (updateResponse == 0) {
            logging("UPDATES: User wants update.");
            if (remoteData.versions[iteration].altLink === undefined) {
              var ext,
                genLink;
              switch (os.platform()) {
                case 'linux':
                  if (LINUXPACKAGEFORMAT === 'appimage') {
                    ext = ".AppImage";
                    genLink = `${remoteData.linkBase}/files/desktop/${buildRecommended}-${remoteData.versions[iteration].version}/SafeSurfer-Desktop-${remoteData.versions[iteration].version}-${buildRecommended}-${os.arch()}${ext}`;
                  }
                  else genLink = remoteData.linkBase;
                  break;

                case 'win32':
                  ext = ".exe";
                  genLink = `${remoteData.linkBase}/files/desktop/${buildRecommended}-${remoteData.versions[iteration].version}/SafeSurfer-Desktop-${remoteData.versions[iteration].version}-${buildRecommended}-${os.arch()}${ext}`;
                  break;

                case 'darwin':
                  ext = ".app.zip";
                  genLink = `${remoteData.linkBase}/files/desktop/${buildRecommended}-${remoteData.versions[iteration].version}/SafeSurfer-Desktop-${remoteData.versions[iteration].version}-${buildRecommended}-${os.arch()}${ext}`;
                  break;
              }
              global.desktop.logic.electronOpenExternal(genLink);

            }
            else {
              global.desktop.logic.electronOpenExternal(remoteData.versions[iteration].altLink);
            }
          }
          else if (updateResponse == 2) {
            global.desktop.logic.electronOpenExternal(`https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/${remoteData.versions[iteration].version}`);
          }
          else return;
        });
      }

      else if (buildRecommended == parseInt(APPBUILD) && versionList.indexOf(buildRecommended) == -1 && options.current == true) {
        // up to date
        dialog.showMessageBox({type: 'info', buttons: ['Ok'], message: i18n.__("You're up to date.")}, updateResponse => {
          if (updateResponse == 0) {
            logging("UPDATES: User has the latest version installed.");
            return;
          }
          else {
            return;
          }
        });
      }

      else if (buildRecommended < parseInt(APPBUILD) && versionList.indexOf(buildRecommended) == -1) {
        // user must downgrade
        dialog.showMessageBox({type: 'info', buttons: [i18n.__('Yes'), i18n.__('No')], message: `${i18n.__('Please downgrade to version ')} ${remoteData.versions[iteration].version}. ${i18n.__('Do you want to install it now?')}`}, updateResponse => {
          if (updateResponse == 0) {
            logging("UPDATES: User wants to downgrade.");
            //global.desktop.logic.electronOpenExternal(remoteData.linkBase);
              var ext,
                genLink;
              switch (os.platform()) {
                case 'linux':
                  if (LINUXPACKAGEFORMAT == 'appimage') {
                    ext = ".AppImage";
                    genLink = `${remoteData.linkBase}/files/desktop/${buildRecommended}-${remoteData.versions[iteration].version}/SafeSurfer-Desktop-${remoteData.versions[iteration].version}-${buildRecommended}-${os.arch()}${ext}`;
                  }
                  else genLink = remoteData.linkBase;
                  break;

                case 'win32':
                  ext = ".exe";
                  genLink = `${remoteData.linkBase}/files/desktop/${buildRecommended}-${remoteData.versions[iteration].version}/SafeSurfer-Desktop-${remoteData.versions[iteration].version}-${buildRecommended}-${os.arch()}${ext}`;
                  break;

                case 'darwin':
                  ext = ".app.zip";
                  genLink = `${remoteData.linkBase}/files/desktop/${buildRecommended}-${remoteData.versions[iteration].version}/SafeSurfer-Desktop-${remoteData.versions[iteration].version}-${buildRecommended}-${os.arch()}${ext}`;
                  break;
              }
              global.desktop.logic.electronOpenExternal(genLink);
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
            logging("UPDATES: Error.");
            return;
          });
        }
      }
    });
  },

  collectTelemetry: function() {
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
      LOCALE: app().getLocale(),
      LIFEGUARDSTATE: window.appStates.lifeguardFound[0],
      BUILDMODE: BUILDMODE,
      ISSERVICEENABLED: window.appStates.serviceEnabled[0],
    };
    if (os.platform() == 'linux') dataGathered.LINUXPACKAGEFORMAT = LINUXPACKAGEFORMAT;
    return JSON.stringify(dataGathered);
  },

  storeInitalData: function(input) {
  // write inital data from sharing to cache
    if (store.get('teleHistory') === undefined) {
      store.set('teleHistory', [input]);
    }
    else {
      var previous = store.get('teleHistory');
      previous = [...previous, input];
      store.set('teleHistory', previous);
    }
  },

  sendTelemetry: function(source) {
    // send information to server
    var dataToSend = global.desktop.logic.base64Encode().encode(source,'base64');
    // make a post request to the database
    Request.post('http://142.93.48.189:3000/', {form:{tel_data:dataToSend}}, (err, response, body) => {
      store.set('telemetryAllow', true);
      store.set('lastVersionToSendTelemetry', {APPBUILD: APPBUILD, APPVERSION: APPVERSION});
      logging({"TELE": 'Sent.', "TELEDATA": source})
      if (response || body) {;
        if (store.get('teleID') === undefined) store.set('teleID', dataToSend.DATESENT);
      }
      if (err >= 400 && err <= 599) {
        logging('TELE: Could not send.');
        logging(`HTTP error: ${err}`);
        return;
      }
    });
  },

  telemetryPrompt: function() {
    // ask if user wants to participate in telemetry collection
    var sharingData = appFrame.collectTelemetry(),
     messageText = {
      nothingSent: {type: 'info', buttons: [i18n.__('Return')], message: i18n.__("Nothing has been sent.")},
      teleMsg: {type: 'info', buttons: [i18n.__('Yes, I will participate'), i18n.__('I want to see what will be sent'), i18n.__('No, thanks')], message: `${i18n.__("Data sharing")}\n\n${i18n.__("We want to improve this app, one way that we can achieve this is by collecting small non-identifiable pieces of information about the devices that our app runs on.")}\n${i18n.__("As a user you\'re able to help us out.--You can respond to help us out if you like.")}\n- ${i18n.__("Safe Surfer team")}`},
      previewdataGathered: {type: 'info', buttons: [i18n.__('Send'), i18n.__("Don't send")], message: `${i18n.__("Here is what will be sent:")}\n\n${sharingData}\n\n${i18n.__("In case you don't understand this data, it includes (such things as):")}\n- ${i18n.__("Which operating system you use")}\n- ${i18n.__("How many CPU cores you have")}\n - ${i18n.__("The language you have set")}\n - ${i18n.__("If the service is setup on your computer")}\n\n${i18n.__("We are also interested in updates, so with data sharing we will also be notified of which version you've to updated.")}`}
    };
    dialog.showMessageBox(messageText.teleMsg, dialogResponse => {
      logging("TELE: User has agreed to the prompt.");
      // if user agrees to sending telemetry
      switch (dialogResponse) {
        case 0:
          appFrame.sendTelemetry(sharingData);
          store.set('telemetryHasAnswer', true);
          store.set('telemetryAllow', true);
          appFrame.storeInitalData(sharingData);
          break;

        case 1:
          dialog.showMessageBox(messageText.previewdataGathered, dialogResponse => {
            // if user agrees to sending telemetry
            switch (dialogResponse) {
              case 0:
                appFrame.sendTelemetry(sharingData);
                store.set('telemetryHasAnswer', true);
                store.set('telemetryAllow', true);
                appFrame.storeInitalData(sharingData);
                break;

              case 1:
                store.set('telemetryHasAnswer', true);
                store.set('telemetryAllow', false);
                dialog.showMessageBox(messageText.nothingSent, dialogResponse => {});
                break;
            }
          });
          break;

        case 2:
          store.set('telemetryHasAnswer', true);
          store.set('telemetryAllow', false);
          dialog.showMessageBox(messageText.nothingSent, dialogResponse => {});
          break;
      }
    });
  },

  versionInformationCopy: function() {
    // copy app build information to clipboard
    dialog.showMessageBox({type: 'info', buttons: [i18n.__('No, return to app'), i18n.__('Just copy information'), i18n.__('Yes')], message: i18n.__('Do you want to copy the version information of this build of SafeSurfer-Desktop and go to the GitLab page to report an issue?')}, dialogResponse => {
      global.desktop.logic.electronClipboardWriteText(`Platform: ${process.platform}\nVersion: ${APPVERSION}\nBuild: ${APPBUILD}\nBuildMode: ${BUILDMODE}\nnode_dns_changer version: ${window.desktop.logic.node_dns_changer().version()}`);
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
            if (window.appStates.serviceEnabled[0] == true) appFrame.enableServicePerPlatform({forced: "force"});
            else appFrame.disableServicePerPlatform({forced: "force"});
          }
        });
      }
      else {
        if (window.appStates.serviceEnabled[0] == true) appFrame.disableServicePerPlatform({forced: "force"});
        else appFrame.enableServicePerPlatform({forced: "force"});
      }
    }
  },

  showUnprivillegedMessage: function() {
    // display dialog for if the app hasn't been started with root privileges
    const dialogNotRunningAsAdmin = {type: 'info', buttons: [i18n.__('Show me how'), i18n.__('Exit')], message: i18n.__('To adjust network settings on your computer, you must run this app as an Administrator.')};
    logging("PRIV: User is not admin -- displaying dialog message.");
    dialog.showMessageBox(dialogNotRunningAsAdmin, updateResponse => {
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

  displayRebootMessage: function() {
    // tell the user to reboot
    dialog.showMessageBox({type: 'info', buttons: [i18n.__('Reboot now'), i18n.__('Ignore')], message: `${i18n.__("Ok, your computer is setup.")}\n${i18n.__("To make sure of this, we recommend that you please reboot/restart your computer.")}`}, updateResponse => {
      if (updateResponse == 0) {
        switch (os.platform()) {
          case 'win32':
            appFrame.callProgram('shutdown /r /t 0');
            break;
          case 'linux':
            appFrame.linuxGuiSudo(`/sbin/reboot`);
            break;
          case 'darwin':
            appFrame.callProgram("osascript -e 'do shell script \"reboot\" with prompt \"Reboot to apply settings\\n\" with administrator privileges'");
            break;
          default:
            dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok')], message: i18n.__("I'm unable to reboot for you, please reboot manually.")}, response => {});
            break;
        }
      }
    });
  },

  donationMessage: async function() {
    // give the user a message about donating
    let promise = new Promise((resolve, reject) => {
      dialog.showMessageBox({type: 'info', buttons: [i18n.__('Donate'), i18n.__('No')], message: `${i18n.__('Thank you for using the Safe Surfer desktop app.')}\n${i18n.__('Would you like to support the project and help fund future projects?')}`}, response => {
        if (response == 0) global.desktop.logic.electronOpenExternal('http://www.safesurfer.co.nz/donate-now/');
        resolve(true);
      });
    })
    let result = await promise;
    return result;
  },

  checkForVersionChange: function() {
    // if the version of the app has been updated, let the telemetry server know, if allowed by user
    var previousVersionData,
     dataGathered = {};
    if (store.get('telemetryAllow') == true) {
      logging("TELE: Checking if user has reached a newer version");
      previousVersionData = store.get('lastVersionToSendTelemetry');
      if (previousVersionData !== undefined && previousVersionData.APPBUILD < APPBUILD) {
        logging('TELE: Sending update data');
        dataGathered.DATESENT = global.desktop.logic.moment().format('X');
        dataGathered.TYPESEND = "update";
        dataGathered.APPBUILD = APPBUILD;
        dataGathered.APPVERSION = APPVERSION;
        dataGathered.PLATFORM = os.platform();
        dataGathered.ISSERVICEENABLED = window.appStates.serviceEnabled[0];
        if (os.platform() == 'linux') dataGathered.LINUXPACKAGEFORMAT = LINUXPACKAGEFORMAT;
        appFrame.sendTelemetry(JSON.stringify(dataGathered));

        var previous = store.get('teleHistory');
        previous = [...previous, JSON.stringify(dataGathered)];
        store.set('teleHistory', previous);
        store.set('lastVersionToSendTelemetry', {APPBUILD: APPBUILD, APPVERSION: APPVERSION});
      }
      else logging('TELE: User has not reached new version.');
    }
  },

  mainReloadProcess: function() {
    // reload function
    logging("MAIN: begin reload");
    appFrame.checkServiceState();
    appFrame.internetConnectionCheck().then((state) => {
      window.appStates.internet[0] = state;
      // if there is an internet connection
      if (state == true) {
        appFrame.hideNoInternetConnection();
      }
      else if (state == false && window.appStates.lifeguardFound[0] == false) {
        // if there is no internet
        appFrame.displayNoInternetConnection();
      }
    });

    if (window.appStates.internet[0] == true) {
      if (window.appStates.serviceEnabled[0] != window.appStates.serviceEnabled[1] && window.appStates.serviceEnabled[1] !== undefined) {
          // if the state changes of the service being enabled changes
          logging('STATE: State has changed.');
          appFrame.sendAppStateNotifications();
          $('#progressBar').css("height", "0px");
          window.appStates.progressBarCounter = 0;
          window.appStates.serviceEnabled[1] = window.appStates.serviceEnabled[0];
          window.appStates.notificationCounter = 0;
          $('.progressInfoBar').css("height", "0px");
          window.appStates.toggleLock = false;
          if (window.appStates.serviceEnabled[0] == true) appFrame.donationMessage().then(response => {
            if (response) appFrame.displayRebootMessage();
          });
          else appFrame.displayRebootMessage();
          if (LINUXPACKAGEFORMAT == 'appimage' && global.desktop.logic.testForFile('/tmp/sscli-appimage')) global.desktop.logic.remove_sscli();
        }
    }

    if (window.appStates.serviceEnabled[0] == true) {
      // if the service is enabled, check if a lifeguard is on the network
      appFrame.checkIfOnLifeGuardNetwork().then((lgstate) => {
        window.appStates.lifeguardFound[0] = lgstate;
      });
    }

    if (window.appStates.internet[0] != window.appStates.internet[1]) {
      // if the state of the internet connection changes
      logging('NETWORK: State has changed.');
      window.appStates.internet[1] = window.appStates.internet[0];
    }

    if (window.appStates.lifeguardFound[0] != window.appStates.lifeguardFound[1]) {
      // if the state of a lifeguard being on the network changes
      logging('LIFEGUARDSTATE: State has changed.');
      window.appStates.lifeguardFound[1] = window.appStates.lifeguardFound[0];
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
    window.appStates.lifeguardFound[0] = false;
    logging("MAIN: end reload");
    setTimeout(appFrame.mainReloadProcess, 1000);
  },

  initApp: function() {
    // initalise rest of app
    appFrame.checkServiceState();
    setTimeout(() => {
      // run main process which loops
      appFrame.finishedLoading();
      appFrame.mainReloadProcess();
      // if user hasn't provided a response to telemetry
      if (store.get('telemetryHasAnswer') != true) {
        setTimeout(() => {
          appFrame.telemetryPrompt();
        }, 5000);
      }
    }, 1000);
  },

  openWindowsUACHelpPage: function() {
    // launch a page about how to launch the app as an Administrator (for Windows users)
    global.desktop.logic.electronOpenExternal('https://safesurfer.desk.com/how-to-uac.php');
  },

  permissionLoop: function() {
    // loop until user is admin
    setTimeout(() => {
      if (appStates.userIsAdmin != true) {
        if (appStates.elevationFailureCount < 33) {
          $('#privBar').css("height", "40px");
          $('#privBarText').text(i18n.__('Please wait while the app asks for Administrative privileges'));
        }
        else {
          document.querySelector('#privBarText_error').addEventListener('click', appFrame.openWindowsUACHelpPage);
          $('#privBarText_error').text(i18n.__('Help me to run this app as an Administrator'));
          $('#privBarText').text(i18n.__("I can't seem run this app as an Administrator for you."));
          $('#privBar').css("height", "115px");
        }
        appStates.elevationFailureCount += 1;
        appFrame.permissionLoop();
      }
      else {
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
      return;
    }
    logging("WINVERCHECK: User is not on a compatible version of Windows")
    var dialogMsg = {type: 'info', buttons: [i18n.__('Ok'), i18n.__('Help')], message: i18n.__("There version of Windows that you seem to be running appears to be not compatible with this app.")}
    dialog.showMessageBox(dialogMsg, msgResponse => {
      if (msgResponse == 1) global.desktop.logic.electronOpenExternal('https://safesurfer.desk.com/desktop-app-required-specs');
    });
  }
});

global.desktop.logic.electronIPCon('toggleAppUpdateAutoCheck', (event, arg) => {
  // if user changes the state of auto check for updates
  logging(`UPDATES: Auto check state changed to ${!arg}`);
  if (arg == true) {
    store.set('appUpdateAutoCheck', false);
  }

  else if (arg == false) {
    store.set('appUpdateAutoCheck', true);
  }
});

global.desktop.logic.electronIPCon('betaCheck', (event, arg) => {
  // if user changes the state of auto check for updates
  logging(`UPDATES: Beta state changed to ${!arg}`);
  if (arg == true) {
    store.set('betaCheck', false);
  }

  else if (arg == false) {
    store.set('betaCheck', true);
  }
});

global.desktop.logic.electronIPCon('checkIfUpdateAvailable', (event, arg) => {
  // when user wants to check for app update using button in menu bar
  appFrame.checkForAppUpdate({
    current: true,
    showErrors: true
  });
});

global.desktop.logic.electronIPCon('goForceEnable', () => {
  // when activate button is pressed from menu bar
  appFrame.forceToggleWarning({wantedState: true});
});

global.desktop.logic.electronIPCon('goForceDisable', () => {
  // when deactivate button is pressed from menu bar
  appFrame.forceToggleWarning({wantedState: false});
});

global.desktop.logic.electronIPCon('goBuildToClipboard', () => {
  // when version information is pressed from menu bar
  appFrame.versionInformationCopy();
});

global.desktop.logic.electronIPCon('openAboutMenu', () => {
  // go to about app page
  window.open(path.join(__dirname, '..', 'html', 'about.html'), i18n.__("About this app"));
});

global.desktop.logic.electronIPCon('viewTeleHistory', () => {
  // go to data sharing page
  window.open(path.join(__dirname, '..', 'html', 'tele.html'), i18n.__("View shared data"));
});

global.desktop.logic.electronIPCon('toggleTeleState', () => {
  // changing the data sharing state
  switch (store.get('telemetryAllow')) {
    case true:
      store.set('telemetryAllow', false);
      break;
    default:
      store.set('telemetryAllow', true);
      break;
  }
});

// keep note of if the user is running as admin or not
appFrame.windowsVersionCheck();
appFrame.checkUserPrivileges();
appFrame.checkForVersionChange();

// translate HTML elements
$('#bigTextProtected').text(i18n.__('YOU ARE PROTECTED').toUpperCase());
$('#subTextProtected').text(i18n.__('YOU ARE SAFE TO SURF THE INTERNET').toUpperCase());
$('#bigTextUnprotected').text(i18n.__('DANGER AHEAD').toUpperCase());
$('#subTextUnprotected').text(i18n.__('YOU ARE NOT PROTECTED IN THE ONLINE SURF').toUpperCase());
$('#bigTextNoInternet').text(i18n.__("IT APPEARS THAT YOU'VE YOUR LOST INTERNET CONNECTION.").toUpperCase());
$('#toggleButton').text(i18n.__('CHECKING SERVICE STATE').toUpperCase());

// if auto-update checking is enabled and updates are enabled, check for them
if ((updatesEnabled == true && store.get('appUpdateAutoCheck') == true) || process.env.APPUPDATES === "true") appFrame.checkForAppUpdate({
  current: false,
  showErrors: false
});

// log a message in the console for devs; yeah that's probably you if you're reading this :)
console.log(`> Are you a developer? Do you want to help us with this project?
Join us by going to:
  - https://gitlab.com/safesurfer/SafeSurfer-Desktop
  - http://www.safesurfer.co.nz/become-safe-safe-volunteer

Yours,
Safe Surfer team.`);

// connect button in html to a function
document.querySelector('#toggleButton').addEventListener('click', appFrame.toggleServiceState);

// initalise the rest of the app
if (appStates.userIsAdmin == true) appFrame.initApp();
// since the user isn't admin, we'll keep checking just in case
else appFrame.permissionLoop();
