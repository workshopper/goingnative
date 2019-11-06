#!/usr/bin/env node

const Workshopper = require('workshopper-adventure')
    , path        = require('path')
    , credits     = require('./credits')
    , menu        = require('./exercises/menu')
    , hooray      = require('workshopper-hooray')
    , more        = require('workshopper-more')

    , appname     = 'goingnative'
    , title       = 'Going Native'
    , subtitle    = '\x1b[23mSelect an exercise and hit \x1b[3mEnter\x1b[23m to begin'


function fpath (f) {
  return path.join(__dirname, f)
}


const workshopper = Workshopper({
    name        : appname
  , title       : title
  , subtitle    : subtitle
  , exerciseDir : fpath('./exercises/')
  , appDir      : __dirname
  , helpFile    : fpath('help.txt')
  , footerFile  : false
  , menu        : {
        fs: 'white'
      , bg: 'black'
    }
  , menuItems: [
      {
          name    : 'credits'
        , handler : credits
      }
    , {
          name    : 'more'
        , menu    : false
        , short   : 'm'
        , handler : more
      }
    ]
  , onComplete  : hooray
})

workshopper.addAll(require('./exercises/menu.json'));
workshopper.execute(process.argv.slice(2))
