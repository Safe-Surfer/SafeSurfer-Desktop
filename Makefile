SHELL := /bin/bash
PREFIX ?= /opt/SafeSurfer-Desktop
COMPLETIONDIR ?= /usr/share/bash-completion/completions

all: help

check-deps:
	@if [ ! -d node_modules ]; then echo "Whoops, you're missing node dependencies. Run 'npm i'."; exit 1; fi;

build-linux: check-deps
	@if [[ "$(BUILDMODE)" = "RELEASE" ]]; then sed -i -e 's/"BUILDMODE": "dev"/"BUILDMODE": "release"/g' ./buildconfig/buildmode.json; fi
	@if [[ ! -z "$(PACKAGEFORMAT)" ]]; then echo '{"linuxpackageformat":"$(PACKAGEFORMAT)"}' > ./buildconfig/packageformat.json; fi;
	node_modules/.bin/electron-packager . SafeSurfer-Desktop --overwrite --asar --platform=linux --arch=x64 --icon=assets/media/icons/png/2000x2000.png --prun=true --out=release-builds

build-windows: check-deps
	@if [[ "$(BUILDMODE)" = "RELEASE" ]]; then sed -i -e 's/"BUILDMODE": "dev"/"BUILDMODE": "release"/g' ./buildconfig/buildmode.json; fi
	node_modules/.bin/electron-packager . SafeSurfer-Desktop --overwrite --asar --platform=win32 --arch=x64 --icon=assets/media/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName=\"SafeSurfer-Desktop\"

build-windows32: check-deps
	@if [[ "$(BUILDMODE)" = "RELEASE" ]]; then sed -i -e 's/"BUILDMODE": "dev"/"BUILDMODE": "release"/g' ./buildconfig/buildmode.json; fi
	node_modules/.bin/electron-packager . SafeSurfer-Desktop --overwrite --asar --platform=win32 --arch=ia32 --icon=assets/media/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName=\"SafeSurfer-Desktop\"

build-macos: check-deps
	@if [[ "$(BUILDMODE)" = "RELEASE" ]]; then sed -i -e 's/"BUILDMODE": "dev"/"BUILDMODE": "release"/g' ./buildconfig/buildmode.json; fi
	node_modules/.bin/electron-packager . --overwrite --platform=darwin --arch=x64 --icon=assets/media/icons/mac/icon.icns --prune --out=release-builds

install:
	@mkdir -p $(DESTDIR)$(PREFIX)
	@mkdir -p $(DESTDIR)/usr/share/applications
	@mkdir -p $(DESTDIR)/usr/share/pixmaps
	@mkdir -p $(DESTDIR)/usr/bin
	@mkdir -p $(DESTDIR)$(COMPLETIONDIR)
	@mkdir -p $(DESTDIR)/usr/share/polkit-1/actions
	@mkdir -p $(DESTDIR)/usr/share/metainfo
	@cp -p -r ./release-builds/SafeSurfer-Desktop-linux-x64/. $(DESTDIR)$(PREFIX)
	@cp ./support/linux/shared-resources/sscli $(DESTDIR)/usr/bin
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop.desktop $(DESTDIR)/usr/share/applications/
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop.appdata.xml $(DESTDIR)/usr/share/metainfo/
	@cp -p ./support/linux/shared-resources/sscli.completion $(DESTDIR)$(COMPLETIONDIR)/sscli
	@cp -p ./support/linux/shared-resources/nz.co.safesurfer.pkexec.safesurfer-desktop.policy $(DESTDIR)/usr/share/polkit-1/actions
	@cp ./assets/media/icons/png/2000x2000.png $(DESTDIR)/usr/share/pixmaps/ss-logo.png
	@chmod 755 $(DESTDIR)$(PREFIX)/SafeSurfer-Desktop
	@chmod 755 $(DESTDIR)/usr/bin/sscli
	@chmod 755 $(DESTDIR)$(COMPLETIONDIR)/sscli

uninstall:
	@rm -rf $(DESTDIR)$(PREFIX)
	@rm -rf $(DESTDIR)$(COMPLETIONDIR)/sscli
	@rm -rf $(DESTDIR)/usr/bin/sscli
	@rm -rf $(DESTDIR)/usr/share/polkit-1/actions/nz.co.safesurfer.pkexec.safesurfer-desktop.policy
	@rm -rf $(DESTDIR)/usr/share/metainfo/SafeSurfer-Desktop.appdata.xml
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
	@mkdir -p zip-build
	@make DESTDIR=zip-build install
	@cd zip-build && zip -r ../SafeSurfer-Desktop-Linux.zip .

arch-pkg:
	cd ./support/linux/arch && makepkg -si

build-flatpak:
	make build-linux
	make DESTDIR=build install
	flatpak-builder flatpak-build ./support/linux/flatpak/nz.co.safesurfer.SafeSurfer-Desktop.json

prep-appimage:
	@mkdir -p tools
	cd tools && wget https://github.com/AppImage/AppImageKit/releases/download/10/appimagetool-x86_64.AppImage && chmod +x appimagetool-x86_64.AppImage

