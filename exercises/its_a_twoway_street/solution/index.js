const addon = require('bindings')('myaddon')

console.log(addon.length(process.argv[2]))
