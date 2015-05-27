const path         = require('path')
    , varstring    = require('varstring')
    , getos        = require('getos')
    , fs           = require('fs')
    , after        = require('after')
    , instructions = require('./exercises/am_i_ready/vars.json').instructions


const tmpl    = path.join(__dirname, 'exercises/am_i_ready/problem.md.tmpl')
    , out     = path.join(__dirname, 'exercises/am_i_ready/problem.md')
    , problem = fs.readFileSync(tmpl, 'utf-8')


getos(function (err, os) {
  if (err)
    throw err

  var lookup = os.dist ? os.dist : os.os
  var markdown = varstring(problem, instructions[lookup] || instructions.Other)

  fs.writeFileSync(out, markdown, 'utf8')
})
