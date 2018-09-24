const Store = require('electron-store'),
 store = new Store(),
 i18n = new (require('../scripts/i18n.js')),
 $ = require('jquery');
var teleHist = store.get('teleHistory'),
 textBody = "";

// write and translate text on the main page
$("#teleInfoMsg").text(i18n.__("Here's the data we've collected:"));
$("#optOutMsg").text(i18n.__("You can opt out at any time in the support menu."));
$("#title").text(i18n.__("View shared data"));

// choose message to display
switch(store.get('telemetryAllow')) {
  case true:
    $("#teleState").text(i18n.__("You're opted in."));
    break;
  default:
    $("#teleState").text(i18n.__("You're not opted in."));
    $("#optOutMsg").text(i18n.__("If you feel that you want to opt in, you can do so in the menu."));
    break;
}

// add all items that have been shared
for (i in teleHist) {
  textBody += `<h1 class="counter">${i}:</h1><p id="teleDataHistory${i}" class="teleDataHistory">${teleHist[i]}</p>\n\n`;
}

// if there is no data shared
if (textBody !== undefined) {
  $("#teleDataHistory").remove();
  if (store.get('teleHistory') === undefined) {
    textBody += String('<p id="teleDataHistory" class="teleDataHistory">' + i18n.__("No data is available.") + '</p>\n\n');
  }
}

// add all information
$("#dataView").append(textBody);