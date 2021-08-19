const Workshopper = require('workshopper-adventure')
const path = require('path')
const credits = require('./credits')
const menu = require('./exercises/menu')
const hooray = require('workshopper-hooray')
const more = require('workshopper-more')

const appname = 'goingnative'
const title = 'Going Native'
const subtitle = '\x1b[23mSelect an exercise and hit \x1b[3mEnter\x1b[23m to begin'

function fpath (f) {
  return path.join(__dirname, f)
}

const workshopper = Workshopper({
  name: appname,
  title: title,
  subtitle: subtitle,
  exerciseDir: fpath('./exercises/'),
  appDir: __dirname,
  helpFile: fpath('help.txt'),
  footerFile: false,
  menu: {
    fs: 'white',
    bg: 'black'
  },
  menuItems: [
    {
      name: 'credits',
      handler: credits
    },
    {
      name: 'more',
      menu: false,
      short: 'm',
      handler: more
    }
  ],
  onComplete: hooray
})

workshopper.addAll(menu)
module.exports = workshopper
