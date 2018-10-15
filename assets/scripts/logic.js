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
 BUILDMODEJSON = global.desktop.global.buildmodejson(),
 APPBUILD = BUILDMODEJSON.APPBUILD,
 APPVERSION = BUILDMODEJSON.APPVERSION,
 BUILDMODE = BUILDMODEJSON.BUILDMODE,
 isBeta = BUILDMODEJSON.isBeta,
 updatesEnabled = BUILDMODEJSON.enableUpdates,
 enableNotifications = BUILDMODEJSON.enableNotifications,
 os = global.desktop.logic.os(),
 path = window.desktop.logic.path(),
 bonjour = global.desktop.logic.bonjour(),
 Request = global.desktop.logic.request(),
 $ = global.desktop.global.jquery(),
 store = global.desktop.global.store(),
 dns_changer = global.desktop.logic.node_dns_changer(),
 i18n = global.desktop.global.i18n(),
 logging = global.desktop.logic.logging(),
 LINUXPACKAGEFORMAT = global.desktop.global.linuxpackageformat();
var remoteData,
 appimagePATH;

// an object to keep track of multiple things
window.appStates = {
  serviceEnabled: undefined,
  serviceEnabled_previous: undefined,
  internet: [undefined, undefined, undefined, undefined, undefined],
  lifeguardFound: undefined,
  lifeguardFound_previous: undefined,
  appHasLoaded: false,
  enableLogging: BUILDMODEJSON.enableLogging,
  notificationCounter: 0,
  userIsAdmin: undefined,
  progressBarCounter: 0,
  elevationFailureCount: 0
}

// if a linux package format can't be found, then state unsureness
if (LINUXPACKAGEFORMAT.linuxpackageformat === undefined) LINUXPACKAGEFORMAT="???";
logging.log(String("INFO: platform - " + os.platform()));
logging.log(String("INFO: cwd - " + process.cwd()));

if (LINUXPACKAGEFORMAT.linuxpackageformat == 'appimage') {
  var aPath = process.env.PATH.split(path.delimiter);
  for (i in aPath) {
    if (aPath[i].includes('/tmp/.mount_')) {
      break;
    }
  }
  appimagePATH = aPath[i];
}

