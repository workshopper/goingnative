const boilerplate  = require('workshopper-boilerplate')
    , path         = require('path')
    , fs           = require('fs')
    , childProcess = require('child_process')
    , rimraf       = require('rimraf')
    , mkdirp       = require('mkdirp')
    , yaml         = require('js-yaml')
    , is           = require('core-util-is')
    , after        = require('after')
    , copy         = require('../../lib/copy')
    , gyp          = require('../../lib/gyp')
    , solutions    = require('../../lib/solutions')


      // where node_modules/bindings is so it can be copied to make a submission compilable
const bindingsDir     = path.dirname(require.resolve('bindings'))
      // where node_modules/nan is so it can be copied to make a submission compilable
    , nanDir          = path.dirname(require.resolve('nan'))
      // a place to make a full copy to run a test compile
    , copyTempDir     = path.join(process.cwd(), '~test-addon.' + Math.floor(Math.random() * 10000))
      // a place to make a full copy to replace myaddon.cc with a mock to do a mocked run to test JS
    , copyFauxTempDir = path.join(process.cwd(), '~test-addon-faux.' + Math.floor(Math.random() * 10000))
      // name of the module required in binding.gyp
    , boilerplateName = 'myaddon'
      // what we should get on stdout for this to pass
    , expected        = 'I am a native addon and I AM ALIVE!'


var exercise    = require('workshopper-exercise')()


// add solutions file listing from solutions/ directory
exercise = solutions(exercise)
// add boilerplate functionality
exercise = boilerplate(exercise)

// boilerplate directory to copy into CWD to give them a base to start from
exercise.addBoilerplate(path.join(__dirname, 'boilerplate/' + boilerplateName))
// need to add the two deps (bindings & nan) into node_modules so they don't *need* to `npm install`
exercise.addPrepare(boilerplateSetup)

// the steps towards verification
exercise.addProcessor(checkSubmissionDir)
exercise.addProcessor(copyTemp)
exercise.addProcessor(checkPackageJson)
exercise.addProcessor(checkBindingGyp)
exercise.addProcessor(checkCompile)
exercise.addProcessor(checkJs)
exercise.addProcessor(checkExec)

// always clean up the temp directories
exercise.addCleanup(cleanup)


// complete the copied boilerplate dir by adding node_modules/bindings/
// so they don't need to `npm install bindings`
function boilerplateSetup (callback) {
  var target = path.join(process.cwd(), exercise.boilerplateOut[boilerplateName])
    , done   = after(2, callback)

  copy(bindingsDir, path.join(target, 'node_modules/bindings/'), done)
  copy(nanDir, path.join(target, 'node_modules/nan/'), done)
}


