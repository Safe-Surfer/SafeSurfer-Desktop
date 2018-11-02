const fs = require('fs');

Store = require('electron-store'),
 store = new Store()

global.desktop = Object.freeze({
  global: {
    jquery: () => require('jquery'),
    linuxpackageformat: process.env.LINUXPACKAGEFORMAT === undefined ? undefined : process.env.LINUXPACKAGEFORMAT,
    packageJSON: () => require('../../package.json'),
    i18n: () => new (require('./i18n.js')),
    logging: () => require('./logging.js'),
    Store: () => require('electron-store'),
    store: () => new Store(),
  },
  logic: {
    node_dns_changer: () => require('node_dns_changer'),
    os: () => require('os'),
    path: () => require('path'),
    bonjour: () => require('bonjour')(),
    request: () => require("request"),
    electron: () => require('electron'),
    electronremote: () => require('electron').remote,
    electronremoteapp: () => require('electron').remote.app,
    electronIPCon: (id, action) => require('electron').ipcRenderer.on(id, action),
    electronClipboardWriteText: (text) => require('electron').clipboard.writeText(text),
    electronOpenExternal: (link) => require('electron').shell.openExternal(link),
    dialogBox: () => require('electron').remote,
    electronIsDev: () => require('electron-is-dev'),
    copy_sscli_toTmp: (appimagePATH) => require('shelljs').cp(require('path').join(appimagePATH, 'sscli'), '/tmp/sscli-appimage'),
    remove_sscli: () => require('shelljs').rm('/tmp/sscli-appimage'),
    shelljs_which: (prog) => require('shelljs').which(prog),
    testForFile: (file) => require('shelljs').test('-f', file),
    isAdmin: () => require('is-admin')(),
    letsGetMeta: (site) => require("lets-get-meta")(site),
    moment: () => require('moment')(),
    base64Encode: () => require('nodejs-base64-encode'),
    loadLogic: () => require('./logic.js'),
    connectivity: () => require('connectivity')
  }
});


