const fs = require('fs')
const path = require('path')

// inspect package.json, make sure it's parsable and check that it has
// "gyp":true
function checkPackageJson (mode, callback) {
  const exercise = this

  function fail (msg) {
    exercise.emit('fail', msg)
    return callback(null, false)
  }

  fs.readFile(path.join(exercise.submission, 'package.json'), 'utf8', function (err, data) {
    if (err) return fail('Read package.json (' + err.message + ')')

    let doc

    try {
      doc = JSON.parse(data)
    } catch (e) {
      return fail('Parse package.json (' + e.message + ')')
    }

    const gypfile = doc.gypfile === true

    exercise.emit(gypfile ? 'pass' : 'fail', 'package.json contains `"gypfile": true`')

    callback(null, gypfile)
  })
}

module.exports.checkPackageJson = checkPackageJson
