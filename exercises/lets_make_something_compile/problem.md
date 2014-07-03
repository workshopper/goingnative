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

## Things you need to complete:

### *package.json*

Take a look at your _package.json_. You will find some work has already been done for you, specifically you have two dependencies to assist with add-on development:

* **NAN**: provides a standardized C++ interface to Node and V8
* **bindings**: a tool to help find the location of the *compiled* version of your add-on during runtime

*Type `{appname} more` for more information on these dependencies.*

There is only one thing you need to do in this file, which is to tell node to look for your _.gyp_ file. Your mission: simply add `"gypfile": true` to your _package.json_

### *bindings.gyp*

_bindings.gyp_ is a JSON-esq file that tells `node-gyp` how to build your project. If you open it up, you will see a basic structure has been created for you but it will require some work.


* Set the `"target_name"` of the single target listed in the file to the exact name of your add-on. This needs to match the name you refer to it in your JavaScript file *and* the name you provide for the `NODE_MODULE()` macro in your C++. For simplicity, make it `"myaddon"`.
* Set the `"sources"` array to just have the filename of the C++ (*.cc*) file used by your add-on.
* Set the `"include_dirs"` array to just have the following construct that is designed to tell the compiler where to find the *nan.h* header file from the NAN dependency:

  "<!(node -e \"require('nan')\")"

*Type `{appname} more` for more information on bindings.gyp.*

### *addon.cc*

Let's write C++! In *{boilerplate:myaddon}/myaddon.cc* you have some things to fill in:

```cpp
#include <nan.h>
```

At the top of your file will include the NAN macros and helper code into your build. You can think of this as *similar* to `require()` in Node.js code.

```cpp
using namespace v8;
```

Underneath the `#include` will import everything in the "v8" C++ *namespace* into your code so you don't have to explicitly name everything. The "v8" namespace separates out all of the V8 components and types from everything else so we don't have name collisions. A `v8::String` is the `String` class inside the "v8" namespace. `using namespace v8` lets us just write `String` to refer to this object.

```cpp
NAN_METHOD(Print) {
  // ...
}
```

This construct uses a C++ macro from NAN to expose a public *method* that is accessible via V8 to your JavaScript. The method is called `Print` on the C++ side and it needs a body; you need to add code to make something happen when it's called!

Your method body should use the standard C `printf()` function to print to standard out (you can also use `cout` for more idiomatic C++ if you dare). Simply provide text surrounded by double-quotes: `printf("a string");`. You need to print the following line, and don't forget an explicit new-line character:

  "I am a native addon and I AM ALIVE!"

```cpp
void Init(Handle<Object> exports) {
  exports->Set(NanNew("print"), NanNew<FunctionTemplate>(Print)->GetFunction());
}
```

Calm down and breathe slowly, it's not as bad as it looks!

* `void Init(Handle<Object> exports) { .. }` defines a function that receives an `exports` object from V8. This is the same object you would receive in a JavaScript module as `module.exports` but it's now exposed as a C++ type.
* `NanNew()` creates a new V8 object, in this case a `String`, which is used as the property name of the `exports` object.
* `NanNew<FunctionTemplate>(Print)->GetFunction()` is how we get a reference to the method we declared earlier so that we can expose it into JavaScript. The reference is a standard JavaScript `function` object.

This line is equivalent to `module.exports.print = Print` in JavaScript. Notice how we are declaring `print` as an idiomatic JavaScript lower-case name while `Print` is idiomatic C++ title-case. Get used to the verbosity, this is C++ after all!

The `Init()` function needs to be given to Node.js because it's the entry-point to the module and Node.js will be responsible for passing in the `exports` object. Exposing it to Node.js requires a native Node.js *macro* that does the heavy-lifting of registering your initialization function:

```c++
NODE_MODULE(modulename, InitFunction)
```

Where `modulename` matches the name in your *binding.gyp* and your *index.js* and `InitFunction` is the name of your C++ initialization function that accepts the `exports` object.

When you have these tasks complete, type:

  node-gyp rebuild

and watch your add-on compile. Watch for errors and fix anything that prevents a successful compilation.

### *index.js*

Your JavaScript now needs to *load* your native add-on into the Node.js runtime and call the `print()` method. We are using the *bindings* library to simplify the locating and loading of the compiled binary file. Load your add-on module with:

```js
var addon = require('modulename')
```

Where `modulename` is the name in your *binding.gyp* and your `NODE_MODULE` declaration.

Then go ahead and call the `print()` method you defined and see if your code executes as expected!

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node .`, the standard output must be "I am a native addon and I AM ALIVE!" and this must be printed by the compiled (C++) component of your solution.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To print additional learning material relating to these instructions, run: `{appname} more`
 __»__ To compile and test your solution, run: `{appname} verify {boilerplate:myaddon}`
 __»__ For help run: `{appname} help`
