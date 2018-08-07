@ECHO OFF
SETLOCAL EnableDelayedExpansion
SET adapterName=
FOR /F "tokens=* delims=:" %%a IN ('IPCONFIG ^| FIND /I "ETHERNET ADAPTER"') DO (
SET adapterName=%%a
SET adapterName=!adapterName:~17!
SET adapterName=!adapterName:~0,-1!
netsh interface ipv4 set dns name="!adapterName!" dhcp
)
ipconfig /flushdns