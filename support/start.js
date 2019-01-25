#!/usr/bin/node

// SafeSurfer-Desktop - start.js

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
  a small js file for:
    > npm start
*/

const os = require('os')
const path = require('path')

// Setting up env variables
if (os.platform() === 'linux') process.env.SSCLILOCATION = `${process.cwd()}/support/linux/shared-resources/`
require('child_process').exec(`${path.join('node_modules', '.bin', 'electron')} . ${process.argv[2]}`, (err, stdout, stderr) => {
  console.log(stdout)
  if (err || stderr) console.log(`[callProgram]: output error - ${err} - ${stderr}`)
})
