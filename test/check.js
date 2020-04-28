const { spawn } = require('child_process')
const path = require('path')
const fsp = require('fs').promises
const test = require('tape')
const { idFromName } = require('workshopper-adventure/util')

const cleanFile = async (path, callback) => {
  fsp.access(path)
    .then(() => callback(path))
    .catch(e => {})
}

const exercises = require('../exercises/menu.json')
exercises.forEach(function (name) {
  test(name, function (t) {
    t.plan(2)
    const nameId = idFromName(name)
    const solution = path.join(__dirname, '../exercises', nameId, 'solution')

    const ps = run(['select', name])
    ps.on('exit', selected)
    ps.stderr.pipe(process.stderr)

    function selected (code) {
      t.equal(code, 0)
      const ps = run(['verify', solution])
      ps.on('exit', verified)
      ps.stderr.pipe(process.stderr)
      // ps.stdout.pipe(process.stdout)
    }

    async function verified (code) {
      t.equal(code, 0)

      cleanFile('myaddon', async (path) => fsp.rmdir(path, { recursive: true }))
      cleanFile('myaddon.cc', async (path) => fsp.unlink(path))
      cleanFile('index.js', async (path) => fsp.unlink(path))
    }
  })
})

function run (args) {
  args.unshift(path.join(__dirname, '../goingnative.js'))
  return spawn(process.execPath, args)
}
