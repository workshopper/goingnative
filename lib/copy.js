const cpr    = require('cpr')
    , fs     = require('fs')
    , map    = require('map-async')
    , path   = require('path')
    , after  = require('after')
    , rimraf = require('rimraf')


function copy (src, dst, callback) {
  function stat (p, callback) {
    fs.stat(p, function (err, data) {
      callback(null, data)
    })
  }

  map({ src: src, dst: dst }, stat, function (err, data) {
    if (data.src.isDirectory())
      return cpr(src, dst, callback)

    if (data.src.isFile()) {
      if (data.dst.isDirectory())
        dst = path.join(dst, path.basename(src))

      fs.createReadStream(src)
        .on('error', function (err) {
          if (callback) {
            callback(err)
            callback = null
          }
        })
        .pipe(fs.createWriteStream(dst))
          .on('error', function (err) {
            if (callback) {
              callback(err)
              callback = null
            }
          })
          .on('close', function () {
            if (callback) {
              callback()
              callback = null
            }
          })
    } else {
      callback(new Error('Can only copy files or directories'))
    }
  })
}


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
      copy(exercise.submission, dir, done)
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


module.exports = copy
module.exports.copyTemp = copyTemp
module.exports.cleanup  = cleanup