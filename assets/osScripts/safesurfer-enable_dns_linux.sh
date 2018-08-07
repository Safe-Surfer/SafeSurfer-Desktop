#!/bin/bash

# safesurfer 2018

resolvconf="/etc/resolv.conf"
primaryDNS=104.197.28.121
secondaryDNS=104.155.237.225

arg="$1"

function outputmsg() {
# handle echos
msg=$@

if [ "$arg" = "-v" ]
then
	echo "$msg"
fi

}

function checkState() {
# check if DNS settings are installed already
if grep -q "$primaryDNS" "$resolvconf"
then
	return 0
else
	return 1
fi

}

if [[ ! "$(id -g)" = 0 ]]
then
	outputmsg "You must be root to use this."
	echo 3
	exit 1
fi

if [ ! -f "$resolvconf" ]
then
	outputmsg "Cannot find '$resolvconf'."
	echo 2
	exit 1
fi

if checkState
then
	outputmsg "DNS settings are already installed."
	echo -1
	exit 0
fi

mv "$resolvconf"{,.before_safesurfer}
echo -e "nameserver $primaryDNS\nnameserver $secondaryDNS" > "$resolvconf"
if checkState
then
	outputmsg "DNS settings installed successfully."
	chattr +i /etc/resolv.conf
	echo 0
	exit 0
else
	outputmsg "DNS settings failed to install; Reverting changes."
	mv "$resolvconf"{.before_safesurfer,}
	echo 1
	exit 1
fi

which systemd-resolve && systemd-resolve --flush-caches