// SafeSurfer-Desktop - logging.js

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

// export function
exports.log = function(text) {
  // if appStates can't be found, then disable logging
  if (typeof appStates === "undefined") loggingEnable = false;
  // if appStates is found
  else loggingEnable = window.appStates.enableLogging;
  // logging is enabled via config file or variable
	if (require('../../buildconfig/buildmode.json').enableLogging == true || loggingEnable == true) console.log(text)
}
