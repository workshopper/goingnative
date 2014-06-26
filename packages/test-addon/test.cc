#include <nan.h>

using namespace v8;

void Init(Handle<Object> exports) {
  exports->Set(NanNew("test"), NanNew("OK"));
}

NODE_MODULE(test, Init)
