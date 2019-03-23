// SafeSurfer-Desktop - activate.js

//
// Copyright (C) 2018-2019 Caleb Woodbine <info@safesurfer.co.nz>
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

const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron')
const path = require('path')

describe('Activate service', function () {
  this.timeout(10000)

  const app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')]
  })

  beforeEach(function () {
    this.app = app
    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  const setupApp = function () {
    app.client.waitUntilWindowLoaded()
  }

  it('presses the get protected button', function () {
    return app.browserWindow.isVisible()
      .element('#toggleButton').click()
  })
})
