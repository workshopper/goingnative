{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Task

Implement a simpler timer mechanism in C++ such that when you call a `delay(x, callback)` method from JavaScript, your C++ code will sleep for `x` milliseconds and then call the `callback` function. The callback should print "Done!" to standard output from JavaScript.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Description

You can reuse your previous submission but you need to adjust it in two places:

**index.js**: you need to now call a `delay()` method and pass the number of seconds from the command-line as the first argument and a callback as the second. In your callback you should perform a `console.log()` when it is called.

**myaddon.cc**: You have a number of things to do to make this work, most importantly:

* Receive a `Number` in the first argument to the method and convert it to a C++ `int` value. The simplest way to do this is use the `handle->IntegerValue()` method which will return a `int64_t` type value. Thankfully we can just call this an `int` but it's worth knowing that it's a 64-bit integer when converted.


* Make a **sleep** happen. Unfortunately you achieve this differently in C++ depending on your platform, and what's more, you *should* write your native add-ons to be cross-platform compatible. In Windows you would call the built-in function `Sleep(time)` (where `time` is in milliseconds), while in other (*"POSIX-compliant"*) systems such as Linux and OS X, you call `usleep(time)` (where `time` is in microseconds). `usleep()` also requires that we `#include` the *unistd.h* system header.

To make a cross-platform sleep, we can use C++ macros to determine whether we are compiling on Windows or not.

```c++
// at the top of your file
#ifndef _WIN32
#include <unistd.h>
#endif

...

// (in function)
#ifdef _WIN32
Sleep(x)
#else
usleep(x)
#endif
```

3. Use `NanMakeCallback()` to call the callback function, which will be of type `Function`. Recall that to convert to a `Local<Function>` you can use `argv[1].As<Function>()`. V8 `Function` objects have a `Call()` method on them but `NanMakeCallback()` invokes the necessary Node.js machinery required to wire up proper domains and other debugging support so is the preferred method.

A callback can be invoked as follows:

```c++
NanMakeCallback(NanGetCurrentContext()->Global(), callback, 0, NULL);
```

Where the first argument equates to what to use as `this` in JavaScript (in most cases it will just be `global`), the second argument is the `Local<Function>`, the third is the number of arguments to apply to the function and the fourth is an array of `Local<Value>` handles. In this case there are zero (`0`) arguments so we can use the C++ `NULL` identifier.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node . x`, where `x` is an integer representing the number of milliseconds to sleep. Your code will be timed to ensure an appropriate amount of time has delayed before the program exits. Standard output will be checked for `"Done!"`. Your code will be checked to ensure that the C++ code is performing the upper-casing.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
 __»__ For help run: `{appname} help`
