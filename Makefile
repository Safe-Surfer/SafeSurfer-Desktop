SHELL = /bin/bash
PREFIX = /usr/lib64/SafeSurfer-Desktop
COMPLETIONDIR = /usr/share/bash-completion/completions

all: help

configure:
	@if [[ "$(BUILDMODE)" = "RELEASE" ]]; then sed -i -e 's/"BUILDMODE": "dev"/"BUILDMODE": "release"/g' ./package.json; fi
	@if [[ "$(UPDATES)" = false ]]; then sed -i -e 's/"enableUpdates": true/"enableUpdates": false/g' ./package.json; fi

check-deps:
	@if [ ! -d node_modules ]; then echo "Whoops, you're missing node dependencies. Run 'npm i'."; exit 1; fi;

build-linux: check-deps
	npm run build:linux

build-windows: check-deps
	npm run build:win

build-macos: check-deps
	npm run build:macos

install:
	@mkdir -p $(DESTDIR)$(PREFIX)
	@mkdir -p $(DESTDIR)/usr/share/applications
	@mkdir -p $(DESTDIR)/usr/share/pixmaps
	@mkdir -p $(DESTDIR)/usr/bin
	@mkdir -p $(DESTDIR)$(COMPLETIONDIR)
	@mkdir -p $(DESTDIR)/usr/share/polkit-1/actions
	@mkdir -p $(DESTDIR)/usr/share/metainfo
	@cp -p -r ./dist/linux-unpacked/. $(DESTDIR)$(PREFIX)
	@cp ./support/linux/shared-resources/sscli $(DESTDIR)/usr/bin
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop $(DESTDIR)/usr/bin
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop.desktop $(DESTDIR)/usr/share/applications/
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop.appdata.xml $(DESTDIR)/usr/share/metainfo/
	@cp -p ./support/linux/shared-resources/sscli.completion $(DESTDIR)$(COMPLETIONDIR)/sscli
	@cp -p ./support/linux/shared-resources/nz.co.safesurfer.pkexec.safesurfer-desktop.policy $(DESTDIR)/usr/share/polkit-1/actions
	@cp ./assets/media/icons/png/2000x2000.png $(DESTDIR)/usr/share/pixmaps/ss-logo.png
	@chmod 755 $(DESTDIR)$(PREFIX)/safesurfer-desktop
	@chmod 755 $(DESTDIR)/usr/bin/sscli
	@chmod 755 $(DESTDIR)/usr/bin/SafeSurfer-Desktop
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
	@mkdir -p deb-build/safesurfer-desktop/debian/safesurfer-desktop
	@cp -p -r support/linux/debian/. deb-build/safesurfer-desktop/debian
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
	make build-linux
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

run-flatpak:
	cd ./support/linux/flatpak && flatpak-builder --run flatpak-build nz.co.safesurfer.SafeSurfer-Desktop.json /app/usr/lib64/SafeSurfer-Desktop/safesurfer-desktop

prep-appimage:
	@if [ -x "./tools/appimagetool-x86_64.AppImage" ]; then echo "appimagetool is already downloaded."; exit 1; fi;
	@mkdir -p tools/resources/libgconf tools/resources/libXScrnSaver tools/resources/curl tools/resources/zenity
	cd tools && wget https://github.com/AppImage/AppImageKit/releases/download/10/appimagetool-x86_64.AppImage && chmod +x appimagetool-x86_64.AppImage
	cd tools/resources/libgconf && wget https://mirrors.kernel.org/ubuntu/pool/main/g/gconf/libgconf-2-4_3.2.6-0ubuntu2_amd64.deb
	cd tools/resources/libgconf && ar x libgconf-2-4_3.2.6-0ubuntu2_amd64.deb && tar xvf data.tar.xz
	cd tools/resources/libXScrnSaver && wget https://kojipkgs.fedoraproject.org/packages/libXScrnSaver/1.2.3/2.fc29/x86_64/libXScrnSaver-1.2.3-2.fc29.x86_64.rpm
	cd tools/resources/libXScrnSaver && rpm2cpio libXScrnSaver-1.2.3-2.fc29.x86_64.rpm | cpio -idmv
	cd tools/resources/curl && wget https://download.opensuse.org/repositories/openSUSE:/Leap:/15.0:/Update/standard/x86_64/curl-7.60.0-lp150.2.15.1.x86_64.rpm
	cd tools/resources/curl && rpm2cpio curl-7.60.0-lp150.2.15.1.x86_64.rpm | cpio -idmv
	cd tools/resources/zenity && wget https://download.opensuse.org/repositories/openSUSE:/Leap:/15.0/standard/x86_64/zenity-3.26.0-lp150.2.5.x86_64.rpm
	cd tools/resources/zenity && rpm2cpio zenity-3.26.0-lp150.2.5.x86_64.rpm | cpio -idmv

