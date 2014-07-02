#include <nan.h>
#ifndef _WIN32
# include <unistd.h>
#endif

using namespace v8;

class MyWorker : public NanAsyncWorker {
 public:
  MyWorker(NanCallback *callback, int delay)
    : NanAsyncWorker(callback), delay(delay) {}
  ~MyWorker() {}

  // Executed inside the worker-thread.
  // It is not safe to access V8, or V8 data structures
  // here, so everything we need for input and output
  // should go on `this`.
  void Execute () {
    // tiny sleep prior to ensure proper print order of 2 & 3
    #ifdef _WIN32
     Sleep(10);
    #else
     usleep(10000);
    #endif

    printf("FAUX 3\n");
    fflush(stdout);

    #ifdef _WIN32
     Sleep(delay);
    #else
     usleep(delay * 1000);
    #endif

    printf("FAUX 4\n");
    fflush(stdout);
  }

  // Executed when the async work is complete
  // this function will be run inside the main event loop
  // so it is safe to use V8 again
  void HandleOKCallback () {
    NanScope();

    callback->Call(0, NULL);
  }

 private:
  int delay;
};

NAN_METHOD(Delay) {
  NanEscapableScope();

  int delay = args[0].As<Number>()->IntegerValue();
  Local<Function> callback = args[1].As<Function>();

  printf("FAUX 1\n");
  fflush(stdout);

  NanCallback* nanCallback = new NanCallback(callback);
  MyWorker* worker = new MyWorker(nanCallback, delay);
  NanAsyncQueueWorker(worker);

  printf("FAUX 2\n");
  fflush(stdout);

  NanReturnUndefined();
}

void Init(Handle<Object> exports) {
  exports->Set(NanNew("delay"), NanNew<FunctionTemplate>(Delay)->GetFunction());
}

NODE_MODULE(myaddon, Init)
