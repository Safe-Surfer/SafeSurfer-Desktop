const file = process.argv[2];

require("innosetup-compiler")(file, {
    O: 'release-builds'
}, function(error) {
    console.log(error)
});
