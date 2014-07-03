{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Task

Create a native Node.js add-on that can be compiled by node-gyp / npm and loaded from Node.js JavaScript code.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Description

You will find a basic skeleton of a Node.js native add-on in a directory named ***{boilerplate:myaddon}*** in your current working directory. To complete this task, you need to complete some important parts to make it compile.

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

### _package.json_

Take a look at your _package.json_. You will find some work has already been done for you, specifically you have two dependencies to assist with add-on development:

* **NAN**: provides a standardized C++ interface to Node and V8
* **bindings**: a tool to help find the location of the *compiled* version of your add-on during runtime


There is only one thing you need to do in this file, which is to tell node to look for your _.gyp_ file. Your mission: simply add `"gypfile": true` to your _package.json_

### _bindings.gyp_

_bindings.gyp_ is a JSON-esq file that tells `node-gyp` how to build your project. If you open it up, you will see a basic structure has been created for you with some dummy data, but it will require some love from you before you will get it to compile anything. Lets break down what we are looking at.

Every _bindings.gyp_ file has an array of targets, which contains the native module(s) `node-gyp` is going to build for you. Each target in the array will have a `"target_name" : {name}`, which will cause `node-gyp` to output your generated module to `{name}.node`. Every target will also have a `sources` array, which is an array of _*.cc_ files which `node-gyp` will use to compile your module. Finally, it will have an `include_dirs` array telling `node-gyp` what files you want to be able to `#include` from your _*.cc_ files. Files properly included with `include_dirs` can be `#include`.

Currently, the _binding.gyp_ file is telling `node-gyp` to compile _derp.cc_ and output it to _derp.node_.

Now, with this information fresh in your mind, its time to show your _binding.gyp_ file some love! Your mission: We need to tell `node-gyp` what file we are generating and what source files it needs to use to generate it. With _binding.gyp_ open, go ahead and tell `node-gyp` to compile _myaddon.cc_ and output it to _myaddon.node_. You also need to tell `node-gyp` where nan is! Go ahead and include the following string (exactly as typed) `"<!(node -e \"require('nan')\")"`

### _addon.cc_

Now, with _bindings.gyp_ and _package.json_ fresh in hand, we are ready to get down to the fun stuff. Lets write C++! If you look in _{boilerplate:myaddon}/myaddon.cc_ you can see we have created a structure for you to start from. Lets break down whats going on here.

```cpp
#include <nan.h>
```

An include is a macro that tells the precompiler to "replace" `#include`  with the contents of _nan.h_. This has many parellels to `require` but this is *far* from the same thing.

```cpp
using namespace v8;
```

`using namespace` is a solution to name conflicts from `#include`d files. Namespaces are often declared inside header files to differentiate their variable and function names from those of other packages. In this case, we are telling gcc that it should be looking inside the `v8` namespace for all variables that it can't find in the current scope of the file, which is equivalent to prefixing all functions and variables from the `v8` namespace with `v8::`.

```cpp
NAN_METHOD(Print) {

}
```

_nan.h_ includes quite a few macros to make your life as a developer easier. These macros wrap the chaos that is the ever changing _v8.h_ / _node.h_ specification, and exposes them up via a standard api. This means you can make the same function calls against _nan.h_ no matter what version of node is running on your machine.

`NAN_METHOD` should be used to define *all* of your v8 accessible methods. In this case, we are defining a v8 accessible method that we will export later called Print. _You will need to update this function to output "I am a native addon and I AM ALIVE!"_. *hint:* if you don't know how to print text to stdout, take a look at `cout` or `printf`.

```cpp
void Init(Handle<Object> exports) {
  exports->Set(NanNew("print"),NanNew<FunctionTemplate>(Print)->GetFunction());
}
```

Calm down. I know, up until this point everything has been fine and dandy, then we throw this monstrocity your way. Its not as bad as it looks. Lets break it down step by step.

* `void Init(Handle<Object> exports) {` we are defining a function that receives an `exports` object. This object can be thought of in the same way as `module.exports` in node.
* `NanNew` creates a new property, which we will be tagging onto `module.exports`. In this case it is `print`.
* `NanNew<FunctionTemplate>(Print)->GetFunction()` is definining a new function object that corresponds to our `NAN_METHOD(Print)` declared above. This is what will be called when we call `myaddon.print()` from our _index.js_ file later on.
* `exports->Set` should be pretty verbose now that you know what is going on with the two parameters.

This entire line is equivalent to `module.exports.print = Print` in node. Don't you love C++? We have wrapped this line in a function. We now need to tell v8 where to find our `exports` statement defined above. This you need to add. _nan.h_ has a module defined: `NODE_MODULE`, which accepts to parameters. The first is the *name* of the module. This must be *exactly* the same as the name listed in your _binding.gyp_ file. This parameter is *not* a string. The second parameter is the name of the function which handles the `exports` statements. For example if you wanted to the name to be `nyan` which called `void Cat(...){...}` you would type `NODE_MODULE(nyan,Cat)`. Go ahead and name the module the same as in _bindings.gyp_ and have it call our `Init` function. This should be the last line of your code.

To reiterate, your mission is:

* Make `Print` print "I am a native addon and I AM ALIVE!".
* Have `NODE_MODULE` export your addon and call your `Init` function.

### _index.js_

Congratulations on compiling your first native module! Now lets load it into node to call it and verify its correctness. In order to load the module, we are going to use the `bindings` module. Although it is now standardized, throughout node history, compiled modules were placed in many places. `bindings` checks *all* possible locations that your compiled modules could be located, and imports the first one found. `bindings` exports a single function, which accepts the name of your module as a parameter. This name *must* match `target_name` in _binding.gyp_. After `bindings` loads in your module, you can simply call the function we created and _presto_ you are running your first compiled module.
To reiterate, your mission is to use `bindings` to load in your compiled module and call the function we created in the previous step.

### Finally

To ensure your solution is correct, run: `{appname} verify {boilerplate:myaddon}`

TODO: WAAAAAAY simplify

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node .`, the standard output must be "I am a native addon and I AM ALIVE!" and this must be printed from the compiled (C++) component of your solution.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify {boilerplate:myaddon}`
 __»__ For help run: `{appname} help`
