const fs   = require('fs')
    , path = require('path')
    , map  = require('map-async')


function solutions (exercise, files) {
  exercise.getSolutionFiles = function (callback) {
    var solutionDir = path.join(this.dir, './solution/')

    fs.readdir(solutionDir, function (err, list) {
      if (err)
        return callback(err)

      list = list
        .filter(function (f) {
          return !files || files.indexOf(f) > -1
        })
        .map(function (f) {
          return path.join(solutionDir, f)
        })

      map(list, fs.stat, function (err, stats) {
        if (err)
          return callback(err)

        list = list.filter(function (file, i) {
          return stats[i].isFile()
        })

        callback(null, list)
      })
    })
  }

  return exercise
}


module.exports = solutions