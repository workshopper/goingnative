const MIN_GCC_VERSION      = '4.4.0' // kind of arbitrary .. modern *enough*
    , MIN_PYTHON_VERSION   = '2.6.x'
    , MAX_PYTHON_VERSION   = '2.7.x'
    , MIN_NODE_GYP_VERSION = '0.12.0'


const exercise      = require('workshopper-exercise')()
    , child_process = require('child_process')
    , semver        = require('semver')
    , chalk         = require('chalk')


exercise.requireSubmission = false // don't need a submission arg
exercise.addProcessor(processor)


function processor (mode, callback) {
  var checks = [ checkGcc, checkPython, checkNodeGyp ]
    , pass   = true

  ;(function checkNext (curr) {
    if (!checks[curr])
      return callback(null, pass)

    checks[curr](function (err, _pass) {
      if (err)
        return callback(err)

      if (!_pass)
        pass = false

      process.nextTick(checkNext.bind(null, curr + 1))
    })
  })(0)
}


function checkGcc (callback) {
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


function checkPython (callback) {
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


function checkNodeGyp (callback) {
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


module.exports = exercise
