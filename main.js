// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron');
const shell = require('electron').shell;
const electron = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let childWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 550,
    height: 600,
    minWidth: 550,
    minHeight: 600,
    icon: path.join(__dirname, 'ss-logo.png')
  });

  /*childWindow = new BrowserWindow({
  	width: 400,
  	height: 500,
  	parent: mainWindow,
  	modal: true,
  	show: false
  });*/

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');
  //childWindow.loadURL('http://check.safesurfer.co.nz/');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  /*childWindow.on('close', function() {
    childWindow.hide();
  });*/

    var menu = Menu.buildFromTemplate([
      {
          label: 'General',
          submenu: [
              {label:'Sites of concern', click() {childWindow.show()} },
              {label:'Launch Safe Surfer Service Check Page in a browser', click() {shell.openExternal('http://check.safesurfer.co.nz/')} },
              {label:'Force enable', click() {enableServicePerPlatform()} },
              {type:'separator'},
              {label:'Exit', click() {app.quit()}, accelerator: 'CmdOrCtrl+Q' }
          ]
      },
      {
          label: 'Support',
          submenu: [
          	{label:'Report a bug', click() {shell.openExternal('https://safesurfer.desk.com/')} },
          	{label: 'Dev tools', click() {mainWindow.webContents.openDevTools()} }
          ]

      },
      {
          label: 'Info',
          submenu: [
          	{label:'About us', click() {shell.openExternal('http://www.safesurfer.co.nz/the-cause/')} },
                {type:'separator'},
          	{label:'Help', click() {shell.openExternal('https://www.safesurfer.co.nz/faqs/')}, accelerator: 'CmdOrCtrl+H' }
          ]

      }
  ])
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
