const fs   = require('fs')
    , path = require('path')


function solutions (exercise) {
  exercise.getSolutionFiles = function (callback) {
    var solutionDir = path.join(this.dir, './solution/')

    fs.readdir(solutionDir, function (err, list) {
      if (err)
        return callback(err)

      list = list.map(function (f) { return path.join(solutionDir, f)})

      callback(null, list)
    })
  }

  return exercise
}


module.exports = solutions