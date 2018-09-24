# SafeSurfer-Desktop

## Who is [Safe Surfer](http://safesurfer.co.nz)?
Safe Surfer's mission is to keep children, individuals, and organsations safe online. We achieve this by filtering out harmful material that may be found when browsing the internet and switching on safe search for a number of search engines.  

## App information
Safe Surfer Desktop is an Electron based app, which sets the Safe Surfer DNS settings for you (on a device, not network).  
This project's intent is for desktop users (families, persons, etc). Our aim in this project is to make it as easy as possible to get protected and be safe online.  
For enterprise/business use, it is recommmend to apply the DNS settings on a router which devices are connected to.  

![Safe Surfer](screenshots/SafeSurfer-Desktop-Activated-Standard.png)  
For more screenshots of the app, please refer to the `screenshots` folder.  

### Latest [release information](https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.0b2): version 1.0.0b2 (THIS IS A BETA)
## Install the [latest beta build](http://142.93.48.189)
We need beta testers.  
If you're wanting to beta test this software, please download the binaries or source and give it a go.  

## Features
- Toggle DNS settings through one button  
- Protects against harmful content  
- Easy to use and setup  

## Contributing
Read our [contribution guide](CONTRIBUTING.md) to get started!  
We look forward to your help on this project, together helping families and individuals stay safe on the internet!  

### Translating Safe Surfer desktop
Help us speak your language!  
Read our [translation guide](TRANSLATING.md) to get started!  

### Bugs
Wanna help us find and squash bugs?  
Check out our [bug reporting guide](BUGS.md).  

## Building
### Build dependencies
Linux: nodejs npm (libgconf2-dev on Debian based systems)  
Windows and macOS: [NodeJS package](https://nodejs.org/en/download)  

### Runtime dependencies
Linux: polkit curl (libgconf2-4 on Debian based systems)  

### Install node modules
`npm i`  

### Building binaries
Linux: `make build-linux` or `npm run package-linux`  
Windows: `make build-windows` or `npm run package-win`  
Windows 32bit: `make build-windows32` or `npm run package-win32`  
macOS: `make build-macos` or `npm run package-macos`  

Please note that building Windows versions on Linux or macOS requires Wine to be installed as a prerequisite.  

### Packaging dependencies
deb:  debhelper devscripts  
rpm:  rpmbuild  
arch: base-devel  
windows installer: [Inno Setup](http://www.jrsoftware.org/isinfo.php)  

### Packaging
deb: `make deb-pkg`  
arch: `make arch-pkg`  
rpm: use spec file in `support/linux/specs`  
appimage: `make prep-appimage && make build-appimage`  
exe: use iss file in `support\windows\build-windows-installer.iss`  
exe (32-bit): use iss file in `support\windows\build-windows-installer32.iss`  

Note: for use in inno scripts, you must adjust path to the compiled folder in the scripts (under files --> source).  

## Project notes
- Uses [jquery](https://jquery.com/)
- Uses a slightly modified version of [i18n](https://www.npmjs.com/package/i18n).js for translation
- If developing your on Windows, run nodejs command prompt as admin (as otherwise you won't be able to toggle the service)

## License
Copyright 2018 Safe Surfer, et al.  
This project is licensed under the [GPL-3.0](http://www.gnu.org/licenses/gpl-3.0.html)  
This program comes with absolutely no warrenty.  
