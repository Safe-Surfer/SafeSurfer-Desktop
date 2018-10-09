// SafeSurfer-Desktop - tele.js

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

const store = window.desktop.global.store(),
 i18n = window.desktop.global.i18n(),
 $ = window.desktop.global.jquery();
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
var itemCounter
for (i in teleHist) {
  itemCounter = parseInt(i) + 1;
  textBody += `<h1 class="counter">${itemCounter}:</h1><p id="teleDataHistory${i}" class="teleDataHistory">${teleHist[i]}</p>\n\n`;
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
