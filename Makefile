PREFIX ?= /opt/SafeSurfer-Desktop
COMPLETIONDIR ?= /usr/share/bash-completion/completions

all: help

build-linux:
	@echo '{"linuxpackageformat":"$(PACKAGEFORMAT)"}' > ./buildconfig/packageformat.json
	npm run package-linux
	@cp ./assets/media/icons/all/ss-logo.png ./release-builds/SafeSurfer-Desktop-linux-x64/

build-windows:
	@[ $(ARCH) != 32 ] && npm run package-win || npm run package-win32
	@cp -p ./assets/media/icons/all/ss-logo.png ./release-builds/SafeSurfer-Desktop*/

build-macos:
	npm run package-macos

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
	make PACKAGEFORMAT=deb build-linux
	@mkdir -p deb-build/safesurfer-desktop
	@cp -p -r support/linux/debian/. deb-build/safesurfer-desktop/debian
	@mkdir -p deb-build/safesurfer-desktop/debian/safesurfer-desktop
	@make DESTDIR=deb-build/safesurfer-desktop/debian/safesurfer-desktop install
	@mkdir -p deb-build/safesurfer-desktop/debian/safesurfer-desktop/usr/share/doc/safesurfer-desktop
	@mv deb-build/safesurfer-desktop/debian/copyright deb-build/safesurfer-desktop/debian/safesurfer-desktop/usr/share/doc/safesurfer-desktop

deb-pkg: prep-deb
	@cd deb-build/safesurfer-desktop/debian && debuild -b

deb-src: prep-deb
	@cd deb-build/safesurfer-desktop/debian && debuild -S

build-zip:
	@mkdir -p deb-build/safesurfer-desktop
	@make DESTDIR=deb-build/SafeSurfer-Desktop install
	@cd deb-build/SafeSurfer-Desktop && zip -r ../SafeSurfer-Desktop.zip .

arch-pkg:
	cd ./support/linux/arch && makepkg -si

setup:
	npm i
	npm i nexe

clean:
	@rm -rf dist deb-build release-builds

slim:
	@rm -rf node_modules

help:
	@echo "Read 'README.md' for info on building."
