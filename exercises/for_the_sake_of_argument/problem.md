{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Task

Create a Node.js program that takes a `String` command-line argument, passes it to a native Node.js add-on which prints it to standard output with `printf()` (or similar).

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Description

This exercise starts with your code from the previous exercise, but adds two new features:

1. Read a command-line argument from within *index.js* and pass it to the add-on.
2. Read an argument from the method defined in your C++ add-on code and send it to the `printf()` function.

Feature #1 is implemented entirely in JavaScript. All you need to do is read `process.argv[2]`, the first user-supplied argument, and pass that as an argument to the add-on method.

Feature #2 is a C++ change. To implement it, you'll need to learn about argument handling and V8 data types.

### I wanted an argument!

When you use the macro `NAN_METHOD()`, you automatically have access to an `info` array inside the method even though you don't see it declared. The elements of this array correspond to the arguments passed in, so `info[0]` is the first argument.

NAN contains a special function `To<T>()` that lets you *convert* a `v8::Value` to another `V8` type. This value returns either a `MaybeLocal<T>` or `Maybe<T>` - this is because some values cannot be converted to other types. You must check if the response value is empty before using `::IsEmpty()`, like so:

```c++
Nan::MaybeLocal<Number> maybeNum = Nan::To<Number>(info[2]);
if (maybeNum.IsEmpty() == false) {
  Local<Number> num = maybeNum.ToLocalChecked();
}
```

### Handles

`Local<Number>` is a V8 object *handle*. A handle is a special wrapper for a C++ object that allows it to behave properly inside V8. Most of the time a handle will be a `Local`. A `String` handle would be defined as `Local<String>`. In this case, we've extracted the third argument as a `Number` type, so we can use it as a number instead of as a generic object.

For this exercise, you'll need to extract the function argument as a `String` type for printing. But because JavaScript lives in UTF-8-land you can't just print the string handle! To get a C-compatible string to give to `printf()` you need to get a decoded UTF-8 version of the raw data inside the object. To do this, create a `String::Utf8Value()` object using the string handle. Use the `*` *operator* of the Utf8Value object to pass it to `printf` like this:

```c++
printf("%s\n", *String::Utf8Value(str));
```

`str` must be a V8 `String` handle.

Note how we are using `printf("format string", arg1, arg2, ...);`. `"format string"` is a string that can contain argument specifiers, similar to the ones you use with node's `util.format()`.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node . "some string"`. Standard output will be checked for that string. Your code will be checked to ensure that the C++ code is performing the print.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To print additional learning material relating to these instructions, run: `{appname} more`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
 __»__ For help run: `{appname} help`
