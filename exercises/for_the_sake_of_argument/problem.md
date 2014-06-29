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

- TODO: explain this: printf("%s\n", *String::Utf8Value(args[0].As<String>()));
  - printf with the format string and newline
  - args[0]
  - .As<String>() cast
  - *String::Utf8Value()


## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node . "some string"`. Standard output will be checked that string and your code will be checked to ensure that the C++ code is performing the print.

----------------------------------------------------------------------

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
 __»__ For help run: `{appname} help`
