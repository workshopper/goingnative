const path = require('path')
const { exec } = require('child_process')
const copy = require('./copy')
const compile = require('./compile')
const solutions = require('./solutions')
const check = require('./check')
const gyp = require('./gyp')
const packagejson = require('./packagejson')
const argv2 = require.resolve('./require-argv2')

const copyTempDir = path.join(process.cwd(), '~test-addon.' + Math.floor(Math.random() * 10000))
const solutionFiles = ['myaddon.cc']

let exercise = require('workshopper-exercise')()
exercise = solutions(exercise, solutionFiles)

exercise.addProcessor(check.checkSubmissionDir)
exercise.addProcessor(copy.copyTemp([copyTempDir]))
exercise.addProcessor(packagejson.checkPackageJson)
exercise.addProcessor(gyp.checkBinding)
exercise.addProcessor(compile.checkCompile(copyTempDir))

function checkExec (mode, callback) {
  const exercise = this
  const expected = exercise.expected

  if (!exercise.passed) {
    return callback(null, true) // shortcut if we've already had a failure
  }

  exec(`${process.execPath} ${argv2} ${copyTempDir}`, function (err, stdout, stderr) {
    if (err) {
      process.stderr.write(stderr)
      process.stdout.write(stdout)
      return callback(err)
    }

    const pass = stdout.toString().replace('\r', '') === expected + '\n'
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

    callback(null, pass)
  })
}

exercise.addProcessor(checkExec)
exercise.addCleanup(copy.cleanup([copyTempDir]))

exercise.skipBindingIncludeDirs = true

module.exports = exercise
