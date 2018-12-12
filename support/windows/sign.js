// SafeSurfer-Desktop - sign.js

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
  a small js file for signing Windows binaries
*/

const exec = require('child_process').execSync,
  fs = require('fs'),
  os = require('os'),
  args = process.argv.splice(2, process.argv.length),
  path = require('path');

var ewsCfg;

  if (os.platform() === 'win32') {
    // get content of .electron-windows-store file
    ewsCfg = JSON.parse(fs.readFileSync(path.join(process.env['USERPROFILE'], '.electron-windows-store')), 'utf8');
  }
  else {
    const publicKey = path.resolve(process.env['winsign_publicKey']),
      privateKey = path.resolve(process.env['winsign_privateKey']);
  }

var binary = args[0];
// if no arg is passed
if (binary === undefined) {
  console.log(`Please enter a file to sign.`);
  process.exit(1);
}
binary = path.resolve(args[0]);
// determine if the file exists
if (fs.existsSync(binary) !== true) {
    console.log(`File ${binary} not found.`);
    process.exit(1);
}

// call generated command
if (os.platform() === 'win32') exec(`cd ${ewsCfg.windowsKit} && signtool.exe sign /f ${ewsCfg.devCert} ${binary}`);
else exec(`signcode -spc ${publicKey} -v ${privateKey} -a sha1 -$ commercial -n SafeSurfer-Desktop -i https://safesurfer.co.nz/ -t http://timestamp.verisign.com/scripts/timstamp.dll -tr 10 ${binary}`);

