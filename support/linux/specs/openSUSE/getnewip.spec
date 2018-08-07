Name:           easy-deauth
Version:        1.1
Release:        1%{?dist}
Summary:        Send deauth packages to your favourite devices on your private WiFi network.
BuildArch:	noarch
License:        GPLv3
URL:            https://gitlab.com/BobyMCbobs/%{name}
Source0:        https://gitlab.com/BobyMCbobs/%{name}/-/archive/%{version}/%{name}-%{version}.zip
Requires:       net-tools, aircrack-ng


%description
Send deauth packages to your favourite devices on your private WiFi network.


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

