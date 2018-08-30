# SafeSurfer-desktop

## Information
Safe Surfer Desktop is an Electron based app, which sets up the service for you (by configuring DNS settings).  
To get more information about the service use the [Safe Surfer website](http://safesurfer.co.nz).  
This project's intent is for desktop users--families, persons, etc.  
For enterprise/business use, it is recommmend to apply the DNS settings on a router which devices are connected to.  

### Latest release information: v1.0.0 - b1
## Install the release build: https://safesurfer.co.nz/download

## Features
- Set DNS settings by clicking one button  
- Protects against harmful content  
- Easy to use and setup  

## Contributing
Read our [contribution guide](CONTRIBUTING.md) to get started!  
We look forward to your help on this project, together helping families and individuals stay safe on the internet!  

## Translating Safe Surfer desktop
Read our [translation guide](TRANSLATING.md) to get started!  

## Bugs
If you have any issues or have found bugs in this software, please report to https://gitlab.com/safesurfer/SafeSurfer-Desktop/issues  

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

## Packaging
deb: `make deb-pkg`  
arch: `make arch-pkg`  
rpm: use spec file in `support/linux/specs`  
exe: use iss file in `support\windows\build-windows-installer.iss`  

## License
Copyright 2018 Safe Surfer  
Licensed under the GPLv3: http://www.gnu.org/licenses/gpl-3.0.html  
