----------------------------------------------------------------------

## Task

Create a Node.js program that takes a `String` command-line argument, passes it to a native Node.js add-on and prints it to standard out with `printf()` (or similar C++ function).

----------------------------------------------------------------------

## Description

This exercise involves a simple modification to your code from the previous exercise but we are making two main modifications:

1. Read a command-line argument from within *index.js* and pass it to the add-on
2. Read an argument from the method defined in your C++ add-on code and send it to the `printf`.

The JavaScript change is simply a matter of reading `process.argv[2]`, the first user-supplied argument, and providing that as an argument to the add-on.

The C++ change requires some understanding of argument handling and V8 data types.

When you use the macro `NAN_METHOD()`, you automatically have access to an `args` argument inside the generated function. This args argument is an array whose members correspond to the arguments passed into the function.

Each element in the array is an object is a v8 type with a special function `As<[type]>()` allowing you to typecast it to a type getting a handle back. So, for example, if we wanted to accept a `v8::Int32` as the 3rd parameter in our function we could call `args[2].As<Int32>()`, and we would receive a handle to the 3rd argument as a 32 bit integer. You will be type casting it as a `v8::String`.

We will then build on top of our `printf` in the previous example, passing our `v8::String` as an argument to be inserted into a *format string*. *hint:* `%s`

But wait! Node is in utf-8 land! `v8::String` includes a function `Utf8Value()` wich converts your argument to a char array that can be safely consumed by printf. Go ahead and use it with `*String::Utf8Value(...)`

To recap, your mission:

* Alter _index.js_ to pass `process.argv[2]` to your native function
* Grab the first argument as a string from inside `Print` and convert it to a utf-8 char array.
* Insert it into a format string using printf.

TODO: simplify

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node . "some string"`. Standard output will be checked that string and your code will be checked to ensure that the C++ code is performing the print.

----------------------------------------------------------------------

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
 __»__ For help run: `{appname} help`
