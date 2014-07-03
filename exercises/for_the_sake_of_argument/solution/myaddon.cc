#include <nan.h>

using namespace v8;

NAN_METHOD(Print) {
  Local<String> str = args[0].As<String>();
  printf("%s\n", *String::Utf8Value(str));
  NanReturnUndefined();
}

void Init(Handle<Object> exports) {
  exports->Set(NanNew("print"), NanNew<FunctionTemplate>(Print)->GetFunction());
}

NODE_MODULE(myaddon, Init)
