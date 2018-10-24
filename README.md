![license](https://img.shields.io/badge/License-GPL%20v3-blue.svg)

# SafeSurfer-Desktop

## Who is [Safe Surfer](http://safesurfer.co.nz)?
Safe Surfer's mission is to keep children, individuals, and organsations safe online. We achieve this by filtering out harmful material that may be found when browsing the internet and switching on safe search for a number of search engines.  
Read more [here](http://www.safesurfer.co.nz/the-cause).  

## App information
Safe Surfer Desktop is an Electron based app, which sets the Safe Surfer DNS settings for you (on a device, not network).  
This project's intent is for desktop users (families, persons, etc). Our aim in this project is to make it as easy as possible to get protected and be safe online.  
For enterprise/business use, it is recommmend to apply the DNS settings on a router which devices are connected to.  

![Safe Surfer](screenshots/SafeSurfer-Desktop-Activated-Standard.png)  
For more screenshots of the app, please refer to the [screenshots](screenshots) folder.  

### Latest [release information](https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.0b5): version 1.0.0b5 (THIS IS A STABLE BETA)
## Install the latest beta build
We need beta testers.  
If you're wanting to beta test this software, please download the binaries or source and give it a go.  
Our temporary site is found [here](http://142.93.48.189).  

## Features
- Toggle DNS settings through one button  
- Protects against harmful content  
- Easy to use and setup  

## Contributing
Read our [contribution guide](docs/CONTRIBUTING.md) to get started!  
We look forward to your help on this project, together helping families and individuals stay safe on the internet!  

### Translating Safe Surfer desktop
[![Translation status](https://hosted.weblate.org/widgets/safe-surfer/-/translations/svg-badge.svg)](https://hosted.weblate.org/projects/safe-surfer/translations)  

[![Translation status list](https://hosted.weblate.org/widgets/safe-surfer/-/translations/multi-auto.svg)](https://hosted.weblate.org/projects/safe-surfer/translations)  

Note: Although it might say that the translation is 100%, it may need review.  
Help us speak your language!  
Read our [translation guide](docs/TRANSLATING.md) to get started!  

### Bugs
Wanna help us find and squash bugs?  
Check out our [bug reporting guide](docs/BUGS.md).  

## Feedback
Have you used SafeSurfer-Desktop and want to give feedback?
Visit our [feedback](http://safesurfer.co.nz/feedback) site to leave us some feedback.

## Building
### Build dependencies
Linux: nodejs npm (libgconf2-dev on Debian based systems)  
Windows and macOS: [NodeJS package](https://nodejs.org/en/download)  

### Runtime dependencies
Linux: polkit curl (libgconf2-4 on Debian based systems)  

### Install node modules
`npm i`  

### Configure the build (if needed)
`make PACKAGEFORMAT=... BUILDMODE= configure`
Note: If you are packaging for a new Linux format, make sure when configuring to use 'PACKAGEFORMAT=' followed by the format type.

### Building binaries
Linux: `make build-linux` or `npm run package-linux`  
Windows: `make build-windows` or `npm run package-win`  
Windows 32bit: `make build-windows32` or `npm run package-win32`  
macOS: `make build-macos` or `npm run package-macos`  

Please note that building Windows versions on Linux or macOS requires [Wine](https://www.winehq.org) to be installed as a prerequisite, this can be installed via your distro's repos on Linux, or through brew on macOS.  

### Packaging dependencies
deb:  debhelper devscripts  
rpm:  rpmbuild  
arch: base-devel  
AppImage: rpm2cpio wget tar ar  
flatpak:
- flatpak-builder
- org.freedesktop.Sdk//1.6
- io.atom.electron.BaseApp//stable
windows installer: [Inno Setup](http://www.jrsoftware.org/isinfo.php)  

### Packaging
deb: `make deb-pkg`  
arch: `make arch-pkg` PKGBUILD in [support/linux/arch](support/linux/arch)  
rpm: use spec file in [support/linux/specs](support/linux/specs)  
appimage: `make prep-appimage && make build-appimage`  
flatpak: `make prep-flatpak && make build-flatpak` or JSON file in [support/linux/flatpak](support/linux/flatpak)
linux binary zip: `make build-linuxzip`  
exe: use iss file in [support\\windows\\inno-script](support/windows/inno-script)  

Notes:
- for use in inno scripts, you must adjust path to the compiled folder in the scripts (under files --> source).  
- Current versions of this program have been tested on openSUSE Leap 15, Windows 10 (1803, 1809), Windows 7 (SP1), Fedora 28, Ubuntu 18.04, Arch Linux, Windows 7, Windows 8.1, and macOS.  

## License
Copyright 2018 Safe Surfer.  
This project is licensed under the [GPL-3.0](http://www.gnu.org/licenses/gpl-3.0.html) and is [free software](https://www.gnu.org/philosophy/free-sw.en.html).  
This program comes with absolutely no warranty.  
