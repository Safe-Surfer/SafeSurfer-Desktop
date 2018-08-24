# SafeSurfer-desktop

## Information
Safe Surfer Desktop is an Electron based app, which configures DNS settings for you.
To get more information about the service use the [Safe Surfer website](http://safesurfer.co.nz)

### Version: 1.0.0

## Install the release build: https://safesurfer.co.nz/download

## Features
- Set DNS settings by clicking one button
- Protects device against harmful content

## Build dependencies
Linux: nodejs npm
Windows and macOS: [NodeJS package](https://nodejs.org/en/download)

## Setting up
`npm install`
`npm i nexe`

## Building binaries
Linux: `make build-linux`
Windows: `make build-windows`
macOS: `make build-macos`
sscli: `make build-sscli`

## Linux packaging
deb: `make deb-pkg`
rpm: `make rpm-all`

## Bugs
If you have any issues or have found bugs in this software, please report to https://gitlab.com/safesurfer/SafeSurfer-Desktop/issues

## License
Copyright 2018 Safe Surfer
Licensed under the GPLv3: http://www.gnu.org/licenses/gpl-3.0.html
