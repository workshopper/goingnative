const varstring = require('varstring')
    , getos     = require('getos')
    , fs        = require('fs')
    , after     = require('after')


var problem
  , vars
  , distro


var done = after(3, function (err) {
  if (err)
    throw err

  if (distro != 'Debian' &&
      distro != 'Ubuntu' &&
      distro != 'Darwin' &&
      distro != 'Arch Linux') { //Supported distros
      distro = 'Other'
  }

  var markdown = varstring(problem, vars[distro])

  fs.writeFileSync('exercises/am_i_ready/problem.md', markdown, 'utf8')
})

fs.readFile('exercises/am_i_ready/problem.md.tmpl', 'utf-8', function (err, data) {
  if (err)
    return done(err)

  problem = data
  done()
})

fs.readFile('exercises/am_i_ready/vars.json', function (err, data) {
  if (err)
    return done(err)

  vars = JSON.parse(data).Instructions
  done()
})

getos(function (err, os) {
  if (err)
    return done(err)

  distro = os
  done()
})
