#include <nan.h>

using namespace v8;

NAN_METHOD(Print) {
  printf("FAUX\n");
  NanReturnUndefined();
}

void Init(Handle<Object> exports) {
  exports->Set(NanNew("print"), NanNew<FunctionTemplate>(Print)->GetFunction());
}

NODE_MODULE(myaddon, Init)
