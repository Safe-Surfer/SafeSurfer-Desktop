# Building
### Build dependencies
Linux: nodejs npm (libgconf2-dev on Debian based systems)  
Windows and macOS: [NodeJS package](https://nodejs.org/en/download)  

### Runtime dependencies
Linux:  
- `polkit`  
- `curl` or `wget`  
- `libgconf2-4` (on Debian based systems)  

### Install node modules
`npm i`  

### Run from source
`npm start`  
or if on Windows  
`npm run startNa`  

### Configure the build (if needed)
`make BUILDMODE=DEV UPDATES=true configure`  
i.e: `make BUILDMODE=RELEASE UPDATES=false configure`  
Notes:
- BUILDMODE let's the app know if it's a release build or a dev build  
- Make sure you disable updates, since it will be handled by your package manager

### Building binaries
Linux: `make build-linux` or `npm run package-linux`  
Windows: `make build-windows` or `npm run package-win`  
Windows 32bit: `make build-windows32` or `npm run package-win32`  
macOS: `make build-macos` or `npm run package-macos`  

Please note that building Windows versions on Linux or macOS requires [Wine](https://www.winehq.org) to be installed as a prerequisite, this can be installed via your distro's repos on Linux, or through brew on macOS.  

### Packaging dependencies
deb: `debhelper devscripts`  
rpm: `rpmbuild`  
AppImage: `rpm2cpio wget tar ar`  
snap: `snapcraft lxd build-essential`  
flatpak:  
- `flatpak-builder`  
- `org.freedesktop.Sdk//1.6`  
- `io.atom.electron.BaseApp//stable` (depending on JSON file)  
windows installer: [Inno Setup](http://www.jrsoftware.org/isinfo.php)  

Notes:
- You may need to specify SSCLILOCATION as an environment variable followed by the directory of which `sscli` should be located in a package, to get the app to see and use it

### Packaging
deb: `make deb-pkg`  
rpm: use spec file in [support/linux/specs](support/linux/specs)  
appimage: `make prep-appimage && make build-appimage`  
flatpak: `make prep-flatpak && make build-flatpak` or JSON file in [support/linux/flatpak](support/linux/flatpak)  
linux binary zip: `make build-linuxzip`  
exe: use iss file in [support\\windows\\inno-script](support/windows/inno-script)  

Notes:
- for use in inno scripts, you must adjust path to the compiled folder in the scripts (under files --> source).  
- building AppImage without the integration, use `make prep-appimage && make DISABLEINTEGRATION=true build-appimage`  
