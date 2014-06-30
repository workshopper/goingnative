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

### `bindings.gyp`

`bindings.gyp` is a JSON-esq file that tells `node-gyp` how to build your project. If you open it up, you will see a basic structure has been created for you with some dummy data, but it will require some love from you before you will get it to compile anything. Lets break down what we are looking at.

Every `bindings.gyp` file has an array of targets, which contains the native module(s) `node-gyp` is going to build for you. Each target in the array will have a `"target_name" : {name}`, which will cause `node-gyp` to output your generated module to `{name}.node`. Every target will also have a `sources` array, which is an array of `*.cc` files which `node-gyp` will use to compile your module. Finally, it will have an `include_dirs` array telling `node-gyp` what files you want to be able to `#include` from your `*.cc` files. Files properly included with `include_dirs` can be `#include`.

Currently, the `binding.gyp` file is telling `node-gyp` to compile `derp.cc` and output it to `derp.node`.

Now, with this information fresh in your mind, its time to show your `binding.gyp` file some love! Your mission: We need to tell `node-gyp` what file we are generating and what source files it needs to use to generate it. With `binding.gyp` open, go ahead and tell `node-gyp` to compile `myaddon.cc` and output it to `myaddon.node`. You also need to tell `node-gyp` where nan is! Go ahead and include the following string (exactly as typed) `"<!(node -e \"require('nan')\")"`

3. TODO: explain addon.cc (see solution/myaddon.cc)
  - missing `Print()` method body
  - missing NODE_MODULE(myaddon, Init)


### `index.js`

Congratulations on compiling your first native module! Now lets load it into node to call it and verify its correctness. In order to load the module, we are going to use the `bindings` module. Although it is now standardized, throughout node history, compiled modules were placed in many places. `bindings` checks *all* possible locations that your compiled modules could be located, and imports the first one found. `bindings` exports a single function, which accepts the name of your module as a parameter. This name *must* match `target_name` in `binding.gyp`. After `bindings` loads in your module, you can simply call the function we created and _presto_ you are running your first compiled module.
To reiterate, your mission is to use `bindings` to load in your compiled module and call the function we created in the previous step.

### Finally

To ensure your solution is correct, run: `{appname} verify {boilerplate:myaddon}`

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node .`, the standard output must be "I am a native addon and I AM ALIVE!" and this must be printed from the compiled (C++) component of your solution.

----------------------------------------------------------------------

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify {boilerplate:myaddon}`
 __»__ For help run: `{appname} help`
