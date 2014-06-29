var binding = require('bindings')('myaddon')

console.log(binding.length(process.argv[2]))
