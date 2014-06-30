const cpr    = require('cpr')
    , fs     = require('fs')
    , path   = require('path')
    , after  = require('after')
    , rimraf = require('rimraf')


// copy their submission into two tmp directories that we can mess with and test without
// touching their original
function copyTemp (toDirs) {
  return function (mode, callback) {
    var exercise = this
      , done     = after(toDirs.length, function (err) {
          if (err)
            return callback(err)

          callback(null, true)
        })

    toDirs.forEach(function (dir) {
      cpr(exercise.submission, dir, done)
    })
  }
}


// don't leave the tmp dirs
function cleanup (dirs) {
  return function (mode, pass, callback) {
    var done = after(dirs.length, callback)

    dirs.forEach(function (dir) {
      rimraf(dir, done)
    })
  }
}


module.exports = cpr
module.exports.copyTemp = copyTemp
module.exports.cleanup  = cleanup