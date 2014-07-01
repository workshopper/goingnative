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

There is only one thing you need to do in this file, which is to tell node to look for your `.gyp` file. Your mission: simply add `"gypfile": true` to your `package.json`

### `bindings.gyp`

`bindings.gyp` is a JSON-esq file that tells `node-gyp` how to build your project. If you open it up, you will see a basic structure has been created for you with some dummy data, but it will require some love from you before you will get it to compile anything. Lets break down what we are looking at.

Every `bindings.gyp` file has an array of targets, which contains the native module(s) `node-gyp` is going to build for you. Each target in the array will have a `"target_name" : {name}`, which will cause `node-gyp` to output your generated module to `{name}.node`. Every target will also have a `sources` array, which is an array of `*.cc` files which `node-gyp` will use to compile your module. Finally, it will have an `include_dirs` array telling `node-gyp` what files you want to be able to `#include` from your `*.cc` files. Files properly included with `include_dirs` can be `#include`.

Currently, the `binding.gyp` file is telling `node-gyp` to compile `derp.cc` and output it to `derp.node`.

Now, with this information fresh in your mind, its time to show your `binding.gyp` file some love! Your mission: We need to tell `node-gyp` what file we are generating and what source files it needs to use to generate it. With `binding.gyp` open, go ahead and tell `node-gyp` to compile `myaddon.cc` and output it to `myaddon.node`. You also need to tell `node-gyp` where nan is! Go ahead and include the following string (exactly as typed) `"<!(node -e \"require('nan')\")"`

### `addon.cc`

Now, with `bindings.gyp` and `package.json` fresh in hand, we are ready to get down to the fun stuff. Lets write C++! If you look in `{boilerplate:myaddon}/myaddon.cc` you can see we have created a structure for you to start from. Lets break down whats going on here.

```cpp
#include <nan.h>
```

An include is a macro that tells the precompiler to "replace" `#include`  with the contents of `nan.h`. This has many parellels to `require` but this is *far* from the same thing.

```cpp
using namespace v8;
```

`using namespace` is a solution to name conflicts from `#include`d files. It tells gcc which scope to look in to find referenced variables and functions that are not declared in the local scope. Here, we are telling gcc that it should search the `v8` scope, which is equivalent to prefixing all functions and variables from the `v8` scope with `v8::`.

```cpp
NAN_METHOD(Print) {

}
```

`nan.h` includes quite a few macros to make your life as a developer easier. These macros wrap the chaos that is the ever changing `v8.h`/`node.h` specification, and exposes them up via a standard api. This means you can make the same function calls against `nan.h` no matter what version of node is running on your machine.

`NAN_METHOD` should be used to define *all* of your v8 accessible methods. In this case, we are defining a v8 accessible method that we will export later called Print. _You will need to update this function to output "I am a native addon and I AM ALIVE!"_. *hint:* if you don't know how to print text to stdout, take a look at `cout` or `printf`.

```cpp
void Init(Handle<Object> exports) {
  exports->Set(NanNew("print"),NanNew<FunctionTemplate>(Print)->GetFunction());
}
```

Calm down. I know, up until this point everything has been fine and dandy, then we throw this monstrocity your way. Its not as bad as it looks. Lets break it down step by step.

* `void Init(Handle<Object> exports) {` we are defining a function that receives an `exports` object. This object can be thought of in the same way as `module.exports` in node.
* `NanNew` creates a new property, which we will be tagging onto `module.exports`. In this case it is `print`.
* `NanNew<FunctionTemplate>(Print)->GetFunction()` is definining a new function object that corresponds to our `NAN_METHOD(Print)` declared above. This is what will be called when we call `myaddon.print()` from our `index.js` file later on.
* `exports->Set` should be pretty verbose now that you know what is going on with the two parameters.

This entire line is equivalent to `module.exports.print = Print` in node. Don't you love C++? We have wrapped this line in a function. We now need to tell v8 where to find our `exports` statement defined above. This you need to add. `nan.h` has a module defined: `NODE_MODULE`, which accepts to parameters. The first is the *name* of the module. This must be *exactly* the same as the name listed in your `binding.gyp` file. This parameter is *not* a string. The second parameter is the name of the function which handles the `exports` statements. For example if you wanted to the name to be `nyan` which called `void Cat(...){...}` you would type `NODE_MODULE(nyan,Cat)`. Go ahead and name the module the same as in `bindings.gyp` and have it call our `Init` function. This should be the last line of your code.

To reiterate, your mission is:

* Make `Print` print "I am a native addon and I AM ALIVE!".
* Have `NODE_MODULE` export your addon and call your `Init` function.

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
