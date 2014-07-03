const versions             = require('./vars.json').Versions
    , MIN_GCC_VERSION      = versions.gcc
    , MIN_LLVM_VERSION     = versions.llvm
    , MIN_PYTHON_VERSION   = versions.python.min
    , MAX_PYTHON_VERSION   = versions.python.max
    , MIN_NODE_GYP_VERSION = versions.gyp
    , MIN_NODE_VERSION     = versions.node.min
    , MAX_NODE_VERSION     = versions.node.max


const child_process = require('child_process')
    , path          = require('path')
    , semver        = require('semver')
    , chalk         = require('chalk')
    , bindings      = require('bindings')
    , after         = require('after')
    , rimraf        = require('rimraf')
    , copy          = require('../../lib/copy')


      // where node_modules/bindings is so it can be copied to make a submission compilable
const bindingsDir     = path.dirname(require.resolve('bindings'))
      // where node_modules/nan is so it can be copied to make a submission compilable
    , nanDir          = path.dirname(require.resolve('nan'))
    , testPackageSrc = path.join(__dirname, '../../packages/test-addon/')
      // a place to make a full copy to run a test compile
    , testPackageRnd = path.join(process.cwd(), '~test-addon.' + Math.floor(Math.random() * 10000))


var exercise = require('workshopper-exercise')()


exercise.requireSubmission = false // don't need a submission arg
exercise.addSetup(setup)
exercise.addProcessor(processor)
exercise.addCleanup(cleanup)


// copy test package to a temporary location, populate it with bindings and nan
function setup (mode, callback) {
  copy(testPackageSrc, testPackageRnd, function (err) {
    if (err)
      return callback(err)

    var done = after(2, callback)

    copy(bindingsDir, path.join(testPackageRnd, 'node_modules/bindings/'), done)
    copy(nanDir, path.join(testPackageRnd, 'node_modules/nan/'), done)
  })
}


function cleanup (mode, pass, callback) {
  rimraf(testPackageRnd, callback)
}


function processor (mode, callback) {
  var checks = [ checkNode, checkGcc, checkPython, checkNodeGyp, checkBuild ]
    , pass   = true

  ;(function checkNext (curr) {
    if (!checks[curr])
      return callback(null, pass)

    checks[curr](pass, function (err, _pass) {
      if (err)
        return callback(err)

      if (!_pass)
        pass = false

      process.nextTick(checkNext.bind(null, curr + 1))
    })
  })(0)
}


function checkNode (pass, callback) {
  if (!semver.satisfies(process.versions.node, '>=' + MIN_NODE_VERSION)) {
    exercise.emit('fail',
          '`'
        + chalk.bold('node')
        + '` version is too old: '
        + chalk.bold('v' + process.versions.node)
        + ', please upgrade to a version >= '
        + chalk.bold('v' + MIN_NODE_VERSION)
        + ' and <= '
        + chalk.bold('v' + MAX_NODE_VERSION)
    )
    return callback(null, false)
 }

 if (!semver.satisfies(process.versions.node, '~' + MIN_NODE_VERSION)) {
    exercise.emit('fail',
          '`'
        + chalk.bold('node')
        + '` version is too new, you are likely using an unstable version: '
        + chalk.bold('v' + process.versions.node)
        + ', please upgrade to a version >= '
        + chalk.bold('v' + MIN_NODE_VERSION)
        + ' and <= '
        + chalk.bold('v' + MAX_NODE_VERSION)
    )
    return callback(null, false)
  }

  callback(null, true)
}

function checkGcc (pass, callback) {
  child_process.exec('gcc -v', { env: process.env }, function (err, stdout, stderr) {
    if (err) {
      exercise.emit('fail', '`' + chalk.bold('gcc') + '` not found in $PATH')
      return callback(null, false)
    }

    var versionMatch = stderr.toString().split('\n').filter(Boolean).pop()
          .match(/gcc version (\d+\.\d+\.\d+) /)
      , versionString

    if (versionMatch) {
      versionString = versionMatch && versionMatch[1]

      if (!semver.satisfies(versionString, '>=' + MIN_GCC_VERSION)) {
        exercise.emit('fail',
              '`'
            + chalk.bold('gcc')
            + '` version is too old: '
            + chalk.bold('v' + versionString)
            + ', please upgrade to a version >= '
            + chalk.bold('v' + MIN_GCC_VERSION)
        )
      }
    } else if (versionMatch = stderr.toString().match(/Apple LLVM version (\d+\.\d+) /)) {
      versionString = versionMatch && versionMatch[1] + '.0'

      if (!semver.satisfies(versionString, '>=' + MIN_LLVM_VERSION)) {
        exercise.emit('fail',
              '`'
            + chalk.bold('gcc/llvm')
            + '` version is too old: '
            + chalk.bold('v' + versionString)
            + ', please upgrade to a version >= '
            + chalk.bold('v' + MIN_LLVM_VERSION)
        )
      }
    }

    if (!versionMatch) {
      exercise.emit('fail', 'Unknown `' + chalk.bold('gcc') + '` found in $PATH')
      return callback(null, false)
    }

    exercise.emit('pass', 'Found usable `' + chalk.bold('gcc') + '` in $PATH: ' + chalk.bold('v' + versionString))

    callback(null, true)
  })
}


