#include <nan.h>

using namespace v8;

NAN_METHOD(Print) {

}

void Init(Handle<Object> exports) {
  exports->Set(NanNew("print"), NanNew<FunctionTemplate>(Print)->GetFunction());
}

