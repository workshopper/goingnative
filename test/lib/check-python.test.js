const test = require('tape')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const Exercise = require('workshopper-exercise')
let exercise

const setup = () => {
  exercise = Exercise()
  exercise.__ = sinon.fake()
}

const run = (exercise) => {
  return new Promise(function (resolve) {
    exercise.run([], () => resolve())
  })
}

test('with valid python version', async (t) => {
  t.plan(2)
  setup()
  const version = '3.8.0'
  const stdout = `Python ${version}`
  const checkPython = proxyquire('../../lib/check-python', {
    'node-gyp/lib/find-python': function (config, callback) {
      return callback(null, '/path/python')
    },
    child_process: {
      execFile: (file, args, cb) => {
        return cb(null, { stdout })
      }
    }
  })
  exercise.addProcessor(checkPython)
  await run(exercise)
  t.equal(exercise.__.callCount, 1)
  t.ok(exercise.__.calledWith('pass.python', { version }))
})

test('with invalid python version', async (t) => {
  t.plan(2)
  setup()
  const message = 'Could not find any Python installation to use'
  const error = new Error(message)
  const checkPython = proxyquire('../../lib/check-python', {
    'node-gyp/lib/find-python': function (config, callback) {
      return callback(error)
    }
  })
  exercise.addProcessor(checkPython)
  await run(exercise)
  t.equal(exercise.__.callCount, 1)
  t.ok(exercise.__.calledWith('fail.python', { message }))
})
