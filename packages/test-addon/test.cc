#include <nan.h>

void Init(v8::Local<v8::Object> exports) {
  v8::Local<v8::Context> context = exports->CreationContext();
  exports->Set(context,
               Nan::New("test").ToLocalChecked(),
               Nan::New("OK").ToLocalChecked());
}

NODE_MODULE(test, Init)
