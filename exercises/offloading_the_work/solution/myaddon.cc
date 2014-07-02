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
    #ifdef _WIN32
     Sleep(delay);
    #else
     usleep(delay * 1000);
    #endif
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

  NanCallback* nanCallback = new NanCallback(callback);
  MyWorker* worker = new MyWorker(nanCallback, delay);
  NanAsyncQueueWorker(worker);

  NanReturnUndefined();
}

void Init(Handle<Object> exports) {
  exports->Set(NanNew("delay"), NanNew<FunctionTemplate>(Delay)->GetFunction());
}

NODE_MODULE(myaddon, Init)
