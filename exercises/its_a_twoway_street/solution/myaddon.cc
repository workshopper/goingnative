#include <nan.h>

using namespace v8;

NAN_METHOD(Length) {
  Nan::MaybeLocal<String> maybeStr = Nan::To<String>(info[0]);
  v8::Local<String> str;

  if(maybeStr.ToLocal(&str) == false) {
    Nan::ThrowError("Error converting first argument to string");
  }

  int len = strlen(*String::Utf8Value(str));

  info.GetReturnValue().Set(len);
}

NAN_MODULE_INIT(Init) {
  Nan::Set(target, Nan::New("length").ToLocalChecked(),
      Nan::GetFunction(Nan::New<FunctionTemplate>(Length)).ToLocalChecked());
}

NODE_MODULE(myaddon, Init)