const appFrame = Object.freeze({
  callProgram: function(command) {
    // call a child process
    logging.log(String('COMMAND: calling - ' + command));
    var command_split = command.split(" ");
    var command_arg = [];
    // concatinate 2+ into a variable
    for (var i=1; i<command_split.length; i++) {
      command_arg.push(command_split[i]);
    }
    // command will be executed as: comand [ARGS]
    var child = require('child_process').execFile(command_split[0],command_arg, function(err, stdout, stderr) {
      logging.log(String("COMMAND: output - " + stdout));
      if (err) logging.log(String("COMMAND: output error - " + err));
      if (stderr) logging.log(String("COMMAND: output stderr - " + stderr));
      return stdout;
    });
  },

  elevateWindows: function() {
    // call a child process
    var command = String("powershell Start-Process '" + process.argv0 + "' -ArgumentList '.' -Verb runAs");
    logging.log(String('COMMAND: calling - ' + command));
    var command_split = command.split(" ");
    var command_arg = [];
    // concatinate 2+ into a variable
    for (var i=1; i<command_split.length; i++) {
      command_arg.push(command_split[i]);
    }
    // command will be executed as: comand [ARGS]
    if (os.platform() == 'win32' && window.appStates.userIsAdmin != true) var child = require('child_process').execFile(command_split[0],command_arg, function(err, stdout, stderr) {
      logging.log(String("COMMAND: output - " + stdout));
      if (err) logging.log(String("COMMAND: output error - " + err));
      else window.close();
      if (stderr) logging.log(String("COMMAND: output stderr - " + stderr));
      return stdout;
    });
  },

  checkUserPrivileges: function() {
    // keep note of which user the app is run as
    switch(os.platform()) {
      case 'win32':
        global.desktop.logic.isAdmin().then(admin => {
          if (admin == false) {
            window.appStates.userIsAdmin = false;
            appFrame.elevateWindows();
          }
          else window.appStates.userIsAdmin = true;
        });
        break;
      default:
        window.appStates.userIsAdmin = true
        break;
    }
  },

  displayProtection: function() {
    // enable DNS
    if (window.appStates.internet[0] == true) {
      logging.log("STATE: protected");
      $(".serviceActiveScreen").show();
      $(".serviceInactiveScreen").hide();
      // if a lifeguard has been found
      if (window.appStates.lifeguardFound == true) {
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
    // disable DNS
    if (window.appStates.internet[0] == true) {
      logging.log("STATE: Unprotected");
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
    logging.log("USER: In switch");
    window.appStates.notificationCounter = 0;
    // if user's privileges are Admin, or if the host OS is Linux
    switch(window.appStates.serviceEnabled) {
      case true:
        logging.log('STATE: trying toggle enable');
        if (window.appStates.lifeguardFound == true) {
          window.open('http://mydevice.safesurfer.co.nz', 'Safe Surfer - Lifeguard');
        }
        else {
          appFrame.displayDisableWarning();
        }
      break;

      case false:
        logging.log('STATE: trying toggle disable');
        appFrame.enableServicePerPlatform({});
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
    logging.log("STATE: Affirming the state");
    switch(window.appStates.serviceEnabled) {
      case false:
        logging.log('STATE: trying affirm disable');
        appFrame.displayUnprotection();
        return 0;
        break;

      case true:
        logging.log('STATE: trying affirm enable');
        appFrame.displayProtection();
        return 0;
        break;
    }
  },

  checkServiceState: function() {
    // check the state of the service
    logging.log('STATE: Getting state of service');
      Request.get('http://check.safesurfer.co.nz', (error, response, body) => {
        if (error >= 400 && error <= 599) {
          window.appStates.internet[0] = false;
          logging.log(String("HTTP error:" + error));
        }
        else {
          window.appStates.internet[0] = true;
        }

        var metaResponse = global.desktop.logic.letsGetMeta()(body);
        var searchForResp = body.search('<meta name="ss_status" content="protected">');
        logging.log(String("STATE - metaResponse.ss_status :: " + metaResponse.ss_status));
        if (searchForResp == -1 || metaResponse.ss_state == 'unprotected') {
          window.appStates.serviceEnabled = false;
          logging.log('STATE: Get Request - Service disabled');
          //appFrame.affirmServiceState();
        }
        // if the meta tag returns protected
        if (searchForResp != -1 || metaResponse.ss_status == 'protected') {
          window.appStates.serviceEnabled = true;
          logging.log('STATE: Get Request - Service enabled');
          //appFrame.affirmServiceState();
        }
        // if neither are returned
        else {
          logging.log("STATE: Get Request - Can't see protection state from meta tag");
          // check internet connection
          if (window.appStates.internet[0] == true) {
            logging.log('STATE: Get Request - Unsure of state');
          }
          else if (error !== undefined || window.appStates.internet[0] != true) {
            logging.log('NETWORK: Internet connection unavailable');
          }
        }
        // since the request has succeeded, we can count the app as loaded
        window.appStates.appHasLoaded = true;
      });
  },

  enableServicePerPlatform: function({forced}) {
    // apply DNS settings
    $('#progressBar').css("height", "20px");
    if (forced === undefined) forced = "";
    if (enableNotifications == true && window.appStates.notificationCounter == 0) new Notification('Safe Surfer', {
      body: i18n.__('Woohoo! Getting your computer setup now.'),
      icon: path.join(__dirname, "..", "media", "icons", "win", "icon.ico")
    });
    window.appStates.notificationCounter += 1;
    switch(os.platform()) {
      case 'linux':
        switch (LINUXPACKAGEFORMAT.linuxpackageformat) {
          case 'appimage':
            if (global.desktop.logic.copy_sscli_toTmp(appimagePATH).code === 0) {
              appFrame.callProgram(String('pkexec /tmp/sscli-appimage enable ' + forced));
            }
            break;

          default:
            if (window.desktop.logic.testForFile(String(process.cwd() + '/support/linux/shared-resources/sscli')) == true) appFrame.callProgram(String('pkexec ' + process.cwd() + '/support/linux/shared-resources/sscli enable ' + forced));
            appFrame.callProgram(String('pkexec sscli enable ' + forced));
            break;
        }
        break;

      default:
        // if the host OS is not Linux, use the node_dns_changer module to modify system DNS settings
        setTimeout(function () {
          dns_changer.setDNSservers({
              DNSservers: ['104.197.28.121','104.155.237.225'],
              DNSbackupName: 'before_safesurfer',
              loggingEnable: window.appStates.enableLogging
          });
          if (window.appStates.serviceEnabled == false) {
            logging.log("STATE: Service is still not enabled -- trying again.");
            if (os.platform() != 'darwin') appFrame.enableServicePerPlatform({});
          }
        },1200);
        break;
    }
  },

  disableServicePerPlatform: function({forced}) {
    // restore DNS settings
    $('#progressBar').css("height", "20px");
    if (forced === undefined) forced = "";
    if (enableNotifications == true && window.appStates.notificationCounter == 0) new Notification('Safe Surfer', {
      body: i18n.__('OK! Restoring your settings now.'),
      icon: path.join(__dirname, "..", "media", "icons", "win", "icon.ico")
    });
    window.appStates.notificationCounter += 1;
    switch(os.platform()) {
      case 'linux':
        switch (LINUXPACKAGEFORMAT.linuxpackageformat) {
          case 'appimage':
            if (global.desktop.logic.copy_sscli_toTmp(appimagePATH).code === 0) {
              appFrame.callProgram(String('pkexec /tmp/sscli-appimage disable ' + forced));
            }
            break;
          default:
            // if running from home folder
            if (global.desktop.logic.electronIsDev() == true && LINUXPACKAGEFORMAT.linuxpackageformat == '') appFrame.callProgram(String('pkexec ' + process.cwd() + '/support/linux/shared-resources/sscli disable ' + forced));
            else appFrame.callProgram(String('pkexec sscli disable ' + forced));
            break;
        }
        break;

      default:
        // if the host OS is not Linux, use the node_dns_changer module to modify system DNS settings
        setTimeout(function () {
          dns_changer.restoreDNSservers({
              DNSbackupName: 'before_safesurfer',
              loggingEnable: window.appStates.enableLogging
          });
          if (window.appStates.serviceEnabled == true) {
            logging.log("STATE: Service is still not disabled -- trying again.");
            appFrame.disableServicePerPlatform({});
          }
        },1200);
        break;
    }
  },

  checkIfOnLifeGuardNetwork: async function() {
    // check if current device is on lifeguard network
    let promise = new Promise((resolve, reject) => {
        logging.log('LIFEGUARDSTATE: Checking if on lifeguard network');
        // start searching for lifeguard with bonjour
        bonjour.findOne({ type: "sslifeguard" }, (service) => {
          // if a lifeguard is found
          if (service.fqdn.indexOf('_sslifeguard._tcp') != -1) {
            logging.log(String("LIFEGUARDSTATE: found " + service.fqdn));
            resolve(true);
          }
        });
      });
    let result = await promise;
    return result;
  },

  publishDesktopAppOnNetwork: function(state) {
    // bonjour public to network for device discovery
    if (state == "enable") bonjour.publish({ name: 'Safe Surfer Desktop', type: 'ssdesktop', port: 3158 });
    if (state == "disable") bonjour.unpublishAll();
  },

  internetConnectionCheck: async function() {
    // check the user's internet connection
    let promise = new Promise((resolve, reject) => {
      /*global.desktop.logic.isOnline().then(online => {
        logging.log(String("INTERNETSTATE: " + online));
        if (online == true) {
          //window.appStates.internet[0] = true;
          window.appStates.appHasLoaded = true;
        }
          resolve(online);
      });*/
      global.desktop.logic.connectivity()((online) => {
        logging.log(String("INTERNETSTATE: " + online));
        window.appStates.appHasLoaded = true;
        resolve(online);
      });
    });
    let result = await promise;
    return result;
  },

  finishedLoading: function() {
    // close loading screen
    $('.appLoadingScreen').hide();
    window.appStates.appHasLoaded = true;
  },

  checkForAppUpdate: function(options) {
    // for for app update
    var baseLink,
     versionList = [],
     serverAddress = "142.93.48.189",
     serverPort = 80,
     serverDataFile = "/files/desktop/version-information.json",
     updateCurrentDialog = {type: 'info', buttons: ['Ok'], message: String(i18n.__("You're up to date."))},
     updateErrorDialog = {type: 'info', buttons: ['Ok'], message: String(i18n.__("Whoops, I couldn't find updates... Something seems to have gone wrong."))};

    Request.get(String("http://" + serverAddress + ":" + serverPort + serverDataFile), (error, response, body) => {
      if(error >= 400 && error <= 599) {
        window.appStates.internet[0] = false;
        // if something goes wrong
        logging.log(String("HTTP error:" + error));
        if (options.showErrors == true) {
          dialog.showErrorBox(updateErrorDialog, updateResponse => {
            logging.log("UPDATE: Error with updates.");
            return;
          });
        }
        return console.dir(error);
      }
      window.appStates.internet[0] = true;
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
            logging.log("UPDATE: User wants update.");
            if (remoteData.versions[iteration].altLink === undefined) {
              //global.desktop.logic.electronOpenExternal()(remoteData.linkBase);
              var ext,
                genLink;
              switch(os.platform()) {
                case 'linux':
                  if (LINUXPACKAGEFORMAT.linuxpackageformat == 'appimage') {
                    ext = ".AppImage";
                    genLink = String(remoteData.linkBase + "/files/desktop/" + buildRecommended + "-" + remoteData.versions[iteration].version + "/SafeSurfer-Desktop-" + remoteData.versions[iteration].version + "-" + buildRecommended + "-" + os.arch() + ext);
                  }
                  else genLink = remoteData.linkBase;
                  break;

                case 'win32':
                  ext = ".exe";
                  genLink = String(remoteData.linkBase + "/files/desktop/" + buildRecommended + "-" + remoteData.versions[iteration].version + "/SafeSurfer-Desktop-" + remoteData.versions[iteration].version + "-" + buildRecommended + "-" + os.arch() + ext);
                  break;

                case 'darwin':
                  ext = ".app.zip";
                  genLink = String(remoteData.linkBase + "/files/desktop/" + buildRecommended + "-" + remoteData.versions[iteration].version + "/SafeSurfer-Desktop-" + remoteData.versions[iteration].version + "-" + buildRecommended + "-" + os.arch() + ext);
                  break;
              }
              global.desktop.logic.electronOpenExternal()(genLink);

            }
            else {
              global.desktop.logic.electronOpenExternal()(remoteData.versions[iteration].altLink);
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
            logging.log("UPDATE: User has the latest version installed.");
            return;
          }
          else {
            return;
          }
        });
      }
      else if (buildRecommended < APPBUILD && versionList.indexOf(buildRecommended) != -1) {
        // user must downgrade
        dialog.showMessageBox(updateDowngradeDialog, updateResponse => {
          if (updateResponse == 0) {
            logging.log("UPDATE: User wants to downgrade.");
            //global.desktop.logic.electronOpenExternal()(remoteData.linkBase);
              var ext,
                genLink;
              switch(os.platform()) {
                case 'linux':
                  if (LINUXPACKAGEFORMAT.linuxpackageformat == 'appimage') {
                    ext = ".AppImage";
                    genLink = String(remoteData.linkBase + "/files/desktop/" + buildRecommended + "-" + remoteData.versions[iteration].version + "/SafeSurfer-Desktop-" + remoteData.versions[iteration].version + "-" + buildRecommended + "-" + os.arch() + ext);
                  }
                  else genLink = remoteData.linkBase;
                  break;

                case 'win32':
                  ext = ".exe";
                  genLink = String(remoteData.linkBase + "/files/desktop/" + buildRecommended + "-" + remoteData.versions[iteration].version + "/SafeSurfer-Desktop-" + remoteData.versions[iteration].version + "-" + buildRecommended + "-" + os.arch() + ext);
                  break;

                case 'darwin':
                  ext = ".app.zip";
                  genLink = String(remoteData.linkBase + "/files/desktop/" + buildRecommended + "-" + remoteData.versions[iteration].version + "/SafeSurfer-Desktop-" + remoteData.versions[iteration].version + "-" + buildRecommended + "-" + os.arch() + ext);
                  break;
              }
              global.desktop.logic.electronOpenExternal()(genLink);
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
            logging.log("UPDATE: Error.");
            return;
          });
        }
      }
    });
  },

  collectTelemetry: function() {
    // if the user agrees to it, collect non identifiable information about their setup
    var dataGathered = {};
    logging.log('TELE: Sending general data');
    dataGathered.TYPESEND = "general";
    dataGathered.DATESENT = global.desktop.logic.moment().format('X');
    dataGathered.APPVERSION = APPVERSION;
    dataGathered.APPBUILD = APPBUILD;
    dataGathered.TYPE = os.type();
    dataGathered.PLATFORM = os.platform();
    dataGathered.RELEASE = os.release();
    dataGathered.CPUCORES = os.cpus().length;
    dataGathered.LOCALE = app().getLocale();
    dataGathered.LIFEGUARDSTATE = window.appStates.lifeguardFound;
    dataGathered.BUILDMODE = BUILDMODEJSON.BUILDMODE;
    dataGathered.ISSERVICEENABLED = window.appStates.serviceEnabled;
    if (os.platform() == 'linux') dataGathered.LINUXPACKAGEFORMAT = LINUXPACKAGEFORMAT.linuxpackageformat;
    return JSON.stringify(dataGathered);
  },

  storeInitalData: function(input) {
  // write inital data from sharing to cache
    if (store.get('teleHistory') === undefined) {
      store.set('teleHistory', [input]);
    }
    else {
      var previous = store.get('teleHistory');
      previous.push(input);
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
      if (response || body) {
        logging.log('TELE: Sent.');
        if (store.get('teleID') === undefined) store.set('teleID', dataToSend.DATESENT);
      }
      if (err >= 400 && err <= 599) {
        logging.log('TELE: Could not send.');
        logging.log(String("HTTP error:" + err));
        return;
      }
    });
  },

  telemetryPrompt: function() {
    // ask if user wants to participate in telemetry collection
    var nothingSent = {type: 'info', buttons: [i18n.__('Return')], message: i18n.__("Nothing has been sent.")},
        teleMsg = {type: 'info', buttons: [i18n.__('Yes, I will participate'), i18n.__('I want to see what will be sent'), i18n.__('No, thanks')], message: String(i18n.__("Data sharing") + "\n\n" + String(i18n.__("We want to improve this app, one way that we can achieve this is by collecting small non-identifiable pieces of information about the devices that our app runs on.") + "\n" + i18n.__("As a user you\'re able to help us out.--You can respond to help us out if you like.") + "\n- " + i18n.__("Safe Surfer team")))}
        sharingData = appFrame.collectTelemetry();
    dialog.showMessageBox(teleMsg, dialogResponse => {
      logging.log("TELE: User has agreed to the prompt.");
      // if user agrees to sending telemetry
      if (dialogResponse == 0) {
        appFrame.sendTelemetry(sharingData);
        store.set('telemetryHasAnswer', true);
        store.set('telemetryAllow', true);
        appFrame.storeInitalData(sharingData);
      }
      // if user wants to see what will be sent
      else if (dialogResponse == 1) {
        var previewdataGathered = {type: 'info', buttons: [i18n.__('Send'), i18n.__("Don't send")], message: String(i18n.__("Here is what will be sent:")+"\n\n"+(sharingData)+"\n\n" + i18n.__("In case you don't understand this data, it includes (such things as):") + "\n- " + i18n.__("Which operating system you use") + "\n- " + i18n.__("How many CPU cores you have") + "\n -" + i18n.__("The language you have set") + "\n - " + i18n.__("If the service is setup on your computer"))};
        dialog.showMessageBox(previewdataGathered, dialogResponse => {
          // if user agrees to sending telemetry
          if (dialogResponse == 0) {
            appFrame.sendTelemetry(sharingData);
            store.set('telemetryHasAnswer', true);
            store.set('telemetryAllow', true);
            appFrame.storeInitalData(sharingData);
          }
          // if user doesn't agree to sending telemetry
          else if (dialogResponse == 1) {
            store.set('telemetryHasAnswer', true);
            store.set('telemetryAllow', false);
            dialog.showMessageBox(nothingSent, dialogResponse => {});
          }
        });
      }
      // if user doesn't want to participate
      else if (dialogResponse == 2) {
        store.set('telemetryHasAnswer', true);
        store.set('telemetryAllow', false);
        dialog.showMessageBox(nothingSent, dialogResponse => {});
      }
    });
  },

  versionInformationCopy: function() {
    // copy app build information to clipboard
    var dialogBuildInformationCopy = {type: 'info', buttons: [i18n.__('No, return to app'), i18n.__('Just copy information'), i18n.__('Yes')], message: i18n.__('Do you want to copy the version information of this build of SafeSurfer-Desktop and go to the GitLab page to report an issue?')};
    dialog.showMessageBox(dialogBuildInformationCopy, dialogResponse => {
      global.desktop.logic.electronClipboardWriteText(String('Platform: '+process.platform+'\nVersion: '+APPVERSION+'\nBuild: '+APPBUILD+'\nBuildMode: '+ BUILDMODE));
      if (dialogResponse == 2) global.desktop.logic.electronOpenExternal()('https://gitlab.com/safesurfer/SafeSurfer-Desktop/issues/new');
    });
  },

  forceToggleWarning: function({wantedState}) {
    // display warning message as this could break settings
    var toggleWarning = {type: 'info', buttons: [i18n.__('No, nevermind'), i18n.__('I understand and wish to continue')], message: String(i18n.__('The service is already in the state which you request.' + "\n" + i18n.__('Forcing the service to be enabled in this manner may have consequences.' + '\n' + 'Your computer\'s network configuration could break by doing this action.')))},
     lifeguardMessage = {type: 'info', buttons: [i18n.__('Ok')], message: i18n.__("You can't toggle the service, since you're on a LifeGuard network.")},
     continu;
    if (window.appStates.lifeguardFound == true) {
      dialog.showMessageBox(lifeguardMessage, dialogResponse => {});
    }
    else {
      if (wantedState == window.appStates.serviceEnabled) {
        dialog.showMessageBox(toggleWarning, dialogResponse => {
          if (dialogResponse == 1) {
            switch(window.appStates.serviceEnabled) {
              case true:
                appFrame.enableServicePerPlatform({forced: "force"});
                break;

              case false:
                appFrame.disableServicePerPlatform({forced: "force"});
                break;
            }
          }
        });
      }
      else {
        switch(window.appStates.serviceEnabled) {
          case true:
            appFrame.disableServicePerPlatform({forced: "force"});
            break;

          case false:
            appFrame.enableServicePerPlatform({forced: "force"});
            break;
        }
      }
    }
  },

  showUnprivillegedMessage: function() {
    // display dialog for if the app hasn't been started with root privileges
    var dialogNotRunningAsAdmin = {type: 'info', buttons: [i18n.__('Show me how'), i18n.__('Exit')], message: i18n.__('To adjust network settings on your computer, you must run this app as an Administrator.')};
    logging.log("PRIV: User is not admin -- displaying dialog message.");
    dialog.showMessageBox(dialogNotRunningAsAdmin, updateResponse => {
      if (updateResponse == 1) window.close();
      if (updateResponse == 0) {
        global.desktop.logic.electronOpenExternal()('https://safesurfer.desk.com/how-to-uac.php');
        setTimeout(function() {
          window.close();
        },250);
      }
    });
  },

  sendAppStateNotifications: function() {
    // send notifications if the app state has changed to the user
    if (window.appStates.serviceEnabled == true && enableNotifications == true) new Notification('Safe Surfer', {
      body: i18n.__('You are now safe to surf the internet. Safe Surfer has been setup.'),
      icon: path.join(__dirname, "..", "media", "icons", "win", "icon.ico")
    });
    else if (window.appStates.serviceEnabled == false && enableNotifications == true) new Notification('Safe Surfer', {
      body: i18n.__('Safe Surfer has been disabled. You are now unprotected.'),
      icon: path.join(__dirname, "..", "media", "icons", "win", "icon.ico")
    });
  },

  displayRebootMessage: function() {
    // tell the user to reboot
    if (window.appStates.serviceEnabled == true) var dialogRebootMessage = {type: 'info', buttons: [i18n.__('Ignore'), i18n.__('Reboot now')], message: String(i18n.__("Great, your computer is setup.") + "\n" + i18n.__("To make sure of this, we recommend that you please reboot/restart your computer."))}
    if (window.appStates.serviceEnabled == false) var dialogRebootMessage = {type: 'info', buttons: [i18n.__('Ignore'), i18n.__('Reboot now')], message: String(i18n.__("Ok, Safe Surfer has been removed.") + "\n" + i18n.__("To make sure of this, we recommend that you please reboot/restart your computer."))}
    dialog.showMessageBox(dialogRebootMessage, updateResponse => {
      if (updateResponse == 1) {
        switch (os.platform()) {
          case 'win32':
            appFrame.callProgram(String('shutdown /r /t 0'));
            break;
          case 'linux':
            appFrame.callProgram(String('pkexec /sbin/reboot'));
            break;
          case 'darwin':
            appFrame.callProgram(String("osascript -e 'do shell script \"reboot\" with prompt \"Reboot to apply settings\\n\" with administrator privileges'"));
            break;
          default:
            dialog.showMessageBox({type: 'info', buttons: [i18n.__('Ok')], message: i18n.__("I'm unable to reboot for you, please reboot manually.")}, response => {});
            break;
        }
      }
    });
  },

  checkForVersionChange: function() {
    // if the version of the app has been updated, let the telemetry server know, if allowed by user
    var previousVersionData,
     dataGathered = {};
    if (store.get('telemetryAllow') == true) {
      logging.log("TELE: Checking if user has reached a newer version");
      previousVersionData = store.get('lastVersionToSendTelemetry');
      if (previousVersionData !== undefined && previousVersionData.APPBUILD < APPBUILD) {
        logging.log('TELE: Sending update data');
        dataGathered.DATESENT = global.desktop.logic.moment().format('X');
        dataGathered.TYPESEND = "update";
        dataGathered.APPBUILD = BUILDMODEJSON.APPBUILD;
        dataGathered.APPVERSION = BUILDMODEJSON.APPVERSION;
        dataGathered.PLATFORM = os.platform();
        dataGathered.ISSERVICEENABLED = window.appStates.serviceEnabled;
        if (os.platform() == 'linux') dataGathered.LINUXPACKAGEFORMAT = LINUXPACKAGEFORMAT.linuxpackageformat;
        appFrame.sendTelemetry(JSON.stringify(dataGathered));

        var previous = store.get('teleHistory');
        previous.push(JSON.stringify(dataGathered));
        store.set('teleHistory', previous);
        store.set('lastVersionToSendTelemetry', {APPBUILD: APPBUILD, APPVERSION: APPVERSION});
      }
      else logging.log('TELE: User has not reached new version.');
    }
  },

  mainReloadProcess: function() {
    // reload function
    logging.log("MAIN: begin reload");
    appFrame.checkServiceState();
    appFrame.internetConnectionCheck().then((state) => {
      window.appStates.internet[0] = state
      // if there is an internet connection
      if (state == true) {
        appFrame.hideNoInternetConnection();
        if (window.appStates.serviceEnabled != window.appStates.serviceEnabled_previous && window.appStates.serviceEnabled_previous !== undefined) {
          // if the state changes of the service being enabled changes
          logging.log('STATE: State has changed.');
          appFrame.sendAppStateNotifications();
          $('#progressBar').css("height", "0px");
          window.appStates.progressBarCounter = 0;
          window.appStates.serviceEnabled_previous = window.appStates.serviceEnabled;
          appFrame.displayRebootMessage();
          window.appStates.notificationCounter = 0;
          if (LINUXPACKAGEFORMAT.linuxpackageformat == 'appimage' && global.desktop.logic.checkFor_sscli()) global.desktop.logic.remove_sscli();
        }
      }
      else if (state == false && window.appStates.lifeguardFound == false) {
        // if there is no internet
        appFrame.displayNoInternetConnection();
      }
    });
    // if the service is enabled, check if a lifeguard is on the network
    if (window.appStates.serviceEnabled == true) {
      appFrame.checkIfOnLifeGuardNetwork().then((lgstate) => {
        window.appStates.lifeguardFound = lgstate;
      });
    }
    if (window.appStates.internet[0] != window.appStates.internet[1]) {
      // if the state of the internet connection changes
      logging.log('NETWORK: State has changed.');
      window.appStates.internet[1] = window.appStates.internet[0];
    }
    if (window.appStates.lifeguardFound != window.appStates.lifeguardFound_previous) {
      // if the state of a lifeguard being on the network changes
      logging.log('LIFEGUARDSTATE: State has changed.');
      window.appStates.lifeguardFound_previous = window.appStates.lifeguardFound;
    }
    // if there are undefined states
    if (window.appStates.serviceEnabled_previous === undefined) window.appStates.serviceEnabled_previous = window.appStates.serviceEnabled;
    if (window.appStates.internet[1] === undefined) window.appStates.internet[1] = window.appStates.internet[0];
    if (window.appStates.lifeguardFound_previous === undefined) window.appStates.lifeguardFound_previous = window.appStates.lifeguardFound;
    if (window.appStates.progressBarCounter == 20) {
      window.appStates.progressBarCounter = 0;
      $('#progressBar').css("height", "0px");
    }
    else if ($("#progressBar").css("height") == "20px") window.appStates.progressBarCounter += 1;
    // update the screen to show how the service state (... etc) is
    appFrame.affirmServiceState();
    window.appStates.lifeguardFound = false;
    logging.log("MAIN: end reload");
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
    global.desktop.logic.electronOpenExternal()('https://safesurfer.desk.com/how-to-uac.php');
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
  }
});

