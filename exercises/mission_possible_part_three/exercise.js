const boilerplate  = require('workshopper-boilerplate')
    , path         = require('path')
    , fs           = require('fs')
    , childProcess = require('child_process')
    , rimraf       = require('rimraf')
    , after        = require('after')
    , copy         = require('../../lib/copy')
    , compile      = require('../../lib/compile')
    , solutions    = require('../../lib/solutions')
    , check        = require('../../lib/check')
    , gyp          = require('../../lib/gyp')
    , packagejson  = require('../../lib/packagejson')


      // a place to make a full copy to run a test compile
const copyTempDir     = path.join(process.cwd(), '~test-addon.' + Math.floor(Math.random() * 10000))
      // a place to make a full copy to replace myaddon.cc with a mock to do a mocked run to test JS
    , copyFauxTempDir = path.join(process.cwd(), '~test-addon-faux.' + Math.floor(Math.random() * 10000))
      // what we should get on stdout for this to pass
    , expected        = 'I am a native addon and I AM ALIVE!'
    , solutionFiles   = [ 'myaddon.cc' ]


var exercise = require('workshopper-exercise')()


// add solutions file listing from solutions/ directory
exercise = solutions(exercise, solutionFiles)
// add boilerplate functionality
exercise = boilerplate(exercise)

// boilerplate directory to copy into CWD to give them a base to start from
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


// run a full execution of their code & addon, uses a `require()` in a child process
// and check the stdout for expected
function checkExec (mode, callback) {
  if (!exercise.passed)
    return callback(null, true) // shortcut if we've already had a failure

  childProcess.exec(
        '"'
      + process.execPath
      + '" "'
      + require.resolve('../../lib/require-argv2')
      + '" "'
      + copyTempDir
      + '"'
    , function (err, stdout, stderr) {
        if (err) {
          process.stderr.write(stderr)
          process.stdout.write(stdout)
          return callback(err)
        }

        var pass = stdout.toString().replace('\r', '') == expected + '\n'
          , seminl = !pass && stdout.toString() == expected
          , semicase = !pass && !seminl && new RegExp(expected, 'i').test(stdout.toString())

        if (!seminl && !semicase && !pass) {
          process.stderr.write(stderr)
          process.stdout.write(stdout)
        }

        if (seminl)
          exercise.emit('fail', 'Addon prints out expected string (missing newline)')
        else if (semicase)
          exercise.emit('fail', 'Addon prints out expected string (printed with wrong character case)')
        else
          exercise.emit(pass ? 'pass' : 'fail', 'Addon prints out expected string')

        callback(null, pass)
      }
  )
}


module.exports = exercise