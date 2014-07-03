{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Task

Create a native Node.js add-on that can be compiled by node-gyp / npm and loaded from Node.js JavaScript code.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Description

A skeleton of a Node.js native add-on is in a directory named ***{boilerplate:myaddon}*** in your current working directory. The add-on is missing some pieces. You need to supply the missing pieces to make it compile.

When your solution is complete, compiling and running the add-on will succeed without errors:

```sh
$ node-gyp rebuild
$ node .
```

Running the add-on should print the following text:

```
I am a native addon and I AM ALIVE!
```

## Your missions!

### Mission: finish *package.json*

Look at your _package.json_. It has two dependencies that assist with add-on development:

* **NAN**: a standardized C++ interface to Node and V8
* **bindings**: a tool to help find the location of the *compiled* version of your add-on during runtime

*Type `{appname} more` for more information on these dependencies.*

Your mission: tell node to look for your _.gyp_ file. To do this, add `"gypfile": true` to your _package.json_

### Mission: finish *bindings.gyp*

_bindings.gyp_ is a JSON-esq file that tells `node-gyp` how to build your project. Look inside it now. A basic structure has provided for you, but it needs more work.

* `"target_name"` of the single target listed in the file must be the exact name of your add-on. It needs to match the name you use for it in your JavaScript file *and* the name you use in the `NODE_MODULE()` macro in your C++ file. *Set it to `"myaddon"`*.
* The `"sources"` array must include the file name of the C++ file used by your add-on. *Add `myaddon.cc`*.
* The `"include_dirs"` array tells the compiler where to find the *nan.h* header file used by NAN. *Set it to this text:*

  "<!(node -e \"require('nan')\")"

*Type `{appname} more` for more information on bindings.gyp.*

### Mission: write *myaddon.cc*

Let's write C++! In *{boilerplate:myaddon}/myaddon.cc* you have some things to fill in:

```cpp
#include <nan.h>
```

At the top of your file will include the NAN macros and helper code into your build. You can think of this as *similar* to `require()` in Node.js code.

```cpp
using namespace v8;
```

This line imports everything in the "v8" C++ *namespace* into your code so you don't have to explicitly name everything. A `v8::String` is the `String` class inside the "v8" namespace. `using namespace v8` lets us just write `String` to refer to this object.

### Mission: implement Print()

```cpp
NAN_METHOD(Print) {
  // ...
}
```

This construct uses a C++ macro from NAN to expose a public *method* that is accessible via V8 to your JavaScript. The method is called `Print` on the C++ side. It's missing a body! You need to add code to make something happen when it's called.

Your method body should use the standard C `printf()` function to print to standard out. (You can also use `cout` for more idiomatic C++ if you dare.) Provide text surrounded by double-quotes: `printf("a string");`. You need to print the following line:

  "I am a native addon and I AM ALIVE!"

Remember to add an explicit new-line character at the end: `\n`.

### Mission: return a value

Finally, you must return a value from your JavaScript-exposed method, even if all you return is `undefined`. NAN includes several helper functions to cover common cases. Here you want NAN's undefined helper: `NanReturnUndefined()`.

*Add `NanReturnUndefined()` at the bottom of your function.

### Mission: export `Print` to JavaScript

Now we export this method to JavaScript! Copy and paste this line:

```cpp
void Init(Handle<Object> exports) {
  exports->Set(NanNew("print"), NanNew<FunctionTemplate>(Print)->GetFunction());
}
```

Take a deep breath! This line is secretly the equivalent of `module.exports.print = Print` in JavaScript. Let's step through it.

* `void Init(Handle<Object> exports) { .. }` defines a function that receives an `exports` object from V8. This is the same object you would receive in a JavaScript module as `module.exports` but it's now exposed as a C++ type.
* `NanNew()` creates a new V8 object, in this case a `String`. This object is used as the property name of the `exports` object.
* `NanNew<FunctionTemplate>(Print)->GetFunction()` is how we get a reference to the method we declared earlier so that we can expose it to JavaScript.

Notice how we are declaring `print` as an idiomatic JavaScript lower-case name while `Print` is idiomatic C++ title-case. Get used to the verbosity; this is C++ after all!

### Mission: expose the init function to Node.js.

The `Init()` function needs to be given to Node.js because it's the entry-point to the module. Node.js is responsible for passing in the `exports` object. Exposing it to Node.js requires a native Node.js *macro* that does the heavy-lifting of registering your initialization function:

```c++
NODE_MODULE(modulename, InitFunction)
```

Where `modulename` matches the name in your *binding.gyp* and your *index.js* and `InitFunction` is the name of your C++ initialization function that accepts the `exports` object.

### Mission: build it!

When you have these tasks complete, type:

  node-gyp rebuild

and watch your add-on compile. Watch for errors and fix anything that prevents a successful compilation.

### Mission: write *index.js*

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