function checkPython (pass, callback) {
  child_process.exec('python --version', { env: process.env }, function (err, stdout, stderr) {
    if (err) {
      exercise.emit('fail', '`' + chalk.bold('python') + '` not found in $PATH')
      return callback(null, false)
    }

    var versionMatch = stderr.toString().match(/Python (\d+\.\d+\.\d+)/)
      , versionString = versionMatch && versionMatch[1]

    if (!versionString) {
      exercise.emit('fail', 'Unknown `' + chalk.bold('python') + '` found in $PATH')
      return callback(null, false)
    }

    if (!semver.satisfies(versionString, '>=' + MIN_PYTHON_VERSION)) {
      exercise.emit('fail',
            '`'
          + chalk.bold('python')
          + '` version is too old: '
          + chalk.bold('v' + versionString)
          + ', please install a version >= '
          + chalk.bold('v' + MIN_PYTHON_VERSION)
          + ' and <= '
          + chalk.bold('v' + MAX_PYTHON_VERSION)
      )
      return callback(null, false)
    }

    if (!semver.satisfies(versionString, '~' + MAX_PYTHON_VERSION)) {
      exercise.emit('fail',
            '`'
          + chalk.bold('python')
          + '` version is too new: '
          + chalk.bold('v' + versionString)
          + ', please install a version >= '
          + chalk.bold('v' + MIN_PYTHON_VERSION)
          + ' and <= '
          + chalk.bold('v' + MAX_PYTHON_VERSION)
      )
      return callback(null, false)
    }

    exercise.emit('pass', 'Found usable `' + chalk.bold('python') + '` in $PATH: ' + chalk.bold('v' + versionString))

    callback(null, true)
  })
}


function checkNodeGyp (pass, callback) {
  child_process.exec('node-gyp -v', { env: process.env }, function (err, stdout) {
    if (err) {
      exercise.emit('fail', '`' + chalk.bold('node-gyp') + '` not found in $PATH')
      return callback(null, false)
    }

    var versionMatch = stdout.toString().match(/v(\d+\.\d+\.\d+)/)
      , versionString = versionMatch && versionMatch[1]

    if (!versionString) {
      exercise.emit('fail', 'Unknown `' + chalk.bold('node-gyp') + '` found in $PATH')
      return callback(null, false)
    }

    if (!semver.satisfies(versionString, '>=' + MIN_NODE_GYP_VERSION)) {
      exercise.emit('fail',
            '`'
          + chalk.bold('node-gyp')
          + '` version is too old: '
          + chalk.bold('v' + versionString)
          + ', please install a version >= '
          + chalk.bold('v' + MAX_PYTHON_VERSION)
      )
      return callback(null, false)
    }


    exercise.emit('pass', 'Found usable `' + chalk.bold('node-gyp') + '` in $PATH: ' + chalk.bold('v' + versionString))

    callback(null, true)
  })
}


function checkBuild (pass, callback) {
  if (!pass)
    return callback()

  child_process.exec('node-gyp rebuild', { cwd: testPackageRnd, env: process.env }, function (err, stdout, stderr) {
    if (err) {
      if (stdout)
        process.stdout.write(stdout)
      if (stderr)
        process.stderr.write(stderr)
      if (!stdout && !stderr)
        console.error(err.stack)
      exercise.emit('fail', 'Could not compile test addon')
      return callback(null, false)
    }

    process.stdout.write(stdout)
    // ignore stderr, gyp cruft

    exercise.emit('pass', 'Compiled test package')

    var binding

    try {
      binding = bindings({ module_root: testPackageRnd, bindings: 'test' })
    } catch (e) {
      exercise.emit('fail', 'Could not properly compile test addon, error finding binding: ' + e.message)
      return callback(null, false)
    }

    exercise.emit('pass', 'Found compiled test binding file')

    if (!binding) {
      exercise.emit('fail', 'Could not properly compile test addon, did not load binding')
      return callback(null, false)
    }

    if (binding.test !== 'OK') {
      exercise.emit('fail', 'Could not properly compile test addon, binding did not behave properly')
      return callback(null, false)
    }

    exercise.emit('pass', 'Test binding file works as expected')

    callback(null, true)
  })
}

module.exports = exercise
