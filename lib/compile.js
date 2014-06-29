const gyp = require('./gyp')


// run a `node-gyp rebuild` on their unmolested code in our copy
function checkCompile (dir) {
  return function  (mode, callback) {
    var exercise = this

    if (!exercise.passed)
      return callback(null, true) // shortcut if we've already had a failure

    gyp.rebuild(dir, function (err) {
      if (err) {
        exercise.emit('fail', err.message)
        return callback(null, false)
      }

      callback(null, true)
    })
  }
}


module.exports.checkCompile = checkCompile