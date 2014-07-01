const varstring = require('varstring')
    , getos     = require('getos')
    , fs        = require('fs')


;(function() {
  var problem
    , vars
    , distro


  const c = complete(3,function() {
    if( distro != "Debian" &&
        distro != "Ubuntu" &&
        distro != "Darwin" &&
        distro != "Arch Linux") //Supported distros
        distro = "Other"

    Object.keys(vars[distro]).forEach(function(v) {
      vars[distro][v] = "```bash\n  "
                      + vars[distro][v]
                      + "\n  ```"
    })

    var markdown = varstring(problem,vars[distro])

    fs.writeFile('exercises/am_i_ready/problem.md', markdown, function(e) {
      if(e) console.stderr(e.stack)
    })
  })

  fs.readFile("exercises/am_i_ready/problem.md",'utf-8', function(e,data) {
    if(e)
      return console.error(e.stack)

    problem = data

    c()
  })

  fs.readFile("exercises/am_i_ready/vars.json", function(e,data) {
    if(e)
      return console.error(e.stack)

    vars = JSON.parse(data).Instructions

    c()
  })

  getos(function(e,os) {
    if(e)
      return console.error(e.stack)

    distro = os

    c()
  })
})()

function complete(count,cb) {
  var calls = 0

  return function() {
    if(++calls == count) return cb()
  }
}
