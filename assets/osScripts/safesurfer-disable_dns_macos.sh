#!/bin/bash

cacheFile="/Library/Caches/safesurfer-olddns.txt"

IFS=', ' read -r -a oldDNSservers <<< "$(cat $cacheFile)"

function outputmsg() {
# handle echos
msg="$@"

if [ "$arg" = "-v" ]
then
	echo "$msg"
fi

}

if [[ ! "$(id -g)" = 0 ]]
then
	outputmsg "You must be root to use this."
	echo 3
	exit 1
fi

if [ ! -f /Library/Caches/safesurfer-olddns.txt ]
then
	outputmsg "Error: Cannot find old DNS cache file."
	echo 2
	exit 1
fi

for interface in $(networksetup -listallnetworkservices | sed 1,1d)
do
	echo "$interface"
	networksetup -setdnsservers "$interface" "${oldDNSservers[@]}"
done
