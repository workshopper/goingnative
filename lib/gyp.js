const gyp = require('node-gyp')


function rebuild (dir, _callback) {
  var cwd     = process.cwd()
    , gypInst = gyp()

  callback = function (err) {
    _callback(err)
  }

  gypInst.parseArgv([ null, null, 'rebuild', '--loglevel', 'silent' ])
  process.chdir(dir)
  gypInst.commands.clean([], function (err) {
    if (err)
      return callback(new Error('node-gyp clean: ' + err.message))
    gypInst.commands.configure([], function (err) {
      if (err)
        return callback(new Error('node-gyp clean: ' + err.message))
      gypInst.commands.build([], function (err) {
        if (err)
          return callback(new Error('node-gyp build: ' + err.message))

        process.chdir(cwd)
        return callback()
      })
    })
  })
}


module.exports.rebuild = rebuild 