var bindings = require('bindings')
var myaddon = bindings('myaddon')

myaddon.print(process.argv[2])
