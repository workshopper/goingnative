----------------------------------------------------------------------

## Task

Create a native Node.js add-on that can read a `String` argument and returns a integer indicating the length of that string.

----------------------------------------------------------------------

## Description

You are going to add a new `length()` function to your native addon! This function will accept a string and return back the number of characters in that string.

First and foremost, lets try and tackle the fun concept of v8 scopes on the C++ side of things. Nan offers a great function `NanScope()` to simplify this. When you call `NanScope()`, v8 will allocate every v8 object declared from that point forward in the current scope until you close the scope or another scope is opened. Since we will be creating a new v8 object in our function to return, it is crucial that we ensure it is within the scope of this function. Long story short, throw `NanScope()` at the top of every function in which you _create_ a new v8 object.

Next, there is a standard function in C `strlen`, which accepts a c style string and returns its length! For example, after  `int len = strlen("Heyayay");`, len would be equal to 7. You are going to use this to determine the number of characters in the string passed into your function.

We also need to understand the concept of creating new v8 objects. Nan also provides a nifty little utility for this, `NanNew<Type>(value)` will create a new v8 object that represents the value contained in `value` and will have the v8 type of `Type`, and return to you the handle for that new object. You will be creating an Int32 of your legnth of the string passed to your function.

Finally, you are going to need to retun your fancy new handle back to JavaScript! You can acheive this through `NanReturnValue(value)`. This has the added benefit of closing the current scope you created with `NanScope()` for you.

To recap, your mission is:

* Create a new function `length()` that your native module will export. Make sure to call it from `index.js` passing it `process.args[2]`
* Create a new scope for your function
* Create and return the handle for a new `v8::Int32` containg the length of the string passed into your function.

## Conditions

Your submission will be compiled using `node-gyp rebuild` and executed with `node . "some string"`. Standard output will be checked for an upper-cased version of that string and your code will be checked to ensure that the C++ code is performing the upper-casing.

----------------------------------------------------------------------

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
  __»__ For help run: `{appname} help`
