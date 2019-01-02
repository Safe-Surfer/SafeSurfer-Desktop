// SafeSurfer-Desktop - genwinpath.js

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

/*
  a small js file for generating Winepath of current directory in inno-script files
*/

const fs = require('fs'),
  path = require('path'),
  os = require('os');

function replaceInInnoScript({keyphrase, replacement}) {
  // find and replace in inno script file
  [path.join(".", "support", "windows", "inno-script", "build-windows-installer.iss"), path.join(".", "support", "windows", "inno-script", "build-windows-installer32.iss")].map(file => {
    console.log(`[Status] replacing '${keyphrase}' with '${replacement}' in file '${file}'.`);
    fs.readFile(file, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var re = new RegExp(keyphrase,"g");
      if (data.search(re) != -1) console.log(`[Status] found string '${keyphrase}' in '${file}'.`);
      else {
        console.log(`[Status] could not find string (${data.search(re)}) '${keyphrase}' in '${file}'.`);
        return;
      }
      var result = data.replace(re, replacement);
      fs.writeFile(file, result, 'utf8', function (err) {
         if (err) return console.log(err);
      });
    });
    console.log(`[Status] file '${file}' written to successfully.`);
  });
}

switch (process.argv[2]) {
  /*case 'revert': case 'clean':
    // WIP
    replaceInInnoScript({keyphrase: `${os.platform() === 'win32' ? "" : "Z:"}${path.win32.normalize(process.cwd())}`, replacement: "CURRENTDIRECTORY"});
    break;*/

  default:
    // update path
    replaceInInnoScript({keyphrase: "CURRENTDIRECTORY", replacement: `${os.platform() === 'win32' ? "" : "Z:"}${path.win32.normalize(process.cwd())}`});
    break;
}
