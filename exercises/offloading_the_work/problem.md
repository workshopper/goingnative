----------------------------------------------------------------------

## Task

Your effort on passing the previous exercise is to be congratulated, however you've introduced a critical problem: you're blocking the JavaScript thread so nothing else can be done. Your task is to move the *sleep* off onto a *worker thread* so that the JavaScript thread doesn't block, but you still need to delay the callback for the correct amount of time!

----------------------------------------------------------------------

## Description

The `usleep()` and `Sleep()` functions put the current thread to sleep so nothing else executes. For your addon, this also includes the JavaScript thread, and this isn't acceptable for a Node.js application that should *never* block.

In your working directory we have given you a new file named {boilerplate:index.js} that you can use to replace the *index.js* file from your previous solution.

This new JavaScript code will create an interval timer to print a `.` to standard out every 50ms. It will also print out `Waiting` at the start but this is printed *after* the call to your addon to demonstrate just how broken your code is.

Run your code and you will likely see it print this:

```
Done!
Waiting
```

What you need to do is print this without changing any JavaScript:

```
Waiting..........................Done!
```

## Worker threads

Node.js spins up 4 worker threads (by default) in a thread-pool for handling file system I/O. In our C++ code we can easily make use of this thread-pool to offload work from the JavaScript thread. Your task is to get the `usleep()` or `Sleep()` to run on a worker thread and then have the callback fire back in the JavaScript thread.

Thankfully NAN makes this a little easier than it otherwise would.

We have also given you a new file {boilerplate:myaddon.cc} in your current working directory that has a basic structure you can use. It defines a `MyWorker` *class* that NAN uses to define a discrete chunk of asynchronous work.

To use your worker class, you'll first need to wrap up a standard V8 `Local<Callback>` in a `NanCallback` object. This protects the callback from garbage collection and exposes a simple `Call()` method that replaces the need to `NanMakeCallback()`.

To use `MyWorker` and `NanCallback` you need to allocate memory on the *"heap"* for them by using the `new` operator. NAN will perform cleanup of both objects for you so you don't need a matching `delete` in this case as you normally would in C++.

Things you need to do:

1. Wrap your `Local<Callback>` in a `NanCallback` with: `NanCallback nanCallback = new NanCallback(callback);`

2. Create a `MyWorker` and pass it the `nanCallback` and your amount of timer `delay` with `MyWorker worker = new MyWorker(nanCallback, delay);`

3. Submit `worker` to the thread-pool with `NanAsyncQueueWorker(worker);`--after this you can return as normal and the asynchronous work will be performed when there is a spare thread for it.

4. Put your `usleep()` / `Sleep()` logic into the `MyWorker`s `Execute()` method.

TODO: simplify

----------------------------------------------------------------------

## Conditions

TODO: conditions

----------------------------------------------------------------------

 __»__ To print these instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon`
 __»__ For help run: `{appname} help`
