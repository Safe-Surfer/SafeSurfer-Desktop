const BUILDMODEJSON = require('../../buildconfig/buildmode.json'),
 APPBUILD = BUILDMODEJSON.APPBUILD,
 APPVERSION = BUILDMODEJSON.APPVERSION,
 BUILDMODE = BUILDMODEJSON.BUILDMODE,
 enableNotifications = BUILDMODEJSON.enableNotifications,
 requireRoot = BUILDMODEJSON.requireRoot;

$.fn.multiline = function(text, rt){
    this.html(text);
    this.html(this.html().replace(/\n/g,'<br/>'));
    return this;
}
$('#description').multiline(String("v" + APPVERSION + ":" + APPBUILD + "\n &copy; 2018 Safe Surfer, et al."));