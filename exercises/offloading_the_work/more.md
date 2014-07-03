{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

# MORE

## About Node.js worker threads

Node.js performs asynchronous I/O using two main mechanisms. Socket I/O is performed using non-blocking system calls. In this way, a significant number of sockets can be handled by a single thread and it never needs to block. Instead it polls existing connections for available data and moves on if there is none. For file system I/O this isn't as fast so Node.js spins up a thread-pool to offload discrete chunks of file system work to perform the I/O. A `fs.readFile()` will end up spanning multiple `fs.read()` operations that may end up distributed across multiple threads during the course of the full read. These reads can obviously be interleaved with other file system operations simultaneously.

Node.js and libuv give us the ability to interact with the thread-pool via C++. We don't have to limit the worker threads to just file system I/O although the more work we put on them, the less time they have for file system I/O.

Heavy threading work may be best to opt for separate threads for particular jobs, defined outside of the thread-pool. libuv makes this easy to achieve in a cross-platform way, but this is beyond the scope of this workshop!

While the default number of worker threads is 4, this can be modified all the way up to a maximum of 128 threads by setting the `UV_THREADPOOL_SIZE` environment variable. However, you must be sure to measure the efficacy of changing this value before using it in production.

## About the JavaScript thread

Due to the V8 architecture and the single-threaded nature of JavaScript. It is *vital* that you not *touch* any V8 objects from code that is not running in the same thread as JavaScript.

Code running in a worker thread can perform any other function, as long as it doesn't interact with V8. Values passed to the thread and values passed back from the thread should be stored in a data structure of some form so they can be retrieved when execution passes back to the JavaScript thread. Values coming *from* V8 objects must be converted out of their original form into a non-V8 form. Values returning *to* V8 must be converted back in to V8 objects from their non-V8 forms.

{cyan}──────────────────────────────────────────────────────────────────────{/cyan}

 __»__ To print the instructions again, run: `{appname} print`
 __»__ To compile and test your solution, run: `{appname} verify myaddon/`
 __»__ For help run: `{appname} help`
