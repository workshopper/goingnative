const { exec } = require('child_process')

function defaultProcessPass (pass, stdout, stderr) {
  if (!pass) {
    process.stderr.write(stderr)
    process.stdout.write(stdout)
  }
}

function defaultResolvePass (expected, stdout) {
  return stdout.toString().replace('\r', '') === expected
}

function execWith (dir, arg, expect, options, callback) {
  if (!callback) {
    callback = options
  }

  exec(`'${process.execPath}' '${dir}' '${arg}'`, function (err, stdout, stderr) {
    if (err) {
      process.stderr.write(stderr)
      process.stdout.write(stdout)
      return callback(err)
    }

    const expected = typeof (expect) === 'function' ? expect(arg) : expect
    const resolvePass = options.resolvePass || defaultResolvePass
    const processPass = options.processPass || defaultProcessPass

    const pass = resolvePass(expected, stdout)

    processPass(pass, stdout, stderr)

    callback(null, pass)
  })
}

module.exports = execWith
