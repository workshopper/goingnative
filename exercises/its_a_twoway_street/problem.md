----------------------------------------------------------------------

## Task

Create a native Node.js add-on that can read a `String` argument and return an upper-cased version of that string.

----------------------------------------------------------------------

## Description

You should have an index.js file that calls the function `uppercase()` in your native add-on with `process.argv[2]` as the only argument. The add-on should perform a conversion to the upper-case form of the string and set it as the return value. The return value of that call should then be printed to the console.

- TODO: how to get an argument in C++
- TODO: how to upper-case in C++ by accessing the V8 String function for it
- TODO: how to return a value in C++

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node . "some string"`. Standard output will be checked for an upper-cased version of that string and your code will be checked to ensure that the C++ code is performing the upper-casing.

----------------------------------------------------------------------

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
 __»__ For help run: `{appname} help`
