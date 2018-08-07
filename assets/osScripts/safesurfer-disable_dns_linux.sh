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

if ! checkState
then
	outputmsg "Couldn't detect any DNS servers in config."
	echo 4
	exit 0
fi


if [ ! -f "$resolvconf".before_safesurfer ]
then
	outputmsg "Cannot find '$resolvconf.before_safesurfer'."
	echo 2
	exit 1
fi

chattr -i /etc/resolv.conf
mv "$resolvconf"{.before_safesurfer,}
if ! checkState
then
	outputmsg "DNS settings removed successfully."
	echo 0
	exit 0
else
	echo "DNS settings failed to remove."
	outputmsg 1
	exit 1
fi

which systemd-resolve && systemd-resolve --flush-caches
which systemctl && which NetworkManager && systemctl restart NetworkManager