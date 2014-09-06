{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Task

Prepare a *package.json* and a *binding.gyp* for a native add-on package.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Description

Some components of a Node.js native add-on have been created for you in a directory named ***{boilerplate:myaddon}*** in your current working directory.

We are starting with the configuration files and will add the other components in the next two exercises.

### Mission: finish *package.json*

Look at your _package.json_. It has two dependencies that assist with add-on development:

* **NAN**: a standardized C++ interface to Node and V8
* **bindings**: a tool to help find the location of the *compiled* version of your add-on during runtime

*Type `{appname} more` for more information on these dependencies.*

Your mission: tell node to look for your _.gyp_ file. To do this, add `"gypfile": true` to your _package.json_

### Mission: finish *binding.gyp*

_binding.gyp_ is a JSON-esq file that tells `node-gyp` how to build your project. Look inside it now. A basic structure has been provided for you, but it needs more work.


* `"target_name"` of the single target listed in the file must be the exact name of your add-on. It needs to match the name you use for it in your JavaScript file *and* the name you use in the `NODE_MODULE()` macro in your C++ file. *Set it to `"myaddon"`*.
* The `"sources"` array must include the file name of the C++ file used by your add-on, you need to change it to `"myaddon.cc"`.
* The `"include_dirs"` array tells the compiler where to find the *nan.h* header file used by NAN. *Set it to this text:*


  "<!(node -e \"require('nan')\")"

*Type `{appname} more` for more information on binding.gyp.*

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

## Conditions

The *package.json* and *binding.gyp* files in the directory you submit will be checked for completeness.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To print additional learning material relating to these instructions, run: `{appname} more`
 __»__ To compile and test your solution, run: `{appname} verify {boilerplate:myaddon}`
 __»__ For help run: `{appname} help`
