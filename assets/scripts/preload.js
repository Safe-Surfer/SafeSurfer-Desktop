var Store = require('electron-store'),
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
    loadLogic: () => require('./logic.js')
  },
  logic: {
    node_dns_changer: require('node_dns_changer'),
    bonjour: require('bonjour')(),
    request: () => require('request'),
    electron: () => require('electron'),
    electronremote: () => require('electron').remote,
    electronremoteapp: () => require('electron').remote.app,
    electronIPCon: (id, action) => require('electron').ipcRenderer.on(id, action),
    electronClipboardWriteText: (text) => require('electron').clipboard.writeText(text),
    electronOpenExternal: (link) => require('electron').shell.openExternal(link),
    dialogBox: () => require('electron').remote,
    shelljs_which: (prog) => require('shelljs').which(prog),
    shelljs_test: require('shelljs').test,
    isAdmin: () => require('is-admin')(),
    letsGetMeta: (site) => require('lets-get-meta')(site),
    moment: () => require('moment')(),
    base64Encode: () => require('nodejs-base64-encode'),
    connectivity: () => require('connectivity')
  }
});
