PREFIX ?= /opt/SafeSurfer-Desktop

all: help

build-linux:
	npm run package-linux
	@mkdir -p ./release-builds/SafeSurfer-Desktop-linux-x64/assets/osScripts
	@cp ./assets/media/icons/all/ss-logo.png ./release-builds/SafeSurfer-Desktop-linux-x64/
	@cp ./assets/osScripts/safesurfer-enable_dns_linux.sh ./release-builds/SafeSurfer-Desktop-linux-x64/assets/osScripts
	@cp ./assets/osScripts/safesurfer-disable_dns_linux.sh ./release-builds/SafeSurfer-Desktop-linux-x64/assets/osScripts

build-windows:
	npm run package-win
	@mkdir -p ./release-builds/SafeSurfer-Desktop-win32-ia32/assets/osScripts
	@cp ./assets/osScripts/elevate.exe ./release-builds/SafeSurfer-Desktop-win32-ia32/assets/osScripts
	@cp ./assets/osScripts/silent.vbs ./release-builds/SafeSurfer-Desktop-win32-ia32/assets/osScripts
	@cp ./assets/media/icons/all/ss-logo.png ./release-builds/SafeSurfer-Desktop-win32-ia32
	@cp ./assets/osScripts/safesurfer-enable_dns_windows.bat ./release-builds/SafeSurfer-Desktop-win32-ia32/assets/osScripts
	@cp ./assets/osScripts/safesurfer-disable_dns_windows.bat ./release-builds/SafeSurfer-Desktop-win32-ia32/assets/osScripts

build-macos:
	npm run package-macos
	@mkdir -p ./release-builds/SafeSurfer-Desktop-darwin-x64/SafeSurfer-Desktop.app/Contents/Resources/assets/osScripts
	@cp ./assets/osScripts/safesurfer-enable_dns_macos.sh ./release-builds/SafeSurfer-Desktop-darwin-x64/SafeSurfer-Desktop.app/Contents/Resources/assets/osScripts
	@cp ./assets/osScripts/safesurfer-disable_dns_macos.sh ./release-builds/SafeSurfer-Desktop-darwin-x64/SafeSurfer-Desktop.app/Contents/Resources/assets/osScripts

install:
	@mkdir -p $(DESTDIR)$(PREFIX)
	@mkdir -p $(DESTDIR)/usr/share/applications
	@mkdir -p $(DESTDIR)/usr/bin
	@mkdir -p $(DESTDIR)$(PREFIX)/assets/osScripts
	@cp -p -r ./release-builds/SafeSurfer-Desktop-linux-x64/. $(DESTDIR)$(PREFIX)
	@cp ./support/linux/shared-resources/safesurfer-desktop $(DESTDIR)/usr/bin
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop.desktop $(DESTDIR)/usr/share/applications
	@chmod 755 $(DESTDIR)$(PREFIX)/SafeSurfer-Desktop
	@chmod 755 $(DESTDIR)/usr/bin/safesurfer-desktop

uninstall:
	@rm -rf $(DESTDIR)$(PREFIX)

prep-deb:
	@mkdir -p build/SafeSurfer-Desktop
	@cp -p -r support/linux/debian build/SafeSurfer-Desktop/debian
	@mkdir build/SafeSurfer-Desktop/debian/SafeSurfer-Desktop
	@make DESTDIR=build/SafeSurfer-Desktop/debian/SafeSurfer-Desktop install

deb-pkg: prep-deb
	@cd build/SafeSurfer-Desktop/debian && debuild -b

deb-src: prep-deb
	@cd build/SafeSurfer-Desktop/debian && debuild -S

build-zip:
	@mkdir -p build/SafeSurfer-Desktop
	@make DESTDIR=build/SafeSurfer-Desktop install
	@cd build/SafeSurfer-Desktop && zip -r ../SafeSurfer-Desktop.zip .

windows-installer:
	electron-installer-windows --src release-builds/SafeSurfer-Desktop-win32-ia32/ --dest release-builds/installers/

clean:
	@rm -rf dist build release-builds

slim:
	@rm -rf node_modules

help:
	@echo "Read 'README.md' for info on building."
