Name:           SafeSurfer-Desktop
Version:        1.0.0b1
Release:        1%{?dist}
Summary:        Keep safe in the digitial surf with Safe Surfer.
BuildArch:	x86_64
License:        GPLv3
Group:		Applications/Internet
URL:            https://gitlab.com/safesurfer/%{name}
Source0:        https://gitlab.com/safesurfer/%{name}/-/archive/%{version}/%{name}-%{version}.zip
Requires:       polkit, curl


%description
Keep safe in the digitial surf with Safe Surfer.


%prep
%autosetup
npm install


%build
%{__make} PACKAGEFORMAT=rpm BUILDMODE=RELEASE build-linux


%install
%{__make} DESTDIR=$RPM_BUILD_ROOT install


%files
%doc README.md
/opt/%{name}/%{name}
/opt/%{name}/blink_image_resources_200_percent.pak
/opt/%{name}/LICENSES.chromium.html
/opt/%{name}/snapshot_blob.bin
/opt/%{name}/content_resources_200_percent.pak
/opt/%{name}/locales/am.pak
/opt/%{name}/locales/cs.pak
/opt/%{name}/locales/en-US.pak
/opt/%{name}/locales/fa.pak
/opt/%{name}/locales/he.pak
/opt/%{name}/locales/it.pak
/opt/%{name}/locales/lv.pak
/opt/%{name}/locales/nl.pak
/opt/%{name}/locales/ru.pak
/opt/%{name}/locales/sw.pak
/opt/%{name}/locales/uk.pak
/opt/%{name}/locales/ar.pak
/opt/%{name}/locales/da.pak
/opt/%{name}/locales/es-419.pak
/opt/%{name}/locales/fil.pak
/opt/%{name}/locales/hi.pak
/opt/%{name}/locales/ja.pak
/opt/%{name}/locales/ml.pak
/opt/%{name}/locales/pl.pak
/opt/%{name}/locales/sk.pak
/opt/%{name}/locales/ta.pak
/opt/%{name}/locales/vi.pak
/opt/%{name}/locales/bg.pak
/opt/%{name}/locales/de.pak
/opt/%{name}/locales/es.pak
/opt/%{name}/locales/fi.pak
/opt/%{name}/locales/hr.pak
/opt/%{name}/locales/kn.pak
/opt/%{name}/locales/mr.pak
/opt/%{name}/locales/pt-BR.pak
/opt/%{name}/locales/sl.pak
/opt/%{name}/locales/te.pak
/opt/%{name}/locales/zh-CN.pak
/opt/%{name}/locales/bn.pak
/opt/%{name}/locales/el.pak
/opt/%{name}/locales/et.pak
/opt/%{name}/locales/fr.pak
/opt/%{name}/locales/hu.pak
/opt/%{name}/locales/ko.pak
/opt/%{name}/locales/ms.pak
/opt/%{name}/locales/pt-PT.pak
/opt/%{name}/locales/sr.pak
/opt/%{name}/locales/th.pak
/opt/%{name}/locales/zh-TW.pak
/opt/%{name}/locales/ca.pak
/opt/%{name}/locales/en-GB.pak
/opt/%{name}/locales/fake-bidi.pak
/opt/%{name}/locales/gu.pak
/opt/%{name}/locales/id.pak
/opt/%{name}/locales/lt.pak
/opt/%{name}/locales/nb.pak
/opt/%{name}/locales/ro.pak
/opt/%{name}/locales/sv.pak
/opt/%{name}/locales/tr.pak
/opt/%{name}/ss-logo.png
/opt/%{name}/content_shell.pak
/opt/%{name}/natives_blob.bin
/opt/%{name}/ui_resources_200_percent.pak
/opt/%{name}/icudtl.dat
/opt/%{name}/pdf_viewer_resources.pak
/opt/%{name}/version
/opt/%{name}/libffmpeg.so
/opt/%{name}/resources/app.asar
/opt/%{name}/resources/electron.asar
/opt/%{name}/views_resources_200_percent.pak
/opt/%{name}/libnode.so
/opt/%{name}/LICENSE
/usr/share/pixmaps/ss-logo.png
/usr/share/applications/%{name}.desktop
/usr/bin/sscli
/usr/share/bash-completion/completions/sscli
/usr/share/polkit-1/actions/nz.co.safesurfer.pkexec.safesurfer-desktop.policy


%postun
rm -rf /opt/SafeSurfer-Desktop


%changelog
* Fri May 25 2018 caleb
- Init to RPM
