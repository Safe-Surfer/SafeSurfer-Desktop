var myarray = ['a','b','c','d'];
var command_split = myarray[0];
var command_arg = [];
for (var i=1; i<myarray.length; i++) {
	command_arg.push(myarray[i]);
}

console.log(command_split);
console.log(command_arg);