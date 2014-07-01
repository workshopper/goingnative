#include <nan.h>
#ifndef _WIN32
# include <unistd.h>
#endif

using namespace v8;

NAN_METHOD(Delay) {
  NanEscapableScope();

  int delay = args[0].As<Number>()->IntegerValue();
  Local<Function> callback = args[1].As<Function>();

  printf("sleeping for %d\n", delay);
  #ifdef _WIN32
   Sleep(delay);
  #else
   usleep(delay * 1000);
  #endif

  NanMakeCallback(Context::GetCurrent()->Global(), callback, 0, NULL);

  NanReturnUndefined();
}

void Init(Handle<Object> exports) {
  exports->Set(NanNew("delay"), NanNew<FunctionTemplate>(Delay)->GetFunction());
}

NODE_MODULE(myaddon, Init)
