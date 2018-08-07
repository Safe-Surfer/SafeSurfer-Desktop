Name:           Safe Surfer
Version:        1.0.0
Release:        1%{?dist}
Summary:        Keep safe in the digitial surf with Safe Surfer.
BuildArch:	noarch
License:        GPLv3
URL:            https://gitlab.com/safesurfer/%{name}
Source0:        https://gitlab.com/safesurfer/%{name}/-/archive/%{version}/%{name}-%{version}.zip
Requires:       polkit


%description
Keep safe in the digitial surf with Safe Surfer.


%prep
%autosetup


%install
%{__make} DESTDIR=$RPM_BUILD_ROOT install


%files
%license LICENSE
%doc README.md
/usr/bin/%{name}


%changelog
* Fri May 25 2018 caleb
- Init to RPM

