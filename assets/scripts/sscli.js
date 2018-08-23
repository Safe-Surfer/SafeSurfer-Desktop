const dns_changer = require('node_dns_changer');

function helpMenu() {
	console.log(" \
The Safe Surfer command line utility\n \
\n \
Usage: sscli [OPT] \n \
\n \
OPTS: \n \
help    print this menu \n \
enable  enable the DNS \n \
disable	disable the DNS")
}

console.log('sscli\n  by Safe Surfer\n-----')

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
	case 'launch':
		console.log('\nError: launch is only available from the bash implementation (/usr/bin/sscli)\n       Please run from given script.');
		break;
	default:
		helpMenu();
		break;
}
