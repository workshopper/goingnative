# Going deep into N-API

Now you will learn how to use the `N-API` C interface directly, without the
support of the `node-addon-api` C++ wrapper.

Which approach you take in your own projects will depend on personal preference
and the nature of the project, but it's worth understanding the difference.

`N-API` APIs are generally used to create and manipulate JavaScript values, this
APIs use an opaque type named `napi_value` to abstract this values.

All `N-API` calls return a status code of type `napi_status` that indicates if
the API call success or failed.

### Anatomy of a Node.js Addon with N-API

The files used for an addon with `N-API` will be the same as before. The only
difference will be the API's used in your C++ file.

### Include header

You need to include `N-API` header at top of your file.

```cpp
  #include <node_api.h>
```

### Do your stuff

Use `N-API` APIs according your needs.

For example for define a variable `foo` with value the string `bar`:

```cpp
  napi_value foo;
  napi_status status;

  status = napi_create_string_utf8(env, "bar", NAPI_AUTO_LENGTH, &foo);
  if (status != napi_ok) return nullptr;
```

A simple function that return an array with numbers from 0 to 4:

```cpp
  napi_value MyFunction(napi_env env, napi_callback_info info) {
    napi_status status;
    napi_value array, num;

    status = napi_create_array(env, &array);
    if (status != napi_ok) return nullptr;

    for (int i = 0; i < 5; i++) {
      status = napi_create_uint32(env, i, &num);
      if (status != napi_ok) return nullptr;

      status = napi_set_element(env, array, i, num);
      if (status != napi_ok) return nullptr;
    }

    return array;
  }
```

Or a initialization function `Init` that exports a function `Bark` as `bark`:

```cpp
  napi_value Init(napi_env env, napi_value exports) {
    napi_status status;
    napi_value fn;

    status = napi_create_function(env, nullptr, 0, Bark, nullptr, &fn);
    if (status != napi_ok) return nullptr;

    status = napi_set_named_property(env, exports, 'bark', fn);
    if (status != napi_ok) return nullptr;

    return exports;
  }
```

### Register the Module

`N-API` modules are registered in similar way to modules you built before, but
now use the `NAPI_MODULE` macro.

```
NAPI_MODULE(moduleName, InitFunction)
```

or (as long as you use `node-gyp`)

```
NAPI_MODULE(NODE_GYP_MODULE_NAME, InitFunction)
```

## Mission:

Write an addon that export a function `hello`, which should return the string:

```
hello N-API!
```

Then in your javascript file print the returned value from your addon in console

## Docs

* `N-API` docs: https://nodejs.org/api/n-api.html
* `napi_status`: https://nodejs.org/api/n-api.html#n_api_napi_status
* `napi_env`: https://nodejs.org/api/n-api.html#n_api_napi_env
* `napi_value`: https://nodejs.org/api/n-api.html#n_api_napi_value
* `napi_callback_info`: https://nodejs.org/api/n-api.html#n_api_napi_callback_info
* `napi_create_string_utf8`: https://nodejs.org/api/n-api.html#n_api_napi_create_string_utf8
* `napi_create_function`: https://nodejs.org/api/n-api.html#n_api_napi_create_function
