const Store = require('electron-store'),
 store = new Store(),
 i18n = new (require('../scripts/i18n.js'));
var teleHist = store.get('teleHistory'),
 textBody = "";
$("#teleInfoMsg").text(i18n.__("Here's your data:"));
switch(store.get('telemetryAllow')) {
  case true:
    $("#teleState").text(i18n.__("You're opted in."));
    break;
  default:
    $("#teleState").text(i18n.__("You're not opted in."));
    break;
}
for (i in teleHist) {
  textBody += `<h1 class="counter">${i}:</h1><p id="teleDataHistory${i}" class="teleDataHistory">${JSON.stringify(teleHist[i])}</p>\n\n`;
}
if (textBody !== undefined) {
  $("#teleDataHistory").remove();
  if (store.get('teleHistory') === undefined) {
    textBody += String('<p id="teleDataHistory" class="teleDataHistory">' + i18n.__("No data is available.") + '</p>\n\n');
  }
}
$("body").append(textBody);