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

1. TODO: explain package.json

2. TODO: explain binding.gyp
  - sources needs to have "myaddon.cc"
  - include_dirs MUST have `"<!(node -e \"require('nan')\")"` (exactly)

3. TODO: explain addon.cc (see solution/myaddon.cc)
  - missing `Print()` method body
  - missing NODE_MODULE(myaddon, Init)


### `index.js`

Congratulations on compiling your first native module! Now lets load it into node to call it and verify its correctness. In order to load the module, we are going to use the `bindings` module. Although it is now standardized, throughout node history, compiled modules were placed in many places. `bindings` checks *all* possible locations that your compiled modules could be located, and imports the first one found. `bindings` exports a single module, which accepts the name of your module as a parameter. This name *must* match `target_name` in `binding.gyp`. After `bindings` loads in your module, you can simply call the function we created and _presto_ you are running your first compiled module.
To reiterate, your mission is to use `bindings` to load in your compiled module and call the function we created in the previous step.

### Finally

To ensure your solution is correct, run: `{appname} verify {boilerplate:myaddon}`

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node .`, the standard output must be "I am a native addon and I AM ALIVE!" and this must be printed from the compiled (C++) component of your solution.

----------------------------------------------------------------------

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify {boilerplate:myaddon}`
 __»__ For help run: `{appname} help`
