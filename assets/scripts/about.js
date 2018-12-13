// SafeSurfer-Desktop - about.js

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

const packageJSON = window.desktop.global.packageJSON(),
  APPBUILD = packageJSON.APPBUILD,
  version = packageJSON.version,
  BUILDMODE = packageJSON.appOptions.BUILDMODE,
  i18n = window.desktop.global.i18n(),
  logging = window.desktop.global.logging(),
  $ = window.desktop.global.jquery();

// function to make \n multiline
$.fn.multiline = function(text) {
  this.html(text);
  this.html(this.html().replace(/\n/g,'<br/>'));
  return this;
}

// update title
$("#title").text(i18n.__("About this app"));

// update description text
$('#description').multiline(`${i18n.__("Version")} ${version}; ${i18n.__("Build")}: ${APPBUILD} (${BUILDMODE}).\n&copy; 2018 Safe Surfer, et al.\n\n${i18n.__('This program comes with absolutely no warranty.')}\n${i18n.__('See the GNU General Public License, version 3 or later for details.')}`);

function shrinkLogo() {
  $("#ss-logo").css("height", "180px");
  $("#ss-logo").css("width", "180px");
  $("#ss-logo").css("filter", "blur(9px)");
  $("#ss-waves").css("filter", "blur(0px)");
}

function growLogo() {
  $("#ss-logo").css("height", "200px");
  $("#ss-logo").css("width", "200px");
  $("#ss-logo").css("filter", "blur(0px)");
  $("#ss-waves").css("filter", "blur(5px)");
}

logging("[about]: loaded");
