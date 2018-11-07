// SafeSurfer-Desktop - stat.js

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

const store = window.desktop.global.store(),
  i18n = window.desktop.global.i18n(),
  logging = window.desktop.global.logging(),
  $ = window.desktop.global.jquery();
var statHist = store.get('statHistory'),
  textBody = "",
  itemCounter = "";

// write and translate text on the main page
$("#statInfoMsg").text(i18n.__("Here's the data you've shared:"));
$("#statInfoMsg_copy").text(i18n.__("If you wish to copy any of the data, you can select and copy it from there."));
$("#optOutMsg").text(i18n.__("You can opt out at any time in the support menu."));
$("#title").text(i18n.__("View statistic data"));

// choose message to display
switch(store.get('statisticAllow')) {
  case true:
    $("#statState").text(i18n.__("You're opted in."));
    break;
  default:
    $("#statState").text(i18n.__("You're not opted in."));
    $("#optOutMsg").text(i18n.__("If you would that you want to opt in to giving statistics, you can do so in the menu."));
    break;
}

// add all items that have been shared
for (var i in statHist) {
  itemCounter = parseInt(i) + 1;
  textBody += `<h1 class="counter">${itemCounter}:</h1><p id="statDataHistory${i}" class="statDataHistory">${statHist[i]}</p>\n\n`;
}

// if there is no data shared
if (textBody !== undefined) {
  $("#statDataHistory").remove();
  if (store.get('statHistory') === undefined) {
    textBody += `<p id="statDataHistory" class="statDataHistory">${i18n.__("No data is available.")}</p>\n\n`;
    $("#statInfoMsg_copy").text('');
  }
}

// add all information
$("#dataView").append(textBody);

logging("DATASHARING PAGE: loaded");
