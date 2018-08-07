PREFIX ?= /opt/safesurfer-desktop

all: help

build-linux:
	npm run package-linux
	@mkdir -p ./release-builds/safesurfer-desktop-linux-x64/scripts
	@cp ./assets/media/icons/all/ss-logo.png ./release-builds/safesurfer-desktop-linux-x64/
	@cp ./assets/osScripts/safesurfer-enable_dns_linux.sh ./release-builds/safesurfer-desktop-linux-x64/scripts
	@cp ./assets/osScripts/safesurfer-disable_dns_linux.sh ./release-builds/safesurfer-desktop-linux-x64/scripts

build-windows:
	npm run package-win
	@mkdir -p ./release-builds/safesurfer-desktop-win32-ia32/scripts
	@cp ./assets/osScripts/elevate.exe ./release-builds/safesurfer-desktop-win32-ia32/scripts
	@cp ./assets/osScripts/silent.vbs ./release-builds/safesurfer-desktop-win32-ia32/scripts
	@cp ./assets/media/icons/all/ss-logo.png ./release-builds/safesurfer-desktop-win32-ia32
	@cp ./assets/osScripts/safesurfer-enable_dns_windows.bat ./release-builds/safesurfer-desktop-win32-ia32/scripts
	@cp ./assets/osScripts/safesurfer-disable_dns_windows.bat ./release-builds/safesurfer-desktop-win32-ia32/scripts

build-macos:
	npm run package-macos
	@mkdir -p ./release-builds/safesurfer-desktop-darwin-x64/safesurfer-desktop.app/Contents/Resources/scripts
	cp ./assets/osScripts/safesurfer-enable_dns_macos.sh ./release-builds/safesurfer-desktop-darwin-x64/safesurfer-desktop.app/Contents/Resources/scripts
	cp ./assets/osScripts/safesurfer-disable_dns_macos.sh ./release-builds/safesurfer-desktop-darwin-x64/safesurfer-desktop.app/Contents/Resources/scripts

install:
	@mkdir -p $(DESTDIR)$(PREFIX)
	@mkdir -p $(DESTDIR)/usr/share/applications
	@mkdir -p $(DESTDIR)/usr/bin
	@mkdir -p $(DESTDIR)$(PREFIX)/scripts
	@cp -p -r ./release-builds/safesurfer-desktop-linux-x64/. $(DESTDIR)$(PREFIX)
	@cp ./support/linux/shared-resources/safesurfer-desktop $(DESTDIR)/usr/bin
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop.desktop $(DESTDIR)/usr/share/applications
	@chmod 755 $(DESTDIR)$(PREFIX)/safesurfer-desktop
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
	@make DESTDIR=build/safesurfer-desktop install
	@cd build/safesurfer-desktop && zip -r ../safesurfer-desktop.zip .

windows-installer:
	electron-installer-windows --src release-builds/safesurfer-desktop-win32-ia32/ --dest release-builds/installers/

clean:
	@rm -rf dist build release-builds

slim:
	@rm -rf node_modules

help:
	@echo "Read 'README.md' for info on building."
