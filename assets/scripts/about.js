const BUILDMODEJSON = require('../../buildconfig/buildmode.json'),
 APPBUILD = BUILDMODEJSON.APPBUILD,
 APPVERSION = BUILDMODEJSON.APPVERSION,
 BUILDMODE = BUILDMODEJSON.BUILDMODE,
 enableNotifications = BUILDMODEJSON.enableNotifications,
 requireRoot = BUILDMODEJSON.requireRoot,
 i18n = new (require('../scripts/i18n.js'));

$.fn.multiline = function(text, rt){
    this.html(text);
    this.html(this.html().replace(/\n/g,'<br/>'));
    return this;
}
$('#description').multiline(String(i18n.__("Version") + " " + APPVERSION + "; " + i18n.__("Build") + " " + APPBUILD + "\n &copy; 2018 Safe Surfer, et al."));