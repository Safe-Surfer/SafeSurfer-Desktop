#!/usr/bin/node
// SafeSurfer-Desktop - findLifeGuard.js

//
// Copyright (C) 2018 Caleb Woodbine <info@safesurfer.co.nz>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

const bonjour = require('bonjour')()

var count = 0,
 lgState = false;

async function findLifeGuard() {
  return new Promise((resolve, reject) => {
    console.log('[checkIfOnLifeGuardNetwork]: Checking if on lifeguard network');
    // start searching for lifeguard with bonjour
    bonjour.findOne({type: "sslifeguard"}, (service) => {
      // if a lifeguard is found
      if (service.fqdn.indexOf('_sslifeguard._tcp') != -1) {
        console.log(`[checkIfOnLifeGuardNetwork]: found ${service.fqdn}`);
        resolve(true);
      }
    });
  });
}

function loop() {
  setTimeout(() => {
    findLifeGuard().then((state) => {
      console.log("TRUE STATE:",state);
      lgState = state;
    });
    console.log("State:", lgState);
    console.log("Count:", count);
    lgState = false;
    count ++;
    loop();
  }, 3000);
}

loop();
