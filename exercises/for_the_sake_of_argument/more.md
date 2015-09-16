{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

# MORE

## About V8 types

In general, the C++ interface to V8 gives you access to the same types (and more) that you know from within JavaScript. Including `Object`, `String`, `Boolean`, `Function`, etc. Each of these have different methods and properties but they all form a hierarchy and share many methods on common. When you are using one of these types you are using an object that may be exposed into JavaScript.

To explore the documentation about the various V8 types, visit https://v8docs.nodesource.com/ and click on *Data Structures* and you will see some familiar names.

## About V8 handles

The `Local<Type>` construct is required to wrap up the raw type object in a *handle* that can safely interact with the V8 runtime. The handle is used to attach to the garbage collector and automatically clean up the object when we fall out of *scope*. We can also use the handle to perform conversions and comparisons. In general we only interact with V8 data types when they are wrapped in a handle.

```c++
Local<Object> arg1 = info[0];
Local<String> str1 = arg1.As<String>();
```

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print the instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon/`
 __»__ For help run: `{appname} help`
