# SafeSurfer-Desktop

## Who are [Safe Surfer](http://safesurfer.co.nz)?
Safe Surfer's mission is to keep children, individuals, and organsations safe online. We achieve this by filtering out harmful material that may be found when browsing the internet and switching on safe search for a number of search engines.

## App information
Safe Surfer Desktop is an Electron based app, which sets the Safe Surfer DNS settings for you (on a device, not network).  
This project's intent is for desktop users--families, persons, etc.  
For enterprise/business use, it is recommmend to apply the DNS settings on a router which devices are connected to.  

### Latest [release information](CHANGELOG): version 1.0.0 (build 1)
## Install the release build: https://safesurfer.co.nz/download

![Safe Surfer](screenshots/SafeSurfer-Desktop-Activated-Standard.png)

## Features
- Set DNS settings to protect device by the clicking of one button  
- Protects against harmful content  
- Easy to use and setup  

## Contributing
Read our [contribution guide](CONTRIBUTING.md) to get started!  
We look forward to your help on this project, together helping families and individuals stay safe on the internet!  

## Translating Safe Surfer desktop
Read our [translation guide](TRANSLATING.md) to get started!  

## Bugs
If you have any issues or have found bugs in this software, please them report to https://gitlab.com/safesurfer/SafeSurfer-Desktop/issues  

## Screenshots
For screenshots of the app, please refer to the `screenshots` folder.  

## Build dependencies
Linux: nodejs npm (libgconf2-dev on Debian based systems)  
Windows and macOS: [NodeJS package](https://nodejs.org/en/download)  

## Packaging dependencies
deb:  debhelper devscripts  
rpm:  rpmbuild  
arch: base-devel  
windows installer: [Inno Setup](http://www.jrsoftware.org/isinfo.php)

## Runtime dependencies
Linux: polkit curl

## Setting up build and development environment
`npm i`  

## Building binaries
Linux: `make build-linux`  
Windows: `make build-windows`  
Windows 32bit: `make build-windows32`  
macOS: `make build-macos`  

Please note that building Windows versions on Linux or macOS requires Wine to be installed as a prerequisite  

## Packaging
deb: `make deb-pkg`  
arch: `make arch-pkg`  
rpm: use spec file in `support/linux/specs`  
exe: use iss file in `support\windows\build-windows-installer.iss`  

## License
Copyright 2018 Safe Surfer  
Licensed under the GPLv3: http://www.gnu.org/licenses/gpl-3.0.html  
