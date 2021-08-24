const path = require('path')
const copy = require('../../lib/copy')
const solutions = require('../../lib/solutions')
const check = require('../../lib/check')
const gyp = require('../../lib/gyp')
const packagejson = require('../../lib/packagejson')
const execWith = require('../../lib/execWith')

// a place to make a full copy to replace myaddon.cc with a mock to do a mocked run to test JS
const copyFauxTempDir = path.join(process.cwd(), '~test-addon-faux.' + Math.floor(Math.random() * 10000))
const solutionFiles = ['index.js']

let exercise = require('workshopper-exercise')()

// add solutions file listing from solutions/ directory
exercise = solutions(exercise, solutionFiles)

// the steps towards verification
exercise.addProcessor(check.checkSubmissionDir)
exercise.addProcessor(copy.copyTemp([copyFauxTempDir]))
exercise.addProcessor(copyFauxAddon)
exercise.addProcessor(packagejson.checkPackageJson)
exercise.addProcessor(gyp.checkBinding)
exercise.addProcessor(checkJs)

// always clean up the temp directories
exercise.addCleanup(copy.cleanup([copyFauxTempDir]))

function copyFauxAddon (mode, callback) {
  copy(path.join(__dirname, 'faux', 'myaddon.cc'), path.join(copyFauxTempDir, "myaddon.cc"), { overwrite: true }, function (err) {
    if (err) { return callback(err) }

    callback(null, true)
  })
}

// run `node-gyp rebuild` on a mocked version of the addon that prints what we want
// so we can test that their JS is doing what it is supposed to be doing and there
// is no cheating! (e.g. console.log(...))
function checkJs (mode, callback) {
  const exercise = this

  if (!exercise.passed) { return callback(null, true) } // shortcut if we've already had a failure

  gyp.rebuild(copyFauxTempDir, function (err) {
    if (err) {
      exercise.emit('fail', 'Compile mock C++ to test JavaScript: ' + err.message)
      return callback(null, false)
    }

    execWith(
      require.resolve('../../lib/require-argv2'),
      path.join(copyFauxTempDir, "build", "Release", "myaddon"),
      'FAUX\n',
      function (err, pass) {
        if (err) {
          return callback(err)
        }

        exercise.emit(pass ? 'pass' : 'fail', 'JavaScript code loads addon and invokes `print()` method')
        callback(null, pass)
      }
    )
  })
}

module.exports = exercise
