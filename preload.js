const fs = require('fs');

global.desktop = {
  buildmodejson: () => require('./buildconfig/buildmode.json'),
  loadRenderer: () => require('./renderer.js'),
}
