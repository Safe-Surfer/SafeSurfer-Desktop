const dns = require('dns');

console.log('Starting DNS changer')

dns.setServers([
  '8.8.8.8',
  '8.8.4.4'
]);