global.desktop.logic.electronIPCon('toggleAppUpdateAutoCheck', (event, arg) => {
  // if user changes the state of auto check for updates
  logging.log(String("UPDATES: Auto check state changed to " + !arg));
  if (arg == true) {
    store.set('appUpdateAutoCheck', false);
  }

  else if (arg == false) {
    store.set('appUpdateAutoCheck', true);
  }
});

global.desktop.logic.electronIPCon('betaCheck', (event, arg) => {
  // if user changes the state of auto check for updates
  logging.log(String("UPDATES: Beta state changed to " + !arg));
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
  switch(store.get('telemetryAllow')) {
    case true:
      store.set('telemetryAllow', false);
      break;
    default:
      store.set('telemetryAllow', true);
      break;
  }
});

// keep note of if the user is running as admin or not
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
if (store.get('appUpdateAutoCheck') == true && updatesEnabled == true && (os.platform() != 'linux' || BUILDMODEJSON.BUILDMODE == 'dev' || LINUXPACKAGEFORMAT.linuxpackageformat == 'appimage')) appFrame.checkForAppUpdate({
  current: false,
  showErrors: false
});

// log a message in the console for devs; yeah that's you if you're reading this :);
console.log(`> Are you a developer? Do you want to help us with this project?
Join us by going to:
  - https://gitlab.com/safesurfer/SafeSurfer-Desktop
  - http://www.safesurfer.co.nz/become-safe-safe-volunteer

Yours,
Safe Surfer team.`);

// connect button in html to a function
document.querySelector('#toggleButton').addEventListener('click', appFrame.toggleServiceState);
// add a fancy motion to the toggle button
window.desktop.logic.vanillatilt().init(document.querySelector("#toggleButton"), {
  glare: true,
  max: 65,
  speed: 400,
  transition: true,
  perspective: 50,
  reverse: true,
  "glare-prerender": true
});

if (appStates.userIsAdmin == true) {
  // initalise the rest of the app
  appFrame.initApp();
}
else {
  // since the user isn't admin, we'll keep checking just in case
  appFrame.permissionLoop();
}