build-appimage:
	@if [ ! -x "./tools/appimagetool-x86_64.AppImage" ]; then echo "Please run 'make prep-appimage'."; exit 1; fi;
	make BUILDMODE=$(BUILDMODE) UPDATES=$(UPDATES) configure
	make build-linux
	make DESTDIR=nz.co.safesurfer.SafeSurfer-Desktop.AppDir install
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/lib
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/local/bin/curl
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/local/bin/zenity
	@mkdir -p ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/zenity
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
	@cat ./support/linux/AppImage/SafeSurfer-Desktop.desktop.part >> ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/SafeSurfer-Desktop.desktop
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
	@cp tools/resources/curl/usr/bin/curl nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/local/bin/curl
	@cp tools/resources/zenity/usr/bin/* nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/local/bin/zenity
	@cp -r tools/resources/zenity/usr/share/zenity/. nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/zenity
	@mv ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/SafeSurfer-Desktop.desktop ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/nz.co.safesurfer.SafeSurfer-Desktop.desktop
	@mv ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/applications/SafeSurfer-Desktop.desktop ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/applications/nz.co.safesurfer.SafeSurfer-Desktop.desktop
	@mv ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/metainfo/SafeSurfer-Desktop.appdata.xml ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/metainfo/nz.co.safesurfer.SafeSurfer-Desktop.appdata.xml
	@sed -i -e "s#/usr/lib64/SafeSurfer-Desktop/safesurfer-desktop#AppRun#g" ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/nz.co.safesurfer.SafeSurfer-Desktop.desktop
	@sed -i -e "s#<id>SafeSurfer-Desktop.desktop</id>#<id>nz.co.safesurfer.SafeSurfer-Desktop.desktop</id>#g" ./nz.co.safesurfer.SafeSurfer-Desktop.AppDir/usr/share/metainfo/nz.co.safesurfer.SafeSurfer-Desktop.appdata.xml
	@if [[ "$(DISABLEINTEGRATION)" = true ]]; then touch nz.co.safesurfer.SafeSurfer-Desktop.AppDir/NOINTEGRATION; fi
	./tools/appimagetool-x86_64.AppImage $(OPTS) nz.co.safesurfer.SafeSurfer-Desktop.AppDir

build-snap:
	docker run -it --rm -v "$(shell pwd)":/build -w /build snapcore/snapcraft bash -c "(apt update && snapcraft) || bash"

build-snap-lxd:
	snapcraft cleanbuild

clean:
	@rm -rf dist deb-build release-builds flatpak-build .flatpak-builder zip-build SafeSurfer-Desktop-Linux.zip Safe_Surfer-x86_64.AppImage nz.co.safesurfer.SafeSurfer-Desktop.AppDir $(DESTDIR) ./support/linux/flatpak/generated-sources.json ./support/linux/flatpak/flatpak-npm-generator.py ./support/linux/flatpak/inline\ data ./support/linux/flatpak/flatpak-build ./support/linux/flatpak/.flatpak-builder SafeSurfer-Desktop.snapbuild dist safesurfer-desktop_*_*.snap
	@if grep -q '"BUILDMODE": "release"' ./package.json; then sed -i -e 's/"BUILDMODE": "release"/"BUILDMODE": "dev"/g' ./package.json; fi
	@if grep -q '"enableUpdates": false' ./package.json; then sed -i -e 's/"enableUpdates": false/"enableUpdates": true/g' ./package.json; fi
	@if ! grep -q "DEVIDSTUFF" ./support/macOS/entitlements.mas.plist && [[ -f "./support/macOS/entitlements.mas.plist.bak" ]]; then mv ./support/macOS/entitlements.mas.plist.bak ./support/macOS/entitlements.mas.plist; fi

slim:
	@rm -rf node_modules tools

help:
	@echo "Read 'README.md' for info on building."