// simple check to see they are running a verify or run with an actual directory
function checkSubmissionDir (mode, callback) {
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


// copy their submission into two tmp directories that we can mess with and test without
// touching their original
function copyTemp (mode, callback) {
  var done = after(2, function (err) {
    if (err)
      return callback(err)

    copy(path.join(__dirname, 'faux', 'myaddon.cc'), copyFauxTempDir, function (err) {
      if (err)
        return callback(err)

      callback(null, true)
    })
  })

  copy(exercise.submission, copyTempDir, done)
  copy(exercise.submission, copyFauxTempDir, done)
}


// inspect package.json, make sure it's parsable and check that it has
// "gyp":true
function checkPackageJson (mode, callback) {
  function fail (msg) {
    exercise.emit('fail', msg)
    return callback(null, false)
  }

  fs.readFile(path.join(copyTempDir, 'package.json'), 'utf8', function (err, data) {
    if (err)
      return fail('Read package.json (' + err.message + ')')

    var doc

    try {
      doc = JSON.parse(data)
    } catch (e) {
      return fail('Parse package.json (' + e.message + ')')
    }

    var gypfile = doc.gypfile === true

    exercise.emit(gypfile ? 'pass' : 'fail', 'package.json contains `"gypfile": true`')

    callback(null, gypfile)
  })
}


// check binding.gyp to see if it's parsable YAML and contains the
// basic structure that we need for this to work
function checkBindingGyp (mode, callback) {
  function fail (msg) {
    exercise.emit('fail', msg)
    return callback(null, false)
  }

  fs.readFile(path.join(copyTempDir, 'binding.gyp'), 'utf8', function (err, data) {
    if (err)
      return fail('Read binding.gyp (' + err.message + ')')

    var doc

    try {
      doc = yaml.safeLoad(data)
    } catch (e) {
      return fail('Parse binding.gyp (' + e.message + ')')
    }

    if (!is.isObject(doc))
      return fail('binding.gyp does not contain a parent object ({ ... })')

    if (!is.isArray(doc.targets))
      return fail('binding.gyp does not contain a targets array ({ targets: [ ... ] })')

    if (!is.isString(doc.targets[0].target_name))
      return fail('binding.gyp does not contain a target_name for the first target')

    if (doc.targets[0].target_name != 'myaddon')
      return fail('binding.gyp does not name the first target "myaddon"')

    exercise.emit('pass', 'binding.gyp includes a "myaddon" target')

    if (!is.isArray(doc.targets[0].sources))
      return fail('binding.gyp does not contain a sources array for the first target (sources: [ ... ])')

    if (doc.targets[0].sources.filter(function (s) { return s == 'myaddon.cc' }).length != 1)
      return fail('binding.gyp does not list "myaddon.cc" in the sources array for the first target')

    exercise.emit('pass', 'binding.gyp includes "myaddon.cc" as a source file')

    if (!is.isArray(doc.targets[0].include_dirs))
      return fail('binding.gyp does not contain a include_dirs array for the first target (include_dirs: [ ... ])')

    var nanConstruct = '<!(node -e "require(\'nan\')")'
    //TODO: grep the source for this string to make sure it's got `"` style quotes

    if (doc.targets[0].include_dirs.filter(function (s) { return s == nanConstruct }).length != 1)
      return fail('binding.gyp does not list NAN properly in the include_dirs array for the first target')

    exercise.emit('pass', 'binding.gyp includes a correct NAN include statement')

    callback(null, true)
  })
}


// run a `node-gyp rebuild` on their unmolested code in our copy
function checkCompile (mode, callback) {
  if (!exercise.passed)
    return callback(null, true) // shortcut if we've already had a failure

  gyp.rebuild(copyTempDir, function (err) {
    if (err) {
      exercise.emit('fail', err.message)
      return callback(null, false)
    }

    callback(null, true)
  })
}


// run `node-gyp rebuild` on a mocked version of the addon that prints what we want
// so we can test that their JS is doing what it is supposed to be doing and there
// is no cheating! (e.g. console.log(...))
function checkJs (mode, callback) {
  if (!exercise.passed)
    return callback(null, true) // shortcut if we've already had a failure

  gyp.rebuild(copyFauxTempDir, function (err) {
    if (err) {
      exercise.emit('fail', 'Compile mock C++ to test JavaScript: ' + err.message)
      return callback(null, false)
    }

    childProcess.exec(process.execPath + ' ' + require.resolve('../../lib/require-argv2') + ' "' + copyFauxTempDir + '"', function (err, stdout, stderr) {
      if (err) {
        process.stderr.write(stderr)
        process.stdout.write(stdout)
        return callback(err)
      }

      var pass = stdout.toString() == 'FAUX\n'
      if (!pass) {
        process.stderr.write(stderr)
        process.stdout.write(stdout)
      }
      exercise.emit(pass ? 'pass' : 'fail', 'JavaScript code loads addon and invokes `print()` method')

      callback(null, pass)
    })
  })
}


// run a full execution of their code & addon, uses a `require()` in a child process
// and check the stdout for expected
function checkExec (mode, callback) {
  if (!exercise.passed)
    return callback(null, true) // shortcut if we've already had a failure

  childProcess.exec(process.execPath + ' ' + require.resolve('../../lib/require-argv2') + ' "' + copyTempDir + '"', function (err, stdout, stderr) {
    if (err) {
      process.stderr.write(stderr)
      process.stdout.write(stdout)
      return callback(err)
    }

    var pass = stdout.toString() == expected + '\n'
      , seminl = !pass && stdout.toString() == expected
      , semicase = !pass && !seminl && new RegExp(expected, 'i').test(stdout.toString())

    if (!seminl && !semicase && !pass) {
      process.stderr.write(stderr)
      process.stdout.write(stdout)
    }

    if (seminl)
      exercise.emit('fail', 'Addon prints out expected string (missing newline)')
    if (semicase)
      exercise.emit('fail', 'Addon prints out expected string (printed with wrong character case)')
    else
      exercise.emit(pass ? 'pass' : 'fail', 'Addon prints out expected string')

    callback(null, pass)
  })
}


// don't leave the tmp dirs
function cleanup (mode, pass, callback) {
  var done = after(2, callback)

  rimraf(copyTempDir, done)
  rimraf(copyFauxTempDir, done)
}


module.exports = exercise