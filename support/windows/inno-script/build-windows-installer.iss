; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{88718D55-5716-4973-A16B-CBEFDF4A5132}
AppName=SafeSurfer-Desktop
AppVersion=1.0.0rc2
;AppVerName=SafeSurfer-Desktop 1.0.0rc2
AppPublisher=Safe Surfer
AppPublisherURL=http://www.safesurfer.co.nz
AppSupportURL=http://www.safesurfer.co.nz
AppUpdatesURL=http://www.safesurfer.co.nz
DefaultDirName={pf}\SafeSurfer-Desktop
DisableDirPage=yes
DisableProgramGroupPage=yes
OutputBaseFilename=SafeSurfer-Desktop-Installer
SetupIconFile=Z:\root\build\SafeSurfer-Desktop-1.0.0rc2\assets\media\icons\win\icon.ico
Compression=lzma
SolidCompression=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 0,6.1

[Files]
Source: "Z:\root\build\SafeSurfer-Desktop-1.0.0rc2\release-builds\SafeSurfer-Desktop-win32-x64\safesurfer-desktop.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "Z:\root\build\SafeSurfer-Desktop-1.0.0rc2\release-builds\SafeSurfer-Desktop-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{commonprograms}\SafeSurfer-Desktop"; Filename: "{app}\SafeSurfer-Desktop.exe"
Name: "{commondesktop}\SafeSurfer-Desktop"; Filename: "{app}\SafeSurfer-Desktop.exe"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\SafeSurfer-Desktop"; Filename: "{app}\SafeSurfer-Desktop.exe"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\SafeSurfer-Desktop.exe"; Description: "{cm:LaunchProgram,SafeSurfer-Desktop}"; Flags: nowait postinstall skipifsilent
