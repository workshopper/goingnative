const bindings = require('bindings')

var binding

try {
  binding = bindings({ module_root: process.argv[2], bindings: 'test' })
} catch (e) {
  console.error('Could not properly compile test addon, error finding binding: ' + e.message)
}

console.log('Found compiled test binding file')

if (!binding) {
  console.error('Could not properly compile test addon, did not load binding')
}

if (binding.test !== 'OK') {
  console.error('Could not properly compile test addon, binding did not behave properly')
}

