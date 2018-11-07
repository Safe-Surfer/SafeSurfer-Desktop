SHELL := /bin/bash
PREFIX := /usr/lib64/SafeSurfer-Desktop
COMPLETIONDIR := /usr/share/bash-completion/completions

all: help

configure:
	@if [[ "$(BUILDMODE)" = "RELEASE" ]]; then sed -i -e 's/"BUILDMODE": "dev"/"BUILDMODE": "release"/g' ./package.json; fi
	@if [[ "$(UPDATES)" = false ]]; then sed -i -e 's/"enableUpdates": true/"enableUpdates": false/g' ./package.json; fi

check-deps:
	@if [ ! -d node_modules ]; then echo "Whoops, you're missing node dependencies. Run 'npm i'."; exit 1; fi;

build-linux: check-deps
	node_modules/.bin/electron-packager . SafeSurfer-Desktop --overwrite --asar --platform=linux --arch=x64 --icon=assets/media/icons/png/2000x2000.png --prun=true --out=release-builds

build-linux32: check-deps
	node_modules/.bin/electron-packager . SafeSurfer-Desktop --overwrite --asar --platform=linux --arch=ia32 --icon=assets/media/icons/png/2000x2000.png --prun=true --out=release-builds

build-windows: check-deps
	node_modules/.bin/electron-packager . SafeSurfer-Desktop --overwrite --asar --platform=win32 --arch=x64 --icon=assets/media/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName=\"SafeSurfer-Desktop\"

build-windows32: check-deps
	node_modules/.bin/electron-packager . SafeSurfer-Desktop --overwrite --asar --platform=win32 --arch=ia32 --icon=assets/media/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName=\"SafeSurfer-Desktop\"

build-macos: check-deps
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
	make BUILDMODE=$(BUILDMODE) UPDATES=false configure
	make build-linux
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

build-linuxzip:
	make BUILDMODE=$(BUILDMODE) UPDATES=false configure
	@mkdir -p zip-build
	@make DESTDIR=zip-build install
	@cd zip-build && zip -r ../SafeSurfer-Desktop-Linux.zip .

arch-pkg:
	cd ./support/linux/arch && makepkg -si

prep-flatpak:
	cd ./support/linux/flatpak && wget https://raw.githubusercontent.com/flatpak/flatpak-builder-tools/master/npm/flatpak-npm-generator.py
	cd ./support/linux/flatpak && python3 flatpak-npm-generator.py ../../../package-lock.json

build-flatpak:
	cd ./support/linux/flatpak && flatpak-builder flatpak-build nz.co.safesurfer.SafeSurfer-Desktop.json --force-clean

prep-appimage:
	@if [ -x "./tools/appimagetool-x86_64.AppImage" ]; then echo "appimagetool is already downloaded."; exit 1; fi;
	@mkdir -p tools/resources/libgconf
	@mkdir -p tools/resources/libXScrnSaver
	cd tools && wget https://github.com/AppImage/AppImageKit/releases/download/10/appimagetool-x86_64.AppImage && chmod +x appimagetool-x86_64.AppImage
	cd tools/resources/libgconf && wget http://mirrors.kernel.org/ubuntu/pool/main/g/gconf/libgconf-2-4_3.2.6-0ubuntu2_amd64.deb
	cd tools/resources/libgconf && ar x libgconf-2-4_3.2.6-0ubuntu2_amd64.deb && tar xvf data.tar.xz
	cd tools/resources/libXScrnSaver && wget http://dl.fedoraproject.org/pub/fedora/linux/releases/27/Everything/x86_64/os/Packages/l/libXScrnSaver-1.2.2-13.fc27.x86_64.rpm
	cd tools/resources/libXScrnSaver && rpm2cpio libXScrnSaver-1.2.2-13.fc27.x86_64.rpm | cpio -idmv

