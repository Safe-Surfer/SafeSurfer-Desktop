// SafeSurfer-Desktop - main.js

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

// import libraries
const {app, BrowserWindow, Menu, clipboard, globalShortcut, ipcMain} = require('electron'),
  path = require('path'),
  windowStateKeeper = require('electron-window-state'),
  packageJSON = require('../../package.json'),
  isBeta = packageJSON.appOptions.isBeta,
  args = process.argv.slice(process.argv[1] !== '.' ? 1 : 2, process.argv.length);

let mainWindow;

function createWindow() {
  // Create the browser window.
  let mainWindowState = windowStateKeeper({
    defaultWidth: 480,
    defaultHeight: 600
  });

  var windowObj = {
    /* set default sizing */
    width: mainWindowState.width,
    height: mainWindowState.height,
    /* set minimum standard sizing */
    minWidth: 480,
    minHeight: 600,
    /* set default position sizing */
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    title: 'Safe Surfer',
    show: false,
    icon: path.join(__dirname, 'assets', 'media', 'icons', 'png', '2000x2000.png'),
    webPreferences: {
      nodeIntegration: !packageJSON.appOptions.disableNodeIntegration,
      preload: path.join(__dirname, 'preload.js')
    }
  }

  // if app is a beta, add message beta to title
  if (isBeta == true) windowObj.title += " (beta)";
  mainWindow = new BrowserWindow(windowObj);

  // load in main html document
  mainWindow.loadFile(path.join(__dirname, '..', 'html', 'index.html'));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // set menu from menu.js
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(require('./menu.js')(app, mainWindow))
  );
  mainWindowState.manage(mainWindow);
  mainWindow.setAutoHideMenuBar(false);
  mainWindow.setMenuBarVisibility(true);
}

// create window when app is ready
app.on('ready', function(window) {
  switch (args[0]) {
    case '-v': case '--version': case 'version': case '/v': case '/version':
      console.log(`SafeSurfer-Desktop ${packageJSON.version}:${packageJSON.APPBUILD}`);
      app.quit();
      break;

    default:
      createWindow();
      break;
  }
});

// reload the menu on command
ipcMain.on('updateAppMenu', (event, arg) => {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(require('./menu.js')(app, mainWindow))
  );
});

// use Ctrl^H or Cmd^H to toggle menu bar
app.on('browser-window-created', (event, window) => {
  window.setAutoHideMenuBar(true);
  window.setMenuBarVisibility(false);
  globalShortcut.register('CmdOrCtrl+H', () => {
    window.setAutoHideMenuBar(!window.isMenuBarAutoHide());
    window.setMenuBarVisibility(!window.isMenuBarVisible());
  });
});

// behave like a macOS app, don't quit when user presses the red button
app.on('window-all-closed', function() {
  app.quit();
});

// if the window still hasn't been created
app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});
