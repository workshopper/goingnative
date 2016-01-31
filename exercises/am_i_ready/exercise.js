const versions             = require('./vars.json').versions
    , MIN_GCC_VERSION      = versions.gcc
    , MIN_LLVM_VERSION     = versions.llvm
    , MIN_PYTHON_VERSION   = versions.python.min
    , MAX_PYTHON_VERSION   = versions.python.max
    , MIN_NODE_GYP_VERSION = versions.gyp
    , MIN_NODE_VERSION     = versions.node.min
    , MAX_NODE_VERSION     = versions.node.max


const child_process = require('child_process')
    , path          = require('path')
    , fs            = require('fs')
    , semver        = require('semver')
    , chalk         = require('chalk')
    , rimraf        = require('rimraf')
    , python        = require('check-python')
    , copy          = require('../../lib/copy')
    , win           = process.platform == 'win32'


const testPackageSrc = path.join(__dirname, '../../packages/test-addon/')
      // a place to make a full copy to run a test compile
    , testPackageRnd = path.join(process.cwd(), '~test-addon.' + Math.floor(Math.random() * 10000))


var exercise = require('workshopper-exercise')()


exercise.requireSubmission = false // don't need a submission arg
exercise.addSetup(setup)
exercise.addProcessor(processor)
exercise.addCleanup(cleanup)


// copy test package to a temporary location, populate it with bindings and nan
function setup (mode, callback) {
  copy(testPackageSrc, testPackageRnd, { overwrite: true }, function (err) {
    if (err)
      return callback(err)

    copy.copyDeps(testPackageRnd, callback)
  })
}


function cleanup (mode, pass, callback) {
  setTimeout(function () {
    rimraf(testPackageRnd, callback)
  }, 1000)
}


