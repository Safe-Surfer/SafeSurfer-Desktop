@ECHO OFF
SETLOCAL EnableDelayedExpansion
SET adapterName=
FOR /F "tokens=* delims=:" %%a IN ('IPCONFIG ^| FIND /I "ETHERNET ADAPTER"') DO (
SET adapterName=%%a
SET adapterName=!adapterName:~17!
SET adapterName=!adapterName:~0,-1!
netsh interface ipv4 set dns name="!adapterName!" static 104.197.28.121 primary
netsh interface ipv4 add dns name="!adapterName!" 104.155.237.225 index=2
)
ipconfig /flushdns
