const fs = require('fs');

global.desktop = {
  buildmodejson: () => require('./buildconfig/buildmode.json'),
  loadRenderer: () => require('./renderer.js'),
  loadJQuery: () => require('./assets/scripts/jquery-3.2.1.min.js')
}