// SafeSurfer-Desktop - about.js

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

const BUILDMODEJSON = require('../../buildconfig/buildmode.json'),
 APPBUILD = BUILDMODEJSON.APPBUILD,
 APPVERSION = BUILDMODEJSON.APPVERSION,
 BUILDMODE = BUILDMODEJSON.BUILDMODE,
 enableNotifications = BUILDMODEJSON.enableNotifications,
 requireRoot = BUILDMODEJSON.requireRoot,
 i18n = new (require('../scripts/i18n.js')),
 $ = require('jquery');

// function to make \n multiline
$.fn.multiline = function(text, rt){
    this.html(text);
    this.html(this.html().replace(/\n/g,'<br/>'));
    return this;
}

// update title
$("#title").text(i18n.__("About this app"));

// update description text
$('#description').multiline(String(i18n.__("Version") + " " + APPVERSION + "; " + i18n.__("Build") + " " + APPBUILD + " (" + BUILDMODE + ")" + "\n &copy; 2018 Safe Surfer, et al. \n\n" + i18n.__('This program comes with absolutely no warranty.') + "\n" + i18n.__('See the GNU General Public License, version 3 or later for details.')));

function shrinkLogo() {
  $("#ss-logo").css("height", "180px");
  $("#ss-logo").css("width", "180px");
}
function growLogo() {
  $("#ss-logo").css("height", "200px");
  $("#ss-logo").css("width", "200px");
}
