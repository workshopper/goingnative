----------------------------------------------------------------------

## Task

Create a native Node.js add-on that can read a `String` argument and returns a integer indicating the length of that string.

----------------------------------------------------------------------

## Description

You should have an index.js file that calls the function `length()` in your native add-on with `process.argv[2]` as the only argument. The add-on should calculate the length of the string using the standard C `strlen()` function on the UTF-8 version of the string and set the resulting value as the return value of the method. The return value of that call should then be printed to the console by your JavaScript code.

- TODO: how to get an argument in C++
- TODO: explain strlen() and how it needs a *String::Utf8Value() of your arg
- TODO: explain NanNew(len)
- TODO: explain the need for NanScope()
- TODO: how to return a value in C++ using NanReturnValue(value)

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node . "some string"`. Standard output will be checked for an upper-cased version of that string and your code will be checked to ensure that the C++ code is performing the upper-casing.

----------------------------------------------------------------------

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
 __»__ For help run: `{appname} help`
