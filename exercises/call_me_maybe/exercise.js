const path = require('path')
const copy = require('../../lib/copy')
const gyp = require('../../lib/gyp')
const solutions = require('../../lib/solutions')
const check = require('../../lib/check')
const compile = require('../../lib/compile')
const packagejson = require('../../lib/packagejson')
const execWith = require('../../lib/execWith')
const execWithMeasured = require('../../lib/execWithMeasured')

const solutionFiles = ['myaddon.cc', 'index.js']
// a place to make a full copy to run a test compile
const copyTempDir = path.join(process.cwd(), '~test-addon.' + Math.floor(Math.random() * 10000))
// a place to make a full copy to replace myaddon.cc with a mock to do a mocked run to test JS
const copyFauxTempDir = path.join(process.cwd(), '~test-addon-faux.' + Math.floor(Math.random() * 10000))
// what we should get on stdout for this to pass

let exercise = require('workshopper-exercise')()

// add solutions file listing from solutions/ directory
exercise = solutions(exercise, solutionFiles)

// the steps towards verification
exercise.addProcessor(check.checkSubmissionDir)
exercise.addProcessor(copy.copyTemp([copyTempDir, copyFauxTempDir]))
exercise.addProcessor(copyFauxAddon)
exercise.addProcessor(packagejson.checkPackageJson)
exercise.addProcessor(gyp.checkBinding)
exercise.addProcessor(compile.checkCompile(copyTempDir))
exercise.addProcessor(checkJs)
exercise.addProcessor(checkExec)

// always clean up the temp directories
exercise.addCleanup(copy.cleanup([copyTempDir, copyFauxTempDir]))

function copyFauxAddon (mode, callback) {
  copy(path.join(__dirname, 'faux', 'myaddon.cc'), copyFauxTempDir, { overwrite: true }, function (err) {
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

    execWith(copyFauxTempDir, 111, 'FAUX 111\nDone!\n', function (err, pass) {
      if (err) { return callback(err) }
      if (!pass) {
        exercise.emit('fail', 'JavaScript code loads addon and invokes `delay(x, cb)` method')
        return callback(null, false)
      }

      execWith(copyFauxTempDir, 1111, 'FAUX 1111\nDone!\n', function (err, pass) {
        if (err) { return callback(err) }

        exercise.emit(pass ? 'pass' : 'fail'
          , 'JavaScript code loads addon and invokes `delay(x, cb)` method')
        callback(null, pass)
      })
    })
  })
}

// run a full execution of their code & addon, uses a `require()` in a child process
// and check the stdout for expected
function checkExec (mode, callback) {
  if (!exercise.passed) { return callback(null, true) } // shortcut if we've already had a failure

  execWithMeasured(copyTempDir, 111, 'Done!\n', function (err, result) {
    if (err) { return callback(err) }

    if (!result.pass) {
      exercise.emit('fail', 'JavaScript code loads addon, invokes `delay(x, cb)` method and sleeps for x milliseconds')
      return callback(null, false)
    }

    let delay = result.duration
    if (delay < 100 || delay > 300) {
      if (retry) {
        return runOrRetry(false)
      } else {
        exercise.emit('fail', 'Slept for the right amount of time (asked for 111ms, slept for ' + delay + ')')
        return callback(null, false)
      }
    }

    execWithMeasured(copyTempDir, 1111, 'Done!\n', function (err, result) {
      if (err) { return callback(err) }

      delay = result.duration

      if (delay < 1000 || delay > 1300) {
        exercise.emit('fail', 'Slept for the right amount of time (asked for 1111ms, slept for ' + delay + 'ms)')
        return callback(null, false)
      }

      const pass = result.pass
      exercise.emit(pass ? 'pass' : 'fail'
        , 'JavaScript code loads addon, invokes `delay(x, cb)` method and sleeps for x milliseconds')
      callback(null, pass)
    })
  })
}

module.exports = exercise
