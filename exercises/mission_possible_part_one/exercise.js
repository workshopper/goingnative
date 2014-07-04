const boilerplate  = require('workshopper-boilerplate')
    , path         = require('path')
    , copy         = require('../../lib/copy')
    , solutions    = require('../../lib/solutions')
    , check        = require('../../lib/check')
    , gyp          = require('../../lib/gyp')
    , packagejson  = require('../../lib/packagejson')


      // name of the module required in binding.gyp
const boilerplateName = 'myaddon'
      // what we should get on stdout for this to pass
    , solutionFiles   = [ 'package.json', 'binding.gyp' ]


var exercise = require('workshopper-exercise')()


// add solutions file listing from solutions/ directory
exercise = solutions(exercise, solutionFiles)
// add boilerplate functionality
exercise = boilerplate(exercise)

// boilerplate directory to copy into CWD to give them a base to start from
exercise.addBoilerplate(path.join(__dirname, 'boilerplate/' + boilerplateName))
// need to add the two deps (bindings & nan) into node_modules so they don't *need* to `npm install`
exercise.addPrepare(boilerplateSetup)

// the steps towards verification
exercise.addProcessor(check.checkSubmissionDir)
exercise.addProcessor(packagejson.checkPackageJson)
exercise.addProcessor(gyp.checkBinding)

// complete the copied boilerplate dir by adding node_modules/bindings/
// so they don't need to `npm install bindings`
function boilerplateSetup (callback) {
  var target = path.join(process.cwd(), exercise.boilerplateOut[boilerplateName])
  copy.copyDeps(target, callback)
}


module.exports = exercise