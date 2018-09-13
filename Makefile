PREFIX ?= /opt/SafeSurfer-Desktop
COMPLETIONDIR ?= /usr/share/bash-completion/completions

all: help

build-linux:
	@if [[ "$(BUILDMODE)" = "RELEASE" ]]; then sed -i -e 's/"BUILDMODE": "dev"/"BUILDMODE": "release"/g' ./buildconfig/buildmode.json; fi
	@echo '{"linuxpackageformat":"$(PACKAGEFORMAT)"}' > ./buildconfig/packageformat.json
	node_modules/.bin/electron-packager . SafeSurfer-Desktop --overwrite --asar --platform=linux --arch=x64 --icon=assets/media/icons/linux/ss-logo.png --prun=true --out=release-builds
	@cp ./assets/media/icons/all/ss-logo.png ./release-builds/SafeSurfer-Desktop-linux-x64/

build-windows:
	@if [[ "$(BUILDMODE)" = "RELEASE" ]]; then sed -i -e 's/"BUILDMODE": "dev"/"BUILDMODE": "release"/g' ./buildconfig/buildmode.json; fi
	node_modules/.bin/electron-packager . SafeSurfer-Desktop --overwrite --asar --platform=win32 --arch=x64 --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName=\"SafeSurfer-Desktop\"

build-windows32:
	@if [[ "$(BUILDMODE)" = "RELEASE" ]]; then sed -i -e 's/"BUILDMODE": "dev"/"BUILDMODE": "release"/g' ./buildconfig/buildmode.json; fi
	node_modules/.bin/electron-packager . SafeSurfer-Desktop --overwrite --asar --platform=win32 --arch=ia32 --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName=\"SafeSurfer-Desktop\"

build-macos:
	@if [[ "$(BUILDMODE)" = "RELEASE" ]]; then sed -i -e 's/"BUILDMODE": "dev"/"BUILDMODE": "release"/g' ./buildconfig/buildmode.json; fi
	node_modules/.bin/electron-packager . --overwrite --platform=darwin --arch=x64 --prune --out=release-builds

install:
	@mkdir -p $(DESTDIR)$(PREFIX)
	@mkdir -p $(DESTDIR)/usr/share/applications
	@mkdir -p $(DESTDIR)/usr/share/pixmaps
	@mkdir -p $(DESTDIR)/usr/bin
	@mkdir -p $(DESTDIR)$(COMPLETIONDIR)
	@mkdir -p $(DESTDIR)/usr/share/polkit-1/actions
	@cp -p -r ./release-builds/SafeSurfer-Desktop-linux-x64/. $(DESTDIR)$(PREFIX)
	@cp ./support/linux/shared-resources/sscli $(DESTDIR)/usr/bin
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop.desktop $(DESTDIR)/usr/share/applications
	@cp -p ./support/linux/shared-resources/sscli.completion $(DESTDIR)$(COMPLETIONDIR)/sscli
	@cp -p ./support/linux/shared-resources/nz.co.safesurfer.pkexec.safesurfer-desktop.policy $(DESTDIR)/usr/share/polkit-1/actions
	@cp ./assets/media/icons/all/ss-logo.png $(DESTDIR)/usr/share/pixmaps
	@chmod 755 $(DESTDIR)$(PREFIX)/SafeSurfer-Desktop
	@chmod 755 $(DESTDIR)/usr/bin/sscli
	@chmod 755 $(DESTDIR)$(COMPLETIONDIR)/sscli

uninstall:
	@rm -rf $(DESTDIR)$(PREFIX)
	@rm -rf $(DESTDIR)$(COMPLETIONDIR)/sscli
	@rm -rf $(DESTDIR)/usr/bin/sscli
	@rm -rf $(DESTDIR)/usr/share/polkit-1/actions/nz.co.safesurfer.pkexec.safesurfer-desktop.policy
	@rm -rf $(DESTDIR)/usr/share/applications/SafeSurfer-Desktop.desktop
	@rm -rf $(DESTDIR)$(COMPLETIONDIR)/sscli
	@rm -rf $(DESTDIR)/usr/share/pixmaps/ss-logo.png

prep-deb:
	make PACKAGEFORMAT=deb BUILDMODE=$(BUILDMODE) build-linux
	@mkdir -p deb-build/safesurfer-desktop
	@cp -p -r support/linux/debian/. deb-build/safesurfer-desktop/debian
	@mkdir -p deb-build/safesurfer-desktop/debian/safesurfer-desktop
	@make DESTDIR=deb-build/safesurfer-desktop/debian/safesurfer-desktop install
	@mkdir -p deb-build/safesurfer-desktop/debian/safesurfer-desktop/usr/share/doc/safesurfer-desktop
	@mv deb-build/safesurfer-desktop/debian/copyright deb-build/safesurfer-desktop/debian/safesurfer-desktop/usr/share/doc/safesurfer-desktop

deb-pkg:
	make BUILDMODE=$(BUILDMODE) prep-deb
	@cd deb-build/safesurfer-desktop/debian && debuild -b

deb-src:
	make BUILDMODE=$(BUILDMODE) prep-deb
	@cd deb-build/safesurfer-desktop/debian && debuild -S

build-zip:
	@mkdir -p deb-build/safesurfer-desktop
	@make DESTDIR=deb-build/SafeSurfer-Desktop install
	@cd deb-build/SafeSurfer-Desktop && zip -r ../SafeSurfer-Desktop.zip .

arch-pkg:
	cd ./support/linux/arch && makepkg -si

build-flatpak:
	make build-linux
	make DESTDIR=build install
	flatpak-builder flatpak-build ./support/linux/flatpak/nz.co.safesurfer.SafeSurfer-Desktop.json

compile-win-setup:
	npm run compile-win-setup

compile-win-setup32:
	npm run compile-win-setup32

clean:
	@rm -rf dist deb-build release-builds flatpak-build build .flatpak-builder

slim:
	@rm -rf node_modules

help:
	@echo "Read 'README.md' for info on building."
