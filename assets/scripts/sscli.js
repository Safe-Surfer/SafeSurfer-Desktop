// SafeSurfer-Desktop - sscli.js

//
// Copyright (C) 2018 MY NAME <MY EMAIL>
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
//

const dns_changer = require('node_dns_changer');
const dns = require('dns');

function helpMenu() {
	console.log(" \
The Safe Surfer command line utility\n \
\n \
Usage: sscli [OPT] \n \
\n \
OPTS: \n \
help     print this menu \n \
enable   enable the DNS \n \
disable  disable the DNS \n \
service  check and enable as service\n \
check    check if DNS is set");
}

function service() {
	dns.lookup('check.safesurfer.co.nz', function(err, address) {
		if (address != "130.211.44.88") {
			console.log('SERVICE: Not enabled... setting up.');
			new Date();
			console.log('+++++++++++++++++++++++++++++++++++');
			dns_changer.setDNSservers({
				DNSservers:['104.197.28.121','104.155.237.225'],
				DNSbackupName:'before_safesurfer',
				loggingEnable:true
			});
			console.log('+++++++++++++++++++++++++++++++++++');
		}
		else {
			console.log('SERVICE: User is protected.')
		}
	});
	setTimeout(function() {
		service();
	}, 1000*60*10);
}

console.log('sscli\n  by \nSafe Surfer\n-----')

switch(process.argv[2]) {
	case 'enable':
		dns_changer.setDNSservers({
			DNSservers:['104.197.28.121','104.155.237.225'],
			DNSbackupName:'before_safesurfer',
			loggingEnable:true
		});
		break;
	case 'disable':
		dns_changer.restoreDNSservers({
			DNSbackupName:'before_safesurfer',
			loggingEnable:true
		});
		break;
	case 'check':
		dns.lookup('check.safesurfer.co.nz', function(err, address) {
			if (address == "130.211.44.88") {
				console.log('SERVICE: Enabled.');
			}
			else {
				console.log('SERVICE: Not enabled.');
			}
		});
		break;
	case 'launch':
		console.log('\nError: launch is only available from the bash implementation (/usr/bin/sscli)\n       Please run from given script.');
		break;
	case 'service':
		service();
		break;
	default:
		helpMenu();
		break;
}
