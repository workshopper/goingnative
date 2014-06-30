----------------------------------------------------------------------

## Task

Create a native Node.js add-on that can be compiled by node-gyp / npm and loaded from Node.js code.

----------------------------------------------------------------------

## Description

You will find a basic skeleton of a Node.js native add-on in a directory named
*{boilerplate:myaddon}* in your current working directory. To complete this task, you simply need to complete some important parts to make it compile.

When your solution is complete, you should be able to compile and run the program without any errors:

```sh
$ node-gyp rebuild
$ node .
```

And have see the following printed to stdout:

```
I am a native addon and I AM ALIVE!
```

**Things you need to complete**

### `package.json`

Take a look at your `package.json`. You will find some work has already been done for you, specifically dependencies have been included. Lets break down what each do, and why they make your life easier.


* `nan` - nan provides a standardized way to build native modules across different versions of node. From their `README.md`:
    In a moment we will need to tell `node-gyp` where to find nan.


*  `bindings` - bindings is a tool that greatly simplifies requiring native modules into your node apps. From their `README.md`:

There is only one thing you need to do in this file, your mission: simply add `"gypfile": true` to your `package.json`


2. TODO: explain binding.gyp
  - sources needs to have "myaddon.cc"
  - include_dirs MUST have `"<!(node -e \"require('nan')\")"` (exactly)


3. TODO: explain index.js (see solution/index.js)
  - needs to use 'bindings'


4. TODO: explain addon.cc (see solution/myaddon.cc)
  - missing `Print()` method body
  - missing NODE_MODULE(myaddon, Init)


## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node .`, the standard output must be "I am a native addon and I AM ALIVE!" and this must be printed from the compiled (C++) component of your solution.

----------------------------------------------------------------------

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify {boilerplate:myaddon}`
 __»__ For help run: `{appname} help`
