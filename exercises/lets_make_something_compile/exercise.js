const boilerplate = require('workshopper-boilerplate')
    , path        = require('path')
    , fs          = require('fs')
    , gyp         = require('node-gyp')
    , rimraf      = require('rimraf')
    , cpr         = require('cpr')
    , mkdirp      = require('mkdirp')
    , yaml        = require('js-yaml')
    , is          = require('core-util-is')


const bindingsDir     = path.dirname(require.resolve('bindings'))
    , copyTempDir     = path.join(process.cwd(), '~test-addon.' + Math.floor(Math.random() * 10000))
    , boilerplateName = 'myaddon'


var exercise    = require('workshopper-exercise')()


// add boilerplate functionality
exercise = boilerplate(exercise)

exercise.addBoilerplate(path.join(__dirname, 'boilerplate/' + boilerplateName))
exercise.addPrepare(boilerplateSetup)

exercise.addProcessor(checkSubmissionDir)
exercise.addProcessor(copyTemp)
exercise.addProcessor(checkPackageJson)
exercise.addProcessor(checkBindingGyp)
exercise.addProcessor(checkCompile)
exercise.addProcessor(checkExec)

exercise.addCleanup(cleanup)


// complete the copied boilerplate dir by adding node_modules/bindings/
// so they don't need to `npm install bindings`
function boilerplateSetup (callback) {
  var target = path.join(process.cwd(), exercise.boilerplateOut[boilerplateName])
  cpr(bindingsDir, path.join(target, 'node_modules/bindings/'), callback)
}


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


function copyTemp (mode, callback) {
  cpr(exercise.submission, copyTempDir, function (err) {
    if (err)
      return callback(err)

    callback(null, true)
  })
}


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

    if (!is.isArray(doc.targets[0].sources))
      return fail('binding.gyp does not contain a sources array for the first target (sources: [ ... ])')

    if (doc.targets[0].sources.filter(function (s) { return s == 'myaddon.cc' }).length != 1)
      return fail('binding.gyp does not list "myaddon.cc" in the sources array for the first target')

    if (!is.isArray(doc.targets[0].include_dirs))
      return fail('binding.gyp does not contain a include_dirs array for the first target (include_dirs: [ ... ])')

    var nanConstruct = '<!(node -e "require(\'nan\')")'

    if (doc.targets[0].include_dirs.filter(function (s) { return s == nanConstruct }).length != 1)
      return fail('binding.gyp does not list NAN properly in the include_dirs array for the first target')

    callback(null, true)
  })
}


function checkCompile (mode, callback) {
  // TODO: bork if not passing already
  var gypInst = gyp()
  gypInst.parseArgv([ null, null, 'rebuild' ])
  process.chdir(copyTempDir)
  console.log(gypInst.todo)
  gypInst.commands.clean([], function (err) {
    console.log(err)
    gypInst.commands.configure([], function (err) {
      console.log(err)
      gypInst.commands.build([], function (err) {
        console.log(err)
        return callback(null, true)
      })
    })
  })
}


function checkExec (mode, callback) {
  return callback(null, true)
}


function cleanup (mode, pass, callback) {
  rimraf(copyTempDir, callback)
}


module.exports = exercise