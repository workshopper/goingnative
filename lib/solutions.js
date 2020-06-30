const fs = require('fs')
const path = require('path')

function solutions (exercise, files) {
  exercise.getSolutionFiles = function (callback) {
    const solutionDir = path.join(this.dir, './solution/')

    fs.readdir(solutionDir, function (err, list) {
      if (err) return callback(err)

      list = list
        .filter(function (f) {
          return !files || files.indexOf(f) > -1
        })
        .map(function (f) {
          fs.stat(path.join(solutionDir, f), function (err, stats) {
            if (err) {
              return callback(err)
            }

            return stats.isFile()
          })
        })

      callback(null, list)
    })
  }

  return exercise
}

module.exports = solutions
