var addon = require('bindings')('myaddon')

addon.delay(process.argv[2], function () {
  console.log('Done!')
})
