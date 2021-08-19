const fs = require('fs')
const path = require('path')

function solutions (exercise, files) {
  exercise.getSolutionFiles = function (callback) {
    const solutionDir = path.join(this.dir, './solution/')

    fs.readdir(solutionDir, function (err, list) {
      if (err) return callback(err)

      try {
        callback(
          null,
          list
            .filter(function (f) {
              return !files || files.indexOf(f) > -1
            })
            .map(function (f) {
              return path.join(solutionDir, f)
            })
            .filter(function (f) {
              return fs.statSync(f).isFile()
            })
        )
      } catch (err) {
        callback(err)
      }
    })
  }

  return exercise
}

module.exports = solutions
