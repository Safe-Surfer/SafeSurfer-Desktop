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
`make BUILDMODE=DEV UPDATES=true configure`  
i.e: `make BUILDMODE=RELEASE UPDATES=false configure`  
Notes:
- BUILDMODE let's the app know if it's a release build or a dev build  
- Make sure you disable updates, since it will be handled by your package manager

### Building binaries
Linux: `make build-linux` or `npm run build:linux`  
Windows: `make build-windows` or `npm run build:win`  
macOS: `make build-macos` or `npm run build:macos`  

Please note that building Windows versions on Linux or macOS requires [Wine](https://www.winehq.org) to be installed as a prerequisite, this can be installed via your distro's repos on Linux, or through brew on macOS.  

### Sign Windows binaries
`npm run sign-win-exe [file]`  
Sign Windows binaries so Windows smartscreen doesn't freakout.  

### Packaging dependencies
.app (macOS): [Xcode](https://itunes.apple.com/app/xcode/id497799835) or `xcode-select --install`  
AppImage: `rpm2cpio wget tar ar`  
AppX: [Windows 10 SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk), also is a good idea to have [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) + [Ubuntu](https://www.microsoft.com/en-us/p/ubuntu/9nblggh4msv6?activetab=pivot:overviewtab) or [Git bash](https://git-scm.com/downloads) installed to make things easier.  
deb: `debhelper devscripts`  
flatpak:  
- `flatpak-builder`  
- `org.freedesktop.Sdk//1.6`  
- `io.atom.electron.BaseApp//stable` (depending on JSON file)  
rpm: `rpmbuild`  
snap: `snapcraft lxd build-essential` or `docker`  
Windows installer: [Inno Setup](http://www.jrsoftware.org/isinfo.php)  

Notes:
- You may need to specify SSCLILOCATION as an environment variable followed by the directory of which `sscli` should be located in a package, to get the app to see and use it

### Packaging
AppImage: `make prep-appimage && make build-appimage`  
AppX (32-bit): `bash -c 'make BUILDMODE=release UPDATES=false configure' && npm run package-win-appx32 && npm run sign-win-exe release-builds\\safesurferdesktop-win32-ia32\\safesurferdesktop.exe && npm run build-win-appx32`  
AppX: `bash -c 'make BUILDMODE=release UPDATES=false configure' && npm run package-win-appx && npm run sign-win-exe release-builds\\safesurferdesktop-win32-ia32\\safesurferdesktop.exe && npm run build-win-appx`  
deb: `make deb-pkg`  
dmg: `make build-macos-dmg`  
exe: use iss file in [support\\windows\\inno-script](support/windows/inno-script)  
flatpak: `make prep-flatpak && make build-flatpak` or JSON file in [support/linux/flatpak](support/linux/flatpak)  
linux binary zip: `make build-linuxzip`  
rpm: use spec file in [support/linux/specs](support/linux/specs)  
snap: `make build-snap`  

Notes:
- for use in inno scripts, you must adjust path to the compiled folder in the scripts (under files --> source).  
- building AppImage without the integration, use `make prep-appimage && make DISABLEINTEGRATION=true build-appimage`  
