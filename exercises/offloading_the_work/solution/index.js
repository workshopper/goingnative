var addon = require('bindings')('myaddon')

var interval = setInterval(function () {
  process.stdout.write('.')
}, 50)

addon.delay(process.argv[2], function () {
  clearInterval(interval)
  console.log('Done!')
})

process.stdout.write('Waiting')
