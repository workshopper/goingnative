{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Task

Finish your add-on by adding a C++ function that prints a message to standard output when invoked by JavaScript.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Description

Because C++ is no simple matter, you have been provided with a skeleton of an add-on file. Move the file named ***{boilerplate:myaddon.cc}*** in your current working directory, *to* the directory containing your add-on, calling it *myaddon.cc*.

### Mission: write *myaddon.cc*

Let's write C++! In *myaddon.cc* you have some things to fill in.


At the top of your file you must include the NAN macros and helper code into your build. You can think of this as *similar* to `require()` in Node.js code. Here's the include line you need:


```cpp
#include <nan.h>
```

Now you must use the v8 namespace:

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

If you need to return a value from your function, you can do so by passing a variable to `info.GetReturnValue().Set()`

### Mission: export `Print` to JavaScript

Now we export this method to JavaScript! Copy and paste this line:

```cpp
NAN_MODULE_INIT(Init) {
  Nan::Set(target, Nan::New("print").ToLocalChecked(),
      Nan::GetFunction(Nan::New<FunctionTemplate>(Print)).ToLocalChecked());
}
```

Take a deep breath! This line is secretly the equivalent of `module.exports.print = Print` in JavaScript. Let's step through it.


* `NAN_MODULE_INIT(Init) { .. }` defines a function that receives a `target` object from V8. This is the same object you would receive in a JavaScript module as `module.exports` but it's now exposed as a C++ type.
* `Nan::New()` creates a new V8 object, in this case a `String`. This object is used as the property name of the `exports` object.
* `Nan::GetFunction(Nan::New<FunctionTemplate>(Print)).ToLocalChecked())` is how we get a reference to the method we declared earlier so that we can expose it to JavaScript.


Notice how we are declaring `print` as an idiomatic JavaScript lower-case name while `Print` is idiomatic C++ title-case. Get used to the verbosity; this is C++ after all!

### Mission: expose the init function to Node.js.

The `NAN_MODULE_INIT(Init)` function needs to be given to Node.js because it's the entry-point to the module. Node.js is responsible for passing in the `exports` object. Exposing it to Node.js requires a native Node.js *macro* that does the heavy-lifting of registering your initialization function:

```c++
NODE_MODULE(modulename, InitFunction)
```

Where `modulename` matches the name in your *binding.gyp* and your *index.js* and `InitFunction` is the name of your C++ initialization function that accepts the `exports` object.

### Mission: build it!

When you have these tasks complete, type:

  node-gyp rebuild

and watch your add-on compile. Watch for errors and fix anything that prevents a successful compilation.

Running the add-on should print the following text:

```
I am a native addon and I AM ALIVE!
```

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node .`, the standard output must be "I am a native addon and I AM ALIVE!" and this must be printed by the compiled (C++) component of your solution.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To print additional learning material relating to these instructions, run: `{appname} more`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
 __»__ For help run: `{appname} help`
