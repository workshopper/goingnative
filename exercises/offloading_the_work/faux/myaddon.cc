#include <nan.h>
#ifndef _WIN32
# include <unistd.h>
#endif

using namespace v8;

class MyWorker : public Nan::AsyncWorker {
 public:
  MyWorker(Nan::Callback *callback, int delay)
    : Nan::AsyncWorker(callback), delay(delay) {}
  ~MyWorker() {}

  // Executed inside the worker-thread.
  // It is not safe to access V8, or V8 data structures
  // here, so everything we need for input and output
  // should go on `this`.
  void Execute () {
    // tiny sleep prior to ensure proper print order of 2 & 3
    #ifdef _WIN32
     Sleep(50);
    #else
     usleep(50 * 1000);
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
    Nan::HandleScope scope;

    callback->Call(0, NULL);
  }

 private:
  int delay;
};

NAN_METHOD(Delay) {
  Nan::Maybe<int> maybeDelay = Nan::To<int>(info[0]);

  if (maybeDelay.IsNothing() == true) {
    Nan::ThrowError("Error converting first argument to integer");
  }

  if (info[1]->IsFunction() == false) {
    Nan::ThrowError("Error converting second argument to Function");
  }

  int delay = maybeDelay.FromJust();

  v8::Local<Function> callback = info[1].As<Function>();

  printf("FAUX 1\n");
  fflush(stdout);

  Nan::Callback* nanCallback = new Nan::Callback(callback);
  MyWorker* worker = new MyWorker(nanCallback, delay);
  Nan::AsyncQueueWorker(worker);

  printf("FAUX 2\n");
  fflush(stdout);
}

NAN_MODULE_INIT(Init) {
  Nan::Set(target, Nan::New("delay").ToLocalChecked(),
      Nan::GetFunction(Nan::New<FunctionTemplate>(Delay)).ToLocalChecked());
}

NODE_MODULE(myaddon, Init)
