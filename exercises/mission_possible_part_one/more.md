{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

# MORE

## What is NAN?

NAN is *"Native Abstractions for Node.js" and exists mainly because the native V8 API has become nearly impossible to write stable code against. The choice is between targeting Node 0.10 and prior *or* Node 0.11 and after, but maintaining compatibility for both is very difficult without getting lost in macro soup. NAN exists to manage this pain and provides a single, and mostly stable, interface to dealing with both V8, Node.js and libuv.


## What is the *bindings* dependency?

node-bindings is a simple project that makes native Node.js add-on *loading* simpler from within a Node.js application. In the past, native add-ons have been placed in different locations but now that has stabilized to just the *build* directory inside a project. However, you can end up with a *Release* or a *Debug* subdirectory depending on your build command and your Node.js environment. bindings takes care of the look-up process so you simply need to add `var myaddon = require('bindings')('myaddon')` to your code to load an add-on.


## What is GYP and node-gyp?

GYP is *"Generate Your Project"* and is a build tool written by Google for the Chromium project. It is intended to be something of a successor to tools like autoconf. It takes a high-level project configuration and generates build files (Makefiles) to match that configuration for your current system.

node-gyp exists because Node.js itself switched to GYP in version 0.8 and so did the default compile configuration for native add-ons. Now it's the only (sane) way to build your projects. node-gyp wraps GYP and combines your project's binding.gyp with a standard Node.js GYP configuration and creates a suitable build set-up for compiling native add-ons.


## About binding.gyp

Every _binding.gyp_ file has an array of targets, each target defines a native *module* that node-gyp will build. Each target requires a `"target_name"`, this name is used to compile a binary named *`<name>.node`*. Every target also needs a `"sources"` array to tell GYP what files to compile. They can be any format that GYP knows how to compile which is generally just C++ or C. Finally, for native add-on development, we generally want an `"include_dirs"` array telling node-gyp what directories to include in the search path for files that can be referenced via `#include` in your C++. The recommendation is to use NAN to make add-on development a more stable experience against multiple Node.js versions and this needs to be loaded via `#include <nan.h>`. We use `"<!(node -e \"require('nan')\")"` to spawn a Node.js process to find and run NAN which is simply a JavaScript file that prints the directory that it's in, so this is fed back in to the GYP `"include_dirs"` list and *nan.h* can be loaded.


{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print the instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon/`
 __»__ For help run: `{appname} help`
