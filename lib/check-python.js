const { promisify } = require('util')
const execFile = promisify(require('child_process').execFile)
const findPython = require('node-gyp/lib/find-python')

const checkPython = function (mode, callback) {
  const exercise = this

  findPython({}, async (err, python) => {
    if (err) {
      exercise.emit('fail', exercise.__('fail.python', { message: err.message }))
      return callback(null, false)
    }

    const { stdout } = await execFile(python, ['-V']).catch(e => console.log(e))
    const version = stdout.split(' ')[1]
    exercise.emit('pass', exercise.__('pass.python', { version }))
    callback(null, true)
  })
}

module.exports = checkPython
