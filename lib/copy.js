const cpr  = require('cpr')
    , fs   = require('fs')
    , map  = require('map-async')
    , path = require('path')


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


module.exports = copy
