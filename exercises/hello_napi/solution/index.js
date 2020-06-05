const bindings = require('bindings')
const myaddon = bindings('myaddon')

const greeting = myaddon.hello()
console.log(greeting)
