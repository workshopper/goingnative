const path         = require('path')
    , childProcess = require('child_process')
    , boilerplate  = require('workshopper-boilerplate')
    , copy         = require('../../lib/copy')
    , gyp          = require('../../lib/gyp')
    , solutions    = require('../../lib/solutions')
    , check        = require('../../lib/check')
    , compile      = require('../../lib/compile')
    , packagejson  = require('../../lib/packagejson')


const solutionFiles   = [ 'myaddon.cc' ]
      // a place to make a full copy to run a test compile
    , copyTempDir     = path.join(process.cwd(), '~test-addon.' + Math.floor(Math.random() * 10000))
      // a place to make a full copy to replace myaddon.cc with a mock to do a mocked run to test JS
    , copyFauxTempDir = path.join(process.cwd(), '~test-addon-faux.' + Math.floor(Math.random() * 10000))
      // what we should get on stdout for this to pass


var exercise = require('workshopper-exercise')()

// add solutions file listing from solutions/ directory
exercise = solutions(exercise, solutionFiles)
// add boilerplate functionality
exercise = boilerplate(exercise)

// boilerplate files for them to start from
exercise.addBoilerplate(path.join(__dirname, 'boilerplate/index.js'))
exercise.addBoilerplate(path.join(__dirname, 'boilerplate/myaddon.cc'))

// the steps towards verification
exercise.addProcessor(check.checkSubmissionDir)
exercise.addProcessor(copy.copyTemp([ copyTempDir, copyFauxTempDir ]))
exercise.addProcessor(copyFauxAddon)
exercise.addProcessor(packagejson.checkPackageJson)
exercise.addProcessor(gyp.checkBinding)
exercise.addProcessor(compile.checkCompile(copyTempDir))
exercise.addProcessor(checkJs)
exercise.addProcessor(checkExec)

// always clean up the temp directories
exercise.addCleanup(copy.cleanup([ copyTempDir, copyFauxTempDir ]))


function copyFauxAddon (mode, callback) {
  copy(path.join(__dirname, 'faux', 'myaddon.cc'), copyFauxTempDir, { overwrite: true }, function (err) {
    if (err)
      return callback(err)

    callback(null, true)
  })
}


function execWith (dir, arg, expect, callback) {
  childProcess.exec(
        '"'
      + process.execPath
      + '" "'
      + dir
      + '" "'
      + arg
      + '"'
    , function (err, stdout, stderr) {
        if (err) {
          process.stderr.write(stderr)
          process.stdout.write(stdout)
          return callback(err)
        }

        var pass = expect.test(stdout.toString().replace(/\r/g, ''))

        if (!pass) {
          process.stderr.write(stderr)
          process.stdout.write(stdout)
        }

        callback(null, pass)
      }
  )
}


// run `node-gyp rebuild` on a mocked version of the addon that prints what we want
// so we can test that their JS is doing what it is supposed to be doing and there
// is no cheating! (e.g. console.log(...))
function checkJs (mode, callback) {
  var exercise = this
    , expect   = /FAUX 1\nFAUX 2\nWaiting\.*FAUX 3\n\.+FAUX 4\n\.*Done!\n/m

  if (!exercise.passed)
    return callback(null, true) // shortcut if we've already had a failure

  gyp.rebuild(copyFauxTempDir, function (err) {
    if (err) {
      exercise.emit('fail', 'Compile mock C++ to test JavaScript: ' + err.message)
      return callback(null, false)
    }

    execWith(copyFauxTempDir, 111, expect, function (err, pass) {
      if (err)
        return callback(err)

      if (!pass) {
        exercise.emit('fail', 'JavaScript code loads addon and invokes `delay(x, cb)` method')
        return callback(null, false)
      }

      execWith(copyFauxTempDir, 1111, expect, function (err, pass) {
        if (err)
          return callback(err)

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
  if (!exercise.passed)
    return callback(null, true) // shortcut if we've already had a failure

  var expect = /Waiting\.\.*Done!\n/m
    , start  = Date.now()

  execWith(copyTempDir, 111, expect, function (err, pass) {
    if (err)
      return callback(err)

    if (!pass) {
      exercise.emit('fail', 'JavaScript code loads addon, invokes `delay(x, cb)` method and sleeps for x seconds')
      return callback(null, false)
    }

    var delay = Date.now() - start

    if (delay < 100 || delay > 600) {
      exercise.emit('fail', 'Slept for the right amount of time (asked for 111ms, slept for ' + delay + 'ms)')
      return callback(null, false)
    }

    start = Date.now()
    execWith(copyTempDir, 1111, expect, function (err, pass) {
      if (err)
        return callback(err)

      delay = Date.now() - start

      if (delay < 1000 || delay > 1500) {
        exercise.emit('fail', 'Slept for the right amount of time (asked for 1111ms, slept for ' + delay + 'ms)')
        return callback(null, false)
      }

      exercise.emit(pass ? 'pass' : 'fail'
        , 'JavaScript code loads addon, invokes `delay(x, cb)` method and sleeps for x seconds')
      callback(null, pass)
    })
  })
}


module.exports = exercise