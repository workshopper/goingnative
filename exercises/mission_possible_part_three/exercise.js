const boilerplate = require('workshopper-boilerplate')
const path = require('path')
const copy = require('../../lib/copy')
const compile = require('../../lib/compile')
const solutions = require('../../lib/solutions')
const check = require('../../lib/check')
const gyp = require('../../lib/gyp')
const packagejson = require('../../lib/packagejson')
const execWith = require('../../lib/execWith')

// a place to make a full copy to run a test compile
const copyTempDir = path.join(process.cwd(), '~test-addon.' + Math.floor(Math.random() * 10000))
// a place to make a full copy to replace myaddon.cc with a mock to do a mocked run to test JS
const copyFauxTempDir = path.join(process.cwd(), '~test-addon-faux.' + Math.floor(Math.random() * 10000))
// what we should get on stdout for this to pass
const expected = 'I am a native addon and I AM ALIVE!'
const solutionFiles = ['myaddon.cc']

let exercise = require('workshopper-exercise')()

// add solutions file listing from solutions/ directory
exercise = solutions(exercise, solutionFiles)
// add boilerplate functionality
exercise = boilerplate(exercise)

// boilerplate directory to copy into CWD to give them a base to start from
exercise.addBoilerplate(path.join(__dirname, 'boilerplate/myaddon.cc'))

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

    execWith(
      require.resolve('../../lib/require-argv2'),
      copyFauxTempDir,
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

// run a full execution of their code & addon, uses a `require()` in a child process
// and check the stdout for expected
function checkExec (mode, callback) {
  if (!exercise.passed) { return callback(null, true) } // shortcut if we've already had a failure

  execWith(
    require.resolve('../../lib/require-argv2'),
    copyTempDir,
    `${expected}\n`,
    {
      processPass: function (pass, stdout, stderr) {
        const seminl = !pass && stdout.toString() === expected
        const semicase = !pass && !seminl && new RegExp(expected, 'i').test(stdout.toString())

        if (!seminl && !semicase && !pass) {
          process.stderr.write(stderr)
          process.stdout.write(stdout)
        }

        if (seminl) {
          exercise.emit('fail', 'Addon prints out expected string (missing newline)')
        } else if (semicase) {
          exercise.emit('fail', 'Addon prints out expected string (printed with wrong character case)')
        } else {
          exercise.emit(pass ? 'pass' : 'fail', 'Addon prints out expected string')
        }
      }
    },
    function (err, pass) {
      if (err) {
        return callback(err)
      }

      callback(null, pass)
    }
  )
}

module.exports = exercise
