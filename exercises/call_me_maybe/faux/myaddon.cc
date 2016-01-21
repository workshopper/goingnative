#include <nan.h>
#ifndef _WIN32
# include <unistd.h>
#endif

using namespace v8;

NAN_METHOD(Delay) {
  Nan::Maybe<int> maybeDelay = Nan::To<int>(info[0]);

  if (maybeDelay.IsNothing() == true) {
    Nan::ThrowError("Error converting first argument to integer");
  }

  int delay = maybeDelay.FromJust();

  if (info[1]->IsFunction() == false) {
    Nan::ThrowError("Error converting second argument to function");
  }

  printf("FAUX %d\n", delay);
  fflush(stdout);

  #ifdef _WIN32
   Sleep(delay);
  #else
   usleep(delay * 1000);
  #endif

  v8::Local<Function> callback = info[1].As<Function>();
  Nan::MakeCallback(Nan::GetCurrentContext()->Global(), callback, 0, NULL);
}

NAN_MODULE_INIT(Init) {
  Nan::Set(target, Nan::New("delay").ToLocalChecked(),
      Nan::GetFunction(Nan::New<FunctionTemplate>(Delay)).ToLocalChecked());
}

NODE_MODULE(myaddon, Init)