build-appimage:
	@if [ ! -x "./tools/appimagetool-x86_64.AppImage" ]; then echo "Please run 'make prep-appimage'."; exit 1; fi;
	make BUILDMODE=$(BUILDMODE) UPDATES=$(UPDATES) configure
	make build-linux
	make DESTDIR=nz.co.safesurfer.SafeSurfer-Desktop.AppDir install
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/lib
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/16x16/apps
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/24x24/apps
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/32x32/apps
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/48x48/apps
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/64x64/apps
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/128x128/apps
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/256x256/apps
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/512x512/apps
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/1024x1024/apps
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop.desktop nz.co.safesurfer.SafeSurfer-Desktop.AppDir/SafeSurfer-Desktop.desktop
	@cp ./assets/media/icons/png/16x16.png nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/16x16/apps/ss-logo.png
	@cp ./assets/media/icons/png/24x24.png nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/24x24/apps/ss-logo.png
	@cp ./assets/media/icons/png/32x32.png nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/32x32/apps/ss-logo.png
	@cp ./assets/media/icons/png/48x48.png nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/48x48/apps/ss-logo.png
	@cp ./assets/media/icons/png/64x64.png nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/64x64/apps/ss-logo.png
	@cp ./assets/media/icons/png/128x128.png nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/128x128/apps/ss-logo.png
	@cp ./assets/media/icons/png/256x256.png nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/256x256/apps/ss-logo.png
	@cp ./assets/media/icons/png/512x512.png nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/512x512/apps/ss-logo.png
	@cp ./assets/media/icons/png/1024x1024.png nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/icons/hicolor/1024x1024/apps/ss-logo.png
	@cp ./assets/media/icons/png/256x256.png nz.co.safesurfer.SafeSurfer-Desktop.AppDir/ss-logo.png
	@cp ./support/linux/AppImage/AppRun nz.co.safesurfer.SafeSurfer-Desktop.AppDir
	@chmod +x nz.co.safesurfer.SafeSurfer-Desktop.AppDir/AppRun
	@cp -r tools/resources/libgconf/usr/lib/x86_64-linux-gnu/. nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/lib
	@cp -r tools/resources/libXScrnSaver/usr/lib64/. nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/lib64
	@mv ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/SafeSurfer-Desktop.desktop ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/nz.co.safesurfer.SafeSurfer-Desktop.desktop
	@mv ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/applications/SafeSurfer-Desktop.desktop ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/applications/nz.co.safesurfer.SafeSurfer-Desktop.desktop
	@mv ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/metainfo/SafeSurfer-Desktop.appdata.xml ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/metainfo/nz.co.safesurfer.SafeSurfer-Desktop.appdata.xml
	@sed -i -e "s#/usr/lib64/SafeSurfer-Desktop/SafeSurfer-Desktop#AppRun#g" ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/nz.co.safesurfer.SafeSurfer-Desktop.desktop
	@sed -i -e "s#<id>SafeSurfer-Desktop.desktop</id>#<id>nz.co.safesurfer.SafeSurfer-Desktop.desktop</id>#g" ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/metainfo/nz.co.safesurfer.SafeSurfer-Desktop.appdata.xml
	@if [ $(DISABLEINTEGRATION) = true ]; then sed -i -e "s,#exit # Uncomment to disable integration,exit,g" ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/AppRun; fi
	./tools/appimagetool-x86_64.AppImage $(OPTS) nz.co.safesurfer.SafeSurfer-Desktop.AppDir

prepare-rpm-bin:
	make BUILDMODE=$(BUILDMODE) configure
	make build-linux

compile-win-setup:
	npm run compile-win-setup

compile-win-setup32:
	npm run compile-win-setup32

clean:
	@rm -rf dist deb-build release-builds flatpak-build build .flatpak-builder zip-build SafeSurfer-Desktop-Linux.zip Safe_Surfer-x86_64.AppImage nz.co.safesurfer.SafeSurfer-Desktop.AppDir $(DESTDIR) ./support/linux/flatpak/generated-sources.json ./support/linux/flatpak/flatpak-npm-generator.py ./support/linux/flatpak/inline\ data ./support/linux/flatpak/flatpak-build ./support/linux/flatpak/.flatpak-builder
	@if grep -q '"BUILDMODE": "release"' ./package.json; then sed -i -e 's/"BUILDMODE": "release"/"BUILDMODE": "dev"/g' ./package.json; fi
	@if grep -q '"enableUpdates": false' ./package.json; then sed -i -e 's/"enableUpdates": false/"enableUpdates": true/g' ./package.json; fi

slim:
	@rm -rf node_modules tools

help:
	@echo "Read 'README.md' for info on building."
