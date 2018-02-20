{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Task

Implement a simpler timer mechanism in C++ such that when you call a `delay(x, callback)` method from JavaScript, your C++ code will sleep for `x` milliseconds and then call the `callback` function. The callback should print "Done!" to standard output from JavaScript.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Description

You can reuse your previous submission but you need to adjust it in two places.

**index.js**: You must call a `delay()` function, passing the number of milliseconds from the command-line as the first argument and a callback as the second. In your callback you should perform a `console.log()`.

**myaddon.cc**: You need to implement the delay function.

The delay function needs to do the following:

1. Receive a `Number` in the first argument to the method and convert it to a C++ `int` value. First, convert the argument to a `Nan::Maybe<int>` by using the converter `Nan::To<int>(info[0])`. Now you have a convertable native 64-bit (if you need) `int` value from a `Number` _if it has been passed_. Check if it's been passed appropriately by checking the `Maybe` with `IsNothing()`, then if you have a value you can finally get a proper `int` using `FromJust()` on it.
2. Make a **sleep** happen. Unfortunately you achieve this differently in C++ depending on your platform, and what's more, you *should* write your native add-ons to be cross-platform compatible. On Windows, you call the built-in function `Sleep(time)` (where `time` is in milliseconds). On "POSIX-compliant" systems like Linux and OS X, you call `usleep(time)` (where `time` is in **microseconds**). To call `usleep()`, you must `#include` the *unistd.h* system header.

To make a cross-platform sleep, we can use C++ macros to determine whether we are compiling on Windows or not.

```c++
// at the top of your file
#ifndef _WIN32
#include <unistd.h>
#endif

...

// (in function)
#ifdef _WIN32
Sleep(x);
#else
usleep(x * 1000);
#endif
```

3. Use `Nan::MakeCallback()` to call the callback function, which will be of type `Function`. Recall that to convert to a `Local<Function>` you can use `info[1].As<Function>()`. V8 `Function` objects have a `Call()` method on them that you can use. `Nan::MakeCallback()` improves on this by wiring up domains and other debugging support, so that's what we'll use here.

Use `Nan::MakeCallback()`` like this:

```c++
Nan::MakeCallback(Nan::GetCurrentContext()->Global(), callback, 0, NULL);
```

The first argument specifies what to use as `this` in JavaScript. Here it's just be `global`. The second argument is the function you wish to use as a callback. The third argument is the number of arguments to apply to the function. The fourth argument is an array of `Local<Value>` handles that supply the arguments. In this case, we're not passing any arguments to the callback, so we specify `0` arguments and a `NULL` array.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node . x`, where `x` is an integer representing the number of milliseconds to sleep. Your code will be timed to ensure an appropriate amount of time has delayed before the program exits. Standard output will be checked for `"Done!"`. Your code will be checked to ensure that the C++ code is performing the sleep.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
 __»__ For help run: `{appname} help`
