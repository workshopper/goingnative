#include <nan.h>

using namespace v8;

void Init(Handle<Object> exports) {
  Nan::Set(exports, Nan::New("test").ToLocalChecked(),
      Nan::New("OK").ToLocalChecked());
}

NODE_MODULE(test, Init)
