const execWith = require('./execWith')

/**
 * Same as ./execWith but executes twice to make sure that the vm is prewarmed.
 * and returns a delay to the result
 */
module.exports = function execWithMeasured (dir, arg, expect, options, callback) {
  if (!callback) {
    callback = options
  }

  // Run the code the first time to "warm"-up the binary loading vm
  execWith(dir, arg, expect, options, function onColdResult (err) {
    if (err) { return callback(err) }

    // Execute and measure the now warm code
    const start = Date.now()
    execWith(dir, arg, expect, options, function onWarmResult (err, pass) {
      if (err) { return callback(err) }
      callback(null, {
        duration: Date.now() - start,
        pass: pass
      })
    })
  })
}