build-appimage:
	@if [ ! -x "./tools/appimagetool-x86_64.AppImage" ]; then echo "Please run 'make prep-appimage'."; exit 1; fi;
	make PACKAGEFORMAT=appimage BUILDMODE=$(BUILDMODE) build-linux
	make DESTDIR=SafeSurferDesktop.AppDir install
	@mkdir -p ./SafeSurferDesktop.AppDir/usr/share/icons/hicolor/16x16/apps
	@mkdir -p ./SafeSurferDesktop.AppDir/usr/share/icons/hicolor/24x24/apps
	@mkdir -p ./SafeSurferDesktop.AppDir/usr/share/icons/hicolor/32x32/apps
	@mkdir -p ./SafeSurferDesktop.AppDir/usr/share/icons/hicolor/48x48/apps
	@mkdir -p ./SafeSurferDesktop.AppDir/usr/share/icons/hicolor/64x64/apps
	@mkdir -p ./SafeSurferDesktop.AppDir/usr/share/icons/hicolor/128x128/apps
	@mkdir -p ./SafeSurferDesktop.AppDir/usr/share/icons/hicolor/256x256/apps
	@mkdir -p ./SafeSurferDesktop.AppDir/usr/share/icons/hicolor/512x512/apps
	@mkdir -p ./SafeSurferDesktop.AppDir/usr/share/icons/hicolor/1024x1024/apps
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop.desktop SafeSurferDesktop.AppDir/nz.co.safesurfer.SafeSurferDesktop.desktop
	@cp ./assets/media/icons/png/16x16.png SafeSurferDesktop.AppDir/usr/share/icons/hicolor/16x16/apps/ss-logo.png
	@cp ./assets/media/icons/png/24x24.png SafeSurferDesktop.AppDir/usr/share/icons/hicolor/24x24/apps/ss-logo.png
	@cp ./assets/media/icons/png/32x32.png SafeSurferDesktop.AppDir/usr/share/icons/hicolor/32x32/apps/ss-logo.png
	@cp ./assets/media/icons/png/48x48.png SafeSurferDesktop.AppDir/usr/share/icons/hicolor/48x48/apps/ss-logo.png
	@cp ./assets/media/icons/png/64x64.png SafeSurferDesktop.AppDir/usr/share/icons/hicolor/64x64/apps/ss-logo.png
	@cp ./assets/media/icons/png/128x128.png SafeSurferDesktop.AppDir/usr/share/icons/hicolor/128x128/apps/ss-logo.png
	@cp ./assets/media/icons/png/256x256.png SafeSurferDesktop.AppDir/usr/share/icons/hicolor/256x256/apps/ss-logo.png
	@cp ./assets/media/icons/png/512x512.png SafeSurferDesktop.AppDir/usr/share/icons/hicolor/512x512/apps/ss-logo.png
	@cp ./assets/media/icons/png/1024x1024.png SafeSurferDesktop.AppDir/usr/share/icons/hicolor/1024x1024/apps/ss-logo.png
	@cp ./assets/media/icons/png/256x256.png SafeSurferDesktop.AppDir/ss-logo.png
	@cp ./support/linux/shared-resources/AppRun SafeSurferDesktop.AppDir
	@mv ./SafeSurferDesktop.AppDir/usr/share/applications/SafeSurfer-Desktop.desktop ./SafeSurferDesktop.AppDir/usr/share/applications/nz.co.safesurfer.SafeSurferDesktop.desktop
	@mv ./SafeSurferDesktop.AppDir/usr/share/metainfo/SafeSurfer-Desktop.appdata.xml ./SafeSurferDesktop.AppDir/usr/share/metainfo/nz.co.safesurfer.SafeSurferDesktop.appdata.xml
	@chmod +x SafeSurferDesktop.AppDir/AppRun
	@sed -i -e "s#/opt/SafeSurfer-Desktop/SafeSurfer-Desktop#AppRun#g" ./SafeSurferDesktop.AppDir/nz.co.safesurfer.SafeSurferDesktop.desktop
	@sed -i -e "s#<id>SafeSurferDesktop.desktop</id>#<id>nz.co.safesurfer.SafeSurferDesktop.desktop</id>#g" ./SafeSurferDesktop.AppDir/usr/share/metainfo/nz.co.safesurfer.SafeSurferDesktop.appdata.xml
	./tools/appimagetool-x86_64.AppImage $(OPTS) SafeSurferDesktop.AppDir

prepare-rpm-bin:
	make PACKAGEFORMAT=rpm BUILDMODE=$(BUILDMODE) build-linux

compile-win-setup:
	npm run compile-win-setup

compile-win-setup32:
	npm run compile-win-setup32

clean:
	@rm -rf dist deb-build release-builds flatpak-build build .flatpak-builder zip-build SafeSurfer-Desktop-Linux.zip Safe_Surfer-x86_64.AppImage SafeSurferDesktop.AppDir $(DESTDIR)
	@echo '{"linuxpackageformat":""}' > buildconfig/packageformat.json

slim:
	@rm -rf node_modules tools

help:
	@echo "Read 'README.md' for info on building."
