# Building
### Build dependencies
Linux: nodejs npm (libgconf2-dev on Debian based systems)  
Windows and macOS: [NodeJS package](https://nodejs.org/en/download)  

### Runtime dependencies
Linux:  
- `polkit`  
- `curl` or `wget`  
- `libgconf2-4` (on Debian based systems)  
These are required to run, and should be included somewhere when packaging.  

### Install node modules
`npm i`  

### Run from source
`npm start`  

### Configure the build (if needed)
`make UPDATES=true configure`  
i.e: `make UPDATES=false configure`  
Notes:
- UPDATES refers to the functionality of the app where it can check for a new version. Make sure you disable updates, since it will be handled by your package manager

### Building binaries
Linux: `npm run build:linux` or `make build-linux`  
Windows: `npm run build:win` or `make build-windows`  
macOS: `npm run build:macos` or `make build-macos`  

Please note that building Windows versions on Linux or macOS requires [Wine](https://www.winehq.org) to be installed as a prerequisite, this can be installed via your distro's repos on Linux, or through brew on macOS.  

### Sign Windows binaries
`npm run sign-win-exe [file]`  
Sign Windows binaries so Windows smartscreen doesn't freakout.  

### Packaging dependencies
.app (macOS): [Xcode](https://itunes.apple.com/app/xcode/id497799835) or `xcode-select --install`  
AppImage: `rpm2cpio wget tar ar` via your package manager  
AppX: [Windows 10 SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk), also is a good idea to have [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) + [Ubuntu](https://www.microsoft.com/en-us/p/ubuntu/9nblggh4msv6?activetab=pivot:overviewtab) or [Git bash](https://git-scm.com/downloads) installed to make things easier.  
deb: `debhelper devscripts` (or equvilent) via your package manager  
flatpak: `flatpak-builder` via your package manager, `org.freedesktop.Sdk//1.6` and `io.atom.electron.BaseApp//stable` (depending on JSON file) via flathub or equvilent store  
rpm: `rpmbuild` via your package manager  
snap: `snapcraft lxd build-essential` or `docker` via your package manager  
Windows installer: [Inno Setup](http://www.jrsoftware.org/isinfo.php)  

Notes:
- [LINUX] You may need to specify SSCLILOCATION as an environment variable followed by the directory of which `sscli` should be located in a package, to get the app to see and use it

### Packaging
##### Linux
AppImage: `make prep-appimage && make build-appimage`  
deb: `make deb-pkg`/`make deb-src`  
flatpak: `make prep-flatpak && make build-flatpak` or JSON file in [support/linux/flatpak](support/linux/flatpak)  
linux binary zip: `make build-linuxzip`  
rpm: use spec file in [support/linux/specs](support/linux/specs)  
snap: `make build-snap`  

##### Windows
AppX (32-bit/64-bit): `bash -c 'make UPDATES=false configure' && npm run build:appx`  
exe (installer and portable exe): `npm run build:win`  

##### macOS
dmg and zip: `make build-macos`  

Notes:
- building AppImage without the integration, use `make prep-appimage && make DISABLEINTEGRATION=true build-appimage`  