function processor (mode, callback) {
  var checks = [ checkNode, win ? checkMsvc : checkGcc, checkPython, checkNodeGyp, checkBuild ]
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

 if (!semver.satisfies(process.versions.node, '<=' + MAX_NODE_VERSION)) {
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

  exercise.emit('pass', 'Found usable `' + chalk.bold('node') + '` version: '
        + chalk.bold('v' + process.versions.node))

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
    } else if (versionMatch = stderr.toString().match(/Apple LLVM version (\d+\.\d+)/)) {
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


function checkMsvc (pass, callback) {
  var msvsVars    = {
          2013: 'VS130COMNTOOLS'
        , 2012: 'VS120COMNTOOLS'
        , 2011: 'VS110COMNTOOLS'
      }
    , msvsVersion = Object.keys(msvsVars).filter(function (k) {
        return !!process.env[msvsVars[k]]
      })[0]

  if (!msvsVersion) {
    exercise.emit('fail',
        'Check for '
      + chalk.bold('Microsoft Visual Studio')
      + ' version 2011, 2012 or 2013: not found on system'
    )
    return callback(null, false)
  }

  if (!fs.existsSync(path.join(process.env[msvsVars[msvsVersion]], 'vsvars32.bat'))) {
    exercise.emit('fail',
        'Check for '
      + chalk.bold('Microsoft Visual Studio')
      + ' version 2011, 2012 or 2013: not found on system'
    )
    return callback(null, false)
  }

  exercise.emit('pass',
      'Found usable `'
    + chalk.bold('Microsoft Visual Studio')
    + '`: '
    + chalk.bold(msvsVersion)
  )

  callback(null, true)
}


function checkPython (pass, callback) {
  python(function (err, python, version) {
    if (err) {
      exercise.emit('fail', 'Check for `' + chalk.bold('python') + '`: ' + err.message)
      return callback(null, false)
    }

    if (!semver.satisfies(version, '>=' + MIN_PYTHON_VERSION)) {
      exercise.emit('fail',
            '`'
          + chalk.bold('python')
          + '` version is too old: '
          + chalk.bold('v' + version)
          + ', please install a version >= '
          + chalk.bold('v' + MIN_PYTHON_VERSION)
          + ' and <= '
          + chalk.bold('v' + MAX_PYTHON_VERSION)
      )
      return callback(null, false)
    }

    if (!semver.satisfies(version, '~' + MAX_PYTHON_VERSION)) {
      exercise.emit('fail',
            '`'
          + chalk.bold('python')
          + '` version is too new: '
          + chalk.bold('v' + version)
          + ', please install a version >= '
          + chalk.bold('v' + MIN_PYTHON_VERSION)
          + ' and <= '
          + chalk.bold('v' + MAX_PYTHON_VERSION)
      )
      return callback(null, false)
    }

    exercise.emit('pass', 'Found usable `' + chalk.bold('python') + '` in $PATH: ' + chalk.bold('v' + version))

    callback(null, true)
  })
}


function checkNodeGyp (pass, callback) {

  function checkVersionString (print, versionString) {
    if (!versionString) {
      if (print)
        exercise.emit('fail', 'Unknown `' + chalk.bold('node-gyp') + '` found in $PATH')
      return false
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
      return false
    }

    return true
  }

  function npmLsG (callback) {
    // note we can't reliably trap stdout on Windows for `node-gyp -v`, perhaps because of the
    // immediate `process.exit(0)` after a `console.log(version)`?
    child_process.exec('npm ls -g --depth 0', { env: process.env }, function (err, stdout, stderr) {
      if (err) {
        //Added some debugging to give insight into why things are failing.
        exercise.emit('fail', '`' + chalk.bold('node-gyp') + '` not found by `npm ls -g`')
        process.stdout.write(stdout)
        process.stderr.write(stderr)
        return callback(null, false)
      }

      var versionMatch = stdout.toString().match(/node-gyp@(\d+\.\d+\.\d+)/)
        , versionString = versionMatch && versionMatch[1]

      callback(null, checkVersionString(true, versionString), versionString)
    })
  }

  function nodeGypV (print, callback) {
    // note we can't reliably trap stdout on Windows for `node-gyp -v`, perhaps because of the
    // immediate `process.exit(0)` after a `console.log(version)`?
    child_process.exec('node-gyp -v', { env: process.env }, function (err, stdout, stderr) {
      if (err) {
        if (print) {
          //Added some debugging to give insight into why things are failing.
          exercise.emit('fail', '`' + chalk.bold('node-gyp') + '` not found by `npm ls -g`')
          process.stdout.write(stdout)
          process.stderr.write(stderr)
        }
        return callback(null, false)
      }

      var versionMatch = stdout.toString().match(/v(\d+\.\d+\.\d+)/)
        , versionString = versionMatch && versionMatch[1]

      callback(null, checkVersionString(false, versionString), versionString)
    })
  }

  function passFail (pass, versionString) {
    exercise.emit(
        pass ? 'pass' : 'fail'
      , 'Found usable `' + chalk.bold('node-gyp') + '` in $PATH'
        + (pass && versionString ? ': ' + chalk.bold('v' + versionString) : '')
    )
  }

  // this pyramid of nasty is for the following reasons:
  // * `npm ls -g` is frail and will break if you have anything even partially broken
  //   installed globally, so we can't rely on it for a first-run
  // * `node-gyp -v` is semi-busted on Windows because of the way Node handles
  //   stdin, 50% of the time it gets lost and not passed up through child_process
  // Solution is to try `node-gyp -v` twice and then resort to `npm ls -g`
  // to play the odds...
  // Need a better solution, idea from @visnup is to `node-gyp -v > out`

  nodeGypV(false, function (err, pass, versionString) {
    if (pass) {
      passFail(pass, versionString)
      return callback(null, true)
    }

    nodeGypV(true, function (err, pass, versionString) {
      if (pass) {
        passFail(pass, versionString)
        return callback(null, true)
      }

      npmLsG(function (err, pass, versionString) {
        passFail(pass, versionString)
        callback(null, pass)
      })

    })

  })
}


function checkBuild (pass, callback) {
  if (!pass)
    return callback()

  console.log('Running `node-gyp`, this may take a few minutes if it hasn\'t been run before...')

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

    child_process.exec(
          '"'
        + process.execPath
        + '" "'
        + require.resolve('./child')
        + '" '
        + testPackageRnd
      , { env: process.env }
      , function (err, stdout, stderr) {
          stdout.toString().split(/\n/).filter(Boolean).forEach(function (s) {
            exercise.emit('pass', s)
          })

          stderr.toString().split(/\n/).filter(Boolean).forEach(function (s) {
            exercise.emit('fail', s)
          })

          exercise.emit(stderr.length ? 'fail' : 'pass', 'Test binding file works as expected')

          callback(null, !stderr.length)
        })
  })
}

module.exports = exercise
