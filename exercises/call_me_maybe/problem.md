----------------------------------------------------------------------

## Task

Implement a simpler timer mechanism in C++ such that when you call a `delay(x, callback)` method from JavaScript, your C++ code will sleep for `x` seconds and then calls the `callback` function. The callback should print "Done!" to standard output. The number of seconds should come from the first command-line argument.

----------------------------------------------------------------------

## Description

You can reuse your previous submission but you need to adjust it in two places:

**index.js**: you need to now call a `delay()` method and pass the number of seconds from the command-line as the first argument and a callback as the second. In your callback you should perform a `console.log()` when it is called.

**myaddon.cc**: You have a number of things to do to make this work, most importantly:

1. Receive (convert) a `Number` in the first argument to the method (TODO), explain `arg->IntegerValue()` converting int64_t and `->Uint32Value()` and `->Int32Value()` (maybe ..), see
https://thlorenz.github.io/v8-perf/build/v8-3.14.5/html/d9/d29/classv8_1_1_number.html for details (node.institute link but we need to make it more digestable than the thlorenz docs are right now)

2. Make a sleep happen: explain `usleep(ms)` POSIX vs `Sleep(ms)` for Windows and how to use a macro to make this work cross-platform, something like:

```c++
// (at top)
#ifndef _WIN32
#include <unistd.h>
#endif

...

// (in function)
#ifdef _WIN32
Sleep(x)
#else
#define usleep(x)
#endif
```

3. Use `NanMakeCallback()` to call the `argv[1].As<Function>()` `Function` object. Explain why `MakeCallback()` is important for Node rather than just `Function#Call()`, domains, tracing, blah blah.

## Conditions

TODO

----------------------------------------------------------------------

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
 __»__ For help run: `{appname} help`
