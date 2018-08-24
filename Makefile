PREFIX ?= /opt/SafeSurfer-Desktop
COMPLETIONDIR ?= /usr/share/bash-completion/completions

all: help

build-linux:
	@echo '{"linuxpackageformat":"$(PACKAGEFORMAT)"}' > ./buildconfig/packageformat.json
	npm run package-linux
	@mkdir -p ./release-builds/SafeSurfer-Desktop-linux-x64/assets/osScripts
	@cp ./assets/media/icons/all/ss-logo.png ./release-builds/SafeSurfer-Desktop-linux-x64/
	@make build-sscli
	@mv ./release-builds/sscli ./release-builds/SafeSurfer-Desktop-linux-x64

build-windows:
	npm run package-win
	@mkdir -p ./release-builds/SafeSurfer-Desktop-win32-ia32/assets/osScripts
	@cp ./assets/media/icons/all/ss-logo.png ./release-builds/SafeSurfer-Desktop-win32-ia32
	@make build-sscli
	@mv ./release-builds/sscli ./release-builds/SafeSurfer-Desktop-win32-ia32/sscli.exe

build-macos:
	npm run package-macos
	@mkdir -p ./release-builds/SafeSurfer-Desktop-darwin-x64/SafeSurfer-Desktop.app/Contents/Resources/assets/osScripts
	@make build-sscli
	@mv ./release-builds/sscli ./release-builds/SafeSurfer-Desktop-darwin-x64

build-sscli:
	@mkdir -p ./release-builds
	npm run nexe assets/scripts/sscli.js
	mv sscli ./release-builds/sscli

install:
	@mkdir -p $(DESTDIR)$(PREFIX)
	@mkdir -p $(DESTDIR)/usr/share/applications
	@mkdir -p $(DESTDIR)/usr/share/pixmaps
	@mkdir -p $(DESTDIR)/usr/bin
	@mkdir -p $(DESTDIR)$(COMPLETIONDIR)
	@mkdir -p $(DESTDIR)$(PREFIX)/assets/osScripts
	@cp -p -r ./release-builds/SafeSurfer-Desktop-linux-x64/. $(DESTDIR)$(PREFIX)
	@cp ./support/linux/shared-resources/sscli $(DESTDIR)/usr/bin
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop.desktop $(DESTDIR)/usr/share/applications
	@cp ./support/linux/shared-resources/SafeSurfer-Desktop-sudo.sh $(DESTDIR)$(PREFIX)/SafeSurfer-Desktop-sudo.sh
	@cp -p ./support/linux/shared-resources/sscli.completion $(DESTDIR)$(COMPLETIONDIR)/sscli
	@cp ./assets/media/icons/all/ss-logo.png $(DESTDIR)/usr/share/pixmaps
	@chmod 755 $(DESTDIR)$(PREFIX)/SafeSurfer-Desktop
	@chmod 755 $(DESTDIR)$(PREFIX)/SafeSurfer-Desktop-sudo.sh
	@chmod 755 $(DESTDIR)/usr/bin/sscli
	@chmod 755 $(DESTDIR)$(COMPLETIONDIR)/sscli

uninstall:
	@rm -rf $(DESTDIR)$(PREFIX)
	@rm -rf $(DESTDIR)$(COMPLETIONDIR)/sscli
	@rm -rf $(DESTDIR)/usr/bin/sscli

prep-deb:
	make PACKAGEFORMAT=deb build-linux
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

rpm-all:
	@mkdir -p $HOME/rpmbuild/{BUILD,BUILDROOT,RPMS,SOURCES,SPECS,SRPMS}
	rpmbuild -ba ./support/linux/specs/safesurfer-desktop.spec

arch:
	cd ./support/linux/arch && makepkg -si

setup:
	npm i
	npm i nexe

clean:
	@rm -rf dist build release-builds

slim:
	@rm -rf node_modules

help:
	@echo "Read 'README.md' for info on building."
