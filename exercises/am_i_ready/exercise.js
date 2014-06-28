const MIN_GCC_VERSION      = '4.4.0' // kind of arbitrary .. modern *enough*
    , MIN_PYTHON_VERSION   = '2.6.x'
    , MAX_PYTHON_VERSION   = '2.7.x'
    , MIN_NODE_GYP_VERSION = '0.12.0'


const exercise      = require('workshopper-exercise')()
    , child_process = require('child_process')
    , path          = require('path')
    , semver        = require('semver')
    , chalk         = require('chalk')
    , bindings      = require('bindings')
    , cpr           = require('cpr')
    , rimraf        = require('rimraf')


const testPackageSrc = path.join(__dirname, '../../packages/test-addon/')
    , testPackageRnd = path.join(process.cwd(), '~test-addon.' + Math.floor(Math.random() * 10000))


exercise.requireSubmission = false // don't need a submission arg
exercise.addSetup(setup)
exercise.addProcessor(processor)
exercise.addCleanup(cleanup)


function setup (mode, callback) {
  cpr(testPackageSrc, testPackageRnd, callback)
}


function cleanup (mode, pass, callback) {
  rimraf(testPackageRnd, callback)
}


function processor (mode, callback) {
  var checks = [ checkGcc, checkPython, checkNodeGyp, checkBuild ]
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


function checkGcc (pass, callback) {
  child_process.exec('gcc -v', { env: process.env }, function (err, stdout, stderr) {
    if (err) {
      exercise.emit('fail', '`' + chalk.bold('gcc') + '` not found in $PATH')
      return callback(null, false)
    }

    var versionMatch = stderr.toString().split('\n').filter(Boolean).pop()
          .match(/gcc version (\d+\.\d+\.\d+) /)
      , versionString = versionMatch && versionMatch[1]

    if (!versionString) {
      exercise.emit('fail', 'Unknown `' + chalk.bold('gcc') + '` found in $PATH')
      return callback(null, false)
    }

    if (!semver.satisfies(versionString, '>=' + MIN_GCC_VERSION)) {
      exercise.emit('fail',
            '`'
          + chalk.bold('gcc')
          + '` version is too old: '
          + chalk.bold('v' + versionString)
          + ', please upgrade to a version >= '
          + chalk.bold('v' + MIN_GCC_VERSION)
      )
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
