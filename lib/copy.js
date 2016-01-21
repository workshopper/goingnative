const cpr    = require('cpr')
    , fs     = require('fs')
    , path   = require('path')
    , after  = require('after')
    , rimraf = require('rimraf')

      // where node_modules/bindings is so it can be copied to make a submission compilable
const bindingsDir     = path.dirname(require.resolve('bindings'))
      // where node_modules/nan is so it can be copied to make a submission compilable
    , nanDir          = path.dirname(require.resolve('nan'))


// copy their submission into two tmp directories that we can mess with and test without
// touching their original
function copyTemp (toDirs) {
  return function (mode, callback) {
    var exercise = this
      , done     = after(toDirs.length, function (err) {
          if (err)
            return callback(err)

          done = after(toDirs.length, function (err) {
            if (err)
              return callback(err)

            callback(null, true)
          })

          toDirs.forEach(function (dir) {
            copyDeps(dir, done)
          })
        })

    toDirs.forEach(function (dir) {
      cpr(exercise.submission, dir, { overwrite: true }, done)
    })
  }
}


function copyDeps (dir, callback) {
  var done = after(2, callback)

  cpr(bindingsDir, path.join(dir, 'node_modules/bindings/'), { overwrite: true }, done)
  cpr(nanDir, path.join(dir, 'node_modules/nan/'), { overwrite: true }, done)
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
module.exports.copyDeps = copyDeps