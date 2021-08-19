const bindings = require('bindings')
const myaddon = bindings('myaddon')

myaddon.print(process.argv[2])
