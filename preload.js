const fs = require('fs');

Store = require('electron-store'),
 store = new Store()

global.desktop = Object.freeze({
  global: {
    jquery: () => require('jquery'),
    linuxpackageformat: () => require('./buildconfig/packageformat.json'),
    buildmodejson: () => require('./buildconfig/buildmode.json'),
    i18n: () => new (require('./assets/scripts/i18n.js')),
    Store: () => require('electron-store'),
    store: () => new Store(),
  },
  logic: {
    node_dns_changer: () => require('node_dns_changer'),
    os: () => require('os'),
    path: () => require('path'),
    bonjour: () => require('bonjour')(),
    request: () => require("request"),
    logging: () => require('./assets/scripts/logging.js'),
    electron: () => require('electron'),
    electronremote: () => require('electron').remote,
    electronremoteapp: () => require('electron').remote.app,
    electronIPCon: (id, action) => require('electron').ipcRenderer.on(id, action),
    electronClipboardWriteText: (text) => require('electron').clipboard.writeText(text),
    electronOpenExternal: () => require('electron').shell.openExternal,
    dialogBox: () => require('electron').remote,
    electronIsDev: () => require('electron-is-dev'),
    copy_sscli_toTmp: (appimagePATH) => require('shelljs').cp(require('path').join(appimagePATH, 'sscli'), '/tmp/sscli-appimage'),
    remove_sscli: () => require('shelljs').rm('/tmp/sscli-appimage'),
    checkFor_sscli: () => require('shelljs').test('/tmp/sscli-appimage'),
    isAdmin: () => require('is-admin')(),
    letsGetMeta: () => require("lets-get-meta"),
    isOnline: () => require('is-online')(),
    moment: () => require('moment')(),
    base64Encode: () => require('nodejs-base64-encode'),
    loadLogic: () => require('./assets/scripts/logic.js'),
    vanillatilt: () => require('vanilla-tilt')
  }
});

