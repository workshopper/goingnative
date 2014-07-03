{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Task

Create a native Node.js add-on that can read a `String` argument and returns a integer indicating the length of that string.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Description

Instead of a `print()` method, your native add-on now needs to have a `length()` method. This function will accept a string as per the last exercise and return back the number of characters in that string.

We need the 8-byte character length of the string which will be different than `String#length` in JavaScript for strings that include multi-byte UTF-8 characters (such as "♥").

To calculate the length you can use the standard C function `strlen()`. e.g. `int len = strlen("a string");` will result in a `len` value of `8`. You can pass in the `*String::Utf8Value(str)` construct to calculate the length of the V8 `String`.

We could use `*String::AsciiValue(str)` but this would squash the multi-byte characters into single bytes and give us the wrong length.

Try and print out the length with `printf("length: %d\n", len)` and see that you are calculating the length properly.

Next we need to tackle the tricky concept of V8 **scopes**.

C++ doesn't have automatic garbage collection, but JavaScript does. V8 tries to bridge the gap by providing an environment in C++ such that your objects interact directly with the garbage collector, even if they are created in C++.

It's not a fully automatic process unfortunately, to replicate the concept of function scoping of variables, V8 introduces a `HandleScope`. When you declare a `HandleScope` at the top of a C++ function, all V8 objects *created* within that function will be *attached* to that scope in the same way that a `function` in JavaScript will capture new variables declared within it.

To declare one of these scopes in your code, use the NAN `NanScope()` call at the top of your function. When your function ends, the scope can then pass on the objects to the garbage collector if they have not been passed outside of the scope.

We then need to create a new V8 object representing our string length to pass back in to JavaScript. To create a new V8 type, use `NanNew<Type>(value)`, where `Type` is the V8 type (such as `Number` or `String`) and `value` is the initial C++ value compatible with that type. A `"string"` can be passed to `NanNew<String>()` and a number value can be passed to a `NanNew<Number>(101)`. If you want to assign it to a variable, then use a construct such as:

```c++
Local<String> str = NanNew<String>("a string");
```

*Hint: you want to create a `Number` handle, not a `String`.*

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node . "some string"`. Standard output will be checked for an integer representing the byte-length of the string passed in. Your code will be checked to ensure that the C++ code is performing the upper-casing.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
  __»__ For help run: `{appname} help`
