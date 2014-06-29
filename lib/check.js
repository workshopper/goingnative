const fs = require('fs')


// simple check to see they are running a verify or run with an actual directory
function checkSubmissionDir (mode, callback) {
  var exercise = this

  exercise.submission = this.args[0] // submission first arg obviously


  function failBadPath () {
    exercise.emit('fail', 'Submitted a readable directory path (please supply a path to your solution)')
    callback(null, false)
  }

  if (!exercise.submission)
    return failBadPath()

  fs.stat(exercise.submission, function (err, stat) {
    if (err)
      return failBadPath()

    if (!stat.isDirectory())
      return failBadPath()

    callback(null, true)
  })
}


module.exports.checkSubmissionDir = checkSubmissionDir