const path         = require('path')
    , childProcess = require('child_process')
    , copy         = require('../../lib/copy')
    , solutions    = require('../../lib/solutions')
    , check        = require('../../lib/check')
    , gyp          = require('../../lib/gyp')
    , packagejson  = require('../../lib/packagejson')


      // a place to make a full copy to replace myaddon.cc with a mock to do a mocked run to test JS
const copyFauxTempDir = path.join(process.cwd(), '~test-addon-faux.' + Math.floor(Math.random() * 10000))
    , solutionFiles   = [ 'index.js' ]


var exercise = require('workshopper-exercise')()


// add solutions file listing from solutions/ directory
exercise = solutions(exercise, solutionFiles)

// the steps towards verification
exercise.addProcessor(check.checkSubmissionDir)
exercise.addProcessor(copy.copyTemp([ copyFauxTempDir ]))
exercise.addProcessor(copyFauxAddon)
exercise.addProcessor(packagejson.checkPackageJson)
exercise.addProcessor(gyp.checkBinding)
exercise.addProcessor(checkJs)

// always clean up the temp directories
exercise.addCleanup(copy.cleanup([ copyFauxTempDir ]))


function copyFauxAddon (mode, callback) {
  copy(path.join(__dirname, 'faux', 'myaddon.cc'), copyFauxTempDir, function (err) {
    if (err)
      return callback(err)

    callback(null, true)
  })
}


// run `node-gyp rebuild` on a mocked version of the addon that prints what we want
// so we can test that their JS is doing what it is supposed to be doing and there
// is no cheating! (e.g. console.log(...))
function checkJs (mode, callback) {
  var exercise = this

  if (!exercise.passed)
    return callback(null, true) // shortcut if we've already had a failure

  gyp.rebuild(copyFauxTempDir, function (err) {
    if (err) {
      exercise.emit('fail', 'Compile mock C++ to test JavaScript: ' + err.message)
      return callback(null, false)
    }

    childProcess.exec(
          '"'
        + process.execPath
        + '" "'
        + require.resolve('../../lib/require-argv2')
        + '" "'
        + copyFauxTempDir
        + '"'
      , function (err, stdout, stderr) {
          if (err) {
            process.stderr.write(stderr)
            process.stdout.write(stdout)
            return callback(err)
          }

          var pass = stdout.toString().replace('\r', '') == 'FAUX\n'
          if (!pass) {
            console.log('stdout: [%s]', stdout.toString())
            console.log('stderr: [%s]', stderr.toString())
            process.stderr.write(stderr)
            process.stdout.write(stdout)
          }
          exercise.emit(pass ? 'pass' : 'fail', 'JavaScript code loads addon and invokes `print()` method')

          callback(null, pass)
        }
    )
  })
}


module.exports = exercise