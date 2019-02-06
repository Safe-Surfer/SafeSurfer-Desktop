Name:           SafeSurfer-Desktop
Version:        1.0.1
Release:        0
Summary:        Keeping you safe in the digitial surf with Safe Surfer
BuildArch:	x86_64
License:        GPL-3.0
Group:		Productivity/Networking/DNS/Utilities
URL:            https://github.com/Safe-Surfer/%{name}
Source0:	https://github.com/Safe-Surfer/SafeSurfer-Desktop/releases/download/%{version}/SafeSurfer-Desktop-Linux.zip
Requires:       polkit, curl
BuildRequires:	unzip, desktop-file-utils
%if 0%{?suse_version}
BuildRequires:  update-desktop-files
%endif

%description
Safe Surfer Desktop is an Electron based app, which sets the Safe Surfer DNS settings for you (on a device, not network).


%prep
mkdir %{name}-Linux/
unzip ../SOURCES/%{name}-Linux.zip -d ./%{name}-Linux/

%build


%install
cp -r ./%{name}-Linux/. $RPM_BUILD_ROOT/

%files
/usr/lib64/%{name}
/usr/lib64/%{name}/locales
/usr/lib64/%{name}/resources
/usr/lib64/%{name}/safesurfer-desktop
/usr/lib64/%{name}/blink_image_resources_200_percent.pak
/usr/lib64/%{name}/LICENSES.chromium.html
/usr/lib64/%{name}/snapshot_blob.bin
/usr/lib64/%{name}/content_resources_200_percent.pak
/usr/lib64/%{name}/locales/am.pak
/usr/lib64/%{name}/locales/cs.pak
/usr/lib64/%{name}/locales/en-US.pak
/usr/lib64/%{name}/locales/fa.pak
/usr/lib64/%{name}/locales/he.pak
/usr/lib64/%{name}/locales/it.pak
/usr/lib64/%{name}/locales/lv.pak
/usr/lib64/%{name}/locales/nl.pak
/usr/lib64/%{name}/locales/ru.pak
/usr/lib64/%{name}/locales/sw.pak
/usr/lib64/%{name}/locales/uk.pak
/usr/lib64/%{name}/locales/ar.pak
/usr/lib64/%{name}/locales/da.pak
/usr/lib64/%{name}/locales/es-419.pak
/usr/lib64/%{name}/locales/fil.pak
/usr/lib64/%{name}/locales/hi.pak
/usr/lib64/%{name}/locales/ja.pak
/usr/lib64/%{name}/locales/ml.pak
/usr/lib64/%{name}/locales/pl.pak
/usr/lib64/%{name}/locales/sk.pak
/usr/lib64/%{name}/locales/ta.pak
/usr/lib64/%{name}/locales/vi.pak
/usr/lib64/%{name}/locales/bg.pak
/usr/lib64/%{name}/locales/de.pak
/usr/lib64/%{name}/locales/es.pak
/usr/lib64/%{name}/locales/fi.pak
/usr/lib64/%{name}/locales/hr.pak
/usr/lib64/%{name}/locales/kn.pak
/usr/lib64/%{name}/locales/mr.pak
/usr/lib64/%{name}/locales/pt-BR.pak
/usr/lib64/%{name}/locales/sl.pak
/usr/lib64/%{name}/locales/te.pak
/usr/lib64/%{name}/locales/zh-CN.pak
/usr/lib64/%{name}/locales/bn.pak
/usr/lib64/%{name}/locales/el.pak
/usr/lib64/%{name}/locales/et.pak
/usr/lib64/%{name}/locales/fr.pak
/usr/lib64/%{name}/locales/hu.pak
/usr/lib64/%{name}/locales/ko.pak
/usr/lib64/%{name}/locales/ms.pak
/usr/lib64/%{name}/locales/pt-PT.pak
/usr/lib64/%{name}/locales/sr.pak
/usr/lib64/%{name}/locales/th.pak
/usr/lib64/%{name}/locales/zh-TW.pak
/usr/lib64/%{name}/locales/ca.pak
/usr/lib64/%{name}/locales/en-GB.pak
/usr/lib64/%{name}/locales/fake-bidi.pak
/usr/lib64/%{name}/locales/gu.pak
/usr/lib64/%{name}/locales/id.pak
/usr/lib64/%{name}/locales/lt.pak
/usr/lib64/%{name}/locales/nb.pak
/usr/lib64/%{name}/locales/ro.pak
/usr/lib64/%{name}/locales/sv.pak
/usr/lib64/%{name}/locales/tr.pak
/usr/lib64/%{name}/content_shell.pak
/usr/lib64/%{name}/natives_blob.bin
/usr/lib64/%{name}/ui_resources_200_percent.pak
/usr/lib64/%{name}/icudtl.dat
/usr/lib64/%{name}/pdf_viewer_resources.pak
/usr/lib64/%{name}/libffmpeg.so
/usr/lib64/%{name}/resources/app.asar
/usr/lib64/%{name}/resources/electron.asar
/usr/lib64/%{name}/views_resources_200_percent.pak
/usr/lib64/%{name}/libnode.so
/usr/lib64/%{name}/LICENSE.electron.txt
/usr/share/pixmaps/ss-logo.png
/usr/share/applications/SafeSurfer-Desktop.desktop
/usr/bin/sscli
/usr/bin/SafeSurfer-Desktop
/usr/share/bash-completion/completions/sscli
/usr/share/polkit-1
/usr/share/polkit-1/actions
/usr/share/polkit-1/actions/nz.co.safesurfer.pkexec.safesurfer-desktop.policy
/usr/share/metainfo
/usr/share/metainfo/SafeSurfer-Desktop.appdata.xml


%changelog
* Fri Feb 08 2019 caleb
- Changelog: https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.1

* Fri Dec 18 2019 caleb
- Changelog: https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.0

* Fri Nov 26 2018 caleb
- Changelog: https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.0rc4

* Fri Nov 14 2018 caleb
- Changelog: https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.0rc3

* Fri Nov 7  2018 caleb
- Changelog: https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.0rc2

* Fri Oct 26 2018 caleb
- Changelog: https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.0rc1

* Fri Oct 12 2018 caleb
- Changelog: https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.0b5

* Fri Oct  5 2018 caleb
- Changelog: https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.0b4

* Wed Sep 26 2018 caleb
- Changelog: https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.0b3

* Fri Sep 14 2018 caleb
- Changelog: https://gitlab.com/safesurfer/SafeSurfer-Desktop/tags/1.0.0b2

* Mon Sep 10 2018 caleb
- Init to RPM