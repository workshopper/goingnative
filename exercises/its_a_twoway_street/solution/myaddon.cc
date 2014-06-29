#include <nan.h>

using namespace v8;

NAN_METHOD(Length) {
  NanScope();

  int len = strlen(*String::Utf8Value(args[0].As<String>()));
  Local<Number> v8len = NanNew(len);

  NanReturnValue(v8len);
}

void Init(Handle<Object> exports) {
  exports->Set(NanNew("length"), NanNew<FunctionTemplate>(Length)->GetFunction());
}

NODE_MODULE(myaddon, Init)
