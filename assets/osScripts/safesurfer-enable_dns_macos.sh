#!/bin/bash

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

ipconfig getpacket en0 | perl -ne'/domain_name_server.*: \{(.*)}/ && print join " ", split /,\s*/, $1' > /Library/Caches/safesurfer-olddns.txt

for interface in $(networksetup -listallnetworkservices | sed 1,1d)
do
	networksetup -setdnsservers "$interface" 104.197.28.121 104.155.237.225
done
