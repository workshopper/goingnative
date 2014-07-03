{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Task

Create a Node.js program that takes a `String` command-line argument, passes it to a native Node.js add-on which prints it to standard output with `printf()` (or similar).

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Description

This exercise involves a simple modification to your code from the previous exercise but we are making two main modifications:

1. Read a command-line argument from within *index.js* and pass it to the add-on
2. Read an argument from the method defined in your C++ add-on code and send it to the `printf()` function

The JavaScript change is simply a matter of reading `process.argv[2]`, the first user-supplied argument, and providing that as an argument to the add-on method you are calling.

The C++ change requires some understanding of argument handling and V8 data types.

V8 objects are generally contained within a *"handle"*, a special wrapper for the object that allows it to behave properly inside V8. Most of the time a handle will be a `Local`. A `String` handle would be defined as `Local<String>`.

When you use the macro `NAN_METHOD()`, you automatically have access to an `args` array inside the method even though you don't see it declared. The elements of this array correspond to the arguments passed in, so `args[0]` is the first argument.

Each element in the array is an object is a V8 type with a special function `As<Type>()` allowing you to *cast* it to a different V8 type. e.g. to use a `v8::Number` type as the 3rd argument in your method, write:

```c++
Local<Number> num = args[2].As<Number>();
```

We would then be able to use it as a `Number` type rather than a generic `Object`.

You will need to cast to a `String` type for printing. But because JavaScript lives in UTF-8-land it's not quite so simple! To get a C-compatible string to give to `printf()` you need to get a decoded UTF-8 version of the raw data inside the object. To do this, you need to use the `String::Utf8Value()` object and the `*` *operator* of this object in the following way:

```c++
printf("str: %s\n", *String::Utf8Value(str));
```

Assuming that `str` is a V8 `String` handle.

Note how we are using `printf("format string", arg1, arg2, ...);` where `"format string"` is a simple string that can contain argument specifiers such as `%s` to insert a string argument and `%d` to insert an integer argument. e.g. `printf("Speed: %d %s\n", 100, "mph");`

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node . "some string"`. Standard output will be checked for that string. Your code will be checked to ensure that the C++ code is performing the print.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To print additional learning material relating to these instructions, run: `{appname} more`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
 __»__ For help run: `{appname} help`
