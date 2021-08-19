const path = require('path')
const varstring = require('varstring')
const getos = require('getos')
const fs = require('fs')
const instructions = require('./exercises/am_i_ready/vars.json').instructions

const tmpl = path.join(__dirname, 'exercises/am_i_ready/problem.md.tmpl')
const out = path.join(__dirname, 'exercises/am_i_ready/problem.md')
const problem = fs.readFileSync(tmpl, 'utf-8')

getos(function (err, os) {
  if (err) { throw err }

  const lookup = os.dist ? os.dist : os.os
  const markdown = varstring(problem, instructions[lookup] || instructions.Other)

  fs.writeFileSync(out, markdown, 'utf8')
})
