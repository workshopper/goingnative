## Meeting N-API

There are three options for implementing Node.js Addons: `N-API`, `nan`, or
direct use of internal V8, libuv and Node.js libraries.

We were using `nan` in past exercises. Now let's try `N-API`.

`N-API` is a C API interface for building Node.js addons that ensures ABI
stability across Node.js versions. It is independent from the underlying
JavaScript runtime (V8) and is maintained as part of Node.js itself.

Addons with `N-API` are built/packaged with the same tools that we've been using
before. The only difference will be the set of APIs that we use.

Using `N-API` directly is a little verbose, but Node.js team maintains a C++
wrapper module called `node-addon-api` that makes use `N-API` more easier.

APIs exposed by `node-addon-api` are generally used to create and manipulate
JavaScript values.

### How to use `node-addon-api`

First install `node-addon-api`

```
npm install node-addon-api
```

Replace the `include_dirs` in `binding.gyp` to reference `node-addon-api`:

```
"include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"]
```

The base `N-API` do not throw or handle C++ exceptions, but `node-addon-api` may
optionally. You must enable or disable this capability in your `bindings.gyp` file.

To enable add:

```
"cflags!": [ "-fno-exceptions" ],
"cflags_cc!": [ "-fno-exceptions" ]
```

And for disable, add:

```
"defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ]
```

Then you should write a new `addon.cc` file.

### Write C++ for your addon

Just include the `node-addon-api` header in your `addon.cc`

```c++
#include <napi.h>
```

Then you can use all `node-addon-api` APIs.

Let's learn some basic APIs that you are going to use to solve this exercise.

* For create you can use `Napi::String::New`:

```c++
Napi::Env env;
Napi::String::New(env, "my string")
```

* Create a function that return a string:

```c++
  Napi::Value SayHi(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::String::New(env, "Hi Nodeschool");
  }
```

* Create an init function:
Like with `nan` we have to create a function to expose our methods to Node.js.

```c++
  Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // set a key on `exports` object
    exports.Set(
      Napi::String::New(env, "tell"), // property name
      Napi::Function::New(env, MyTellFunc) // property value
    )

    return exports
  }
```

### Module registration

You can expose your init function to Node.js in similar way than with `nan`.
Just you have to use `NODE_API_MODULE` macro.

```c++
NODE_API_MODULE(moduleName, InitFunction)
```

Note: You can use `NODE_GYP_MODULE_NAME` macro for your moduleName as long as
you use `node-gyp` for build your addon.

### Mission:

Write an addon that export a function `hello`, which should return the string:

```
hello NAPI!
```

Then in your javascript file print the returned value from your addon in console

Docs:
* `node-addon-api` docs: https://github.com/nodejs/node-addon-api#api-documentation
