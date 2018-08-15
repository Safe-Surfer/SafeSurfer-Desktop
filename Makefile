PREFIX ?= /opt/SafeSurfer-Desktop

all: help

build-linux: build-background-service
	npm run package-linux
	@mkdir -p ./release-builds/SafeSurfer-Desktop-linux-x64/assets/osScripts
	@cp ./assets/media/icons/all/ss-logo.png ./release-builds/SafeSurfer-Desktop-linux-x64/
	@cp ./assets/osScripts/safesurfer-enable_dns_linux.sh ./release-builds/SafeSurfer-Desktop-linux-x64/assets/osScripts
	@cp ./assets/osScripts/safesurfer-disable_dns_linux.sh ./release-builds/SafeSurfer-Desktop-linux-x64/assets/osScripts
	@mv ./release-builds/ss-background ./release-builds/SafeSurfer-Desktop-linux-x64

build-windows: build-background-service
	npm run package-win
	@mkdir -p ./release-builds/SafeSurfer-Desktop-win32-ia32/assets/osScripts
	@cp ./assets/osScripts/elevate.exe ./release-builds/SafeSurfer-Desktop-win32-ia32/assets/osScripts
	@cp ./assets/osScripts/silent.vbs ./release-builds/SafeSurfer-Desktop-win32-ia32/assets/osScripts
	@cp ./assets/media/icons/all/ss-logo.png ./release-builds/SafeSurfer-Desktop-win32-ia32
	@cp ./assets/osScripts/safesurfer-enable_dns_windows.bat ./release-builds/SafeSurfer-Desktop-win32-ia32/assets/osScripts
	@cp ./assets/osScripts/safesurfer-disable_dns_windows.bat ./release-builds/SafeSurfer-Desktop-win32-ia32/assets/osScripts
	@mv ./release-builds/ss-background ./release-builds/SafeSurfer-Desktop-win32-ia32/ss-background.exe

build-macos: build-background-service
	npm run package-macos
	@mkdir -p ./release-builds/SafeSurfer-Desktop-darwin-x64/SafeSurfer-Desktop.app/Contents/Resources/assets/osScripts
	@cp ./assets/osScripts/safesurfer-enable_dns_macos.sh ./release-builds/SafeSurfer-Desktop-darwin-x64/SafeSurfer-Desktop.app/Contents/Resources/assets/osScripts
	@cp ./assets/osScripts/safesurfer-disable_dns_macos.sh ./release-builds/SafeSurfer-Desktop-darwin-x64/SafeSurfer-Desktop.app/Contents/Resources/assets/osScripts
	@mv ./release-builds/ss-background ./release-builds/SafeSurfer-Desktop-darwin-x64

build-background-service:
	@mkdir -p ./release-builds
	npm run nexe assets/scripts/service.js
	mv service ./release-builds/ss-background

install:
	@mkdir -p $(DESTDIR)$(PREFIX)
	@mkdir -p $(DESTDIR)/usr/share/applications
	@mkdir -p $(DESTDIR)/usr/share/pixmaps
	@mkdir -p $(DESTDIR)/usr/bin
	@mkdir -p $(DESTDIR)$(PREFIX)/assets/osScripts
	@cp -p -r ./release-builds/SafeSurfer-Desktop-linux-x64/. $(DESTDIR)$(PREFIX)
	@cp ./support/linux/shared-resources/safesurfer-desktop $(DESTDIR)/usr/bin
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop.desktop $(DESTDIR)/usr/share/applications
	@cp ./assets/media/icons/all/ss-logo.png $(DESTDIR)/usr/share/pixmaps
	@chmod 755 $(DESTDIR)$(PREFIX)/SafeSurfer-Desktop
	@chmod 755 $(DESTDIR)/usr/bin/safesurfer-desktop

uninstall:
	@rm -rf $(DESTDIR)$(PREFIX)

prep-deb:
	@mkdir -p build/safesurfer-desktop
	@cp -p -r support/linux/debian build/safesurfer-desktop/debian
	@mkdir build/safesurfer-desktop/debian/safesurfer-desktop
	@make DESTDIR=build/safesurfer-desktop/debian/safesurfer-desktop install

deb-pkg: prep-deb
	@cd build/safesurfer-desktop/debian && debuild -b

deb-src: prep-deb
	@cd build/safesurfer-desktop/debian && debuild -S

build-zip:
	@mkdir -p build/safesurfer-desktop
	@make DESTDIR=build/SafeSurfer-Desktop install
	@cd build/SafeSurfer-Desktop && zip -r ../SafeSurfer-Desktop.zip .

setup:
	npm i
	npm i nexe

clean:
	@rm -rf dist build release-builds

slim:
	@rm -rf node_modules

help:
	@echo "Read 'README.md' for info on building."
