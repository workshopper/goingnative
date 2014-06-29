/**********************************************************************************
 * NAN - Native Abstractions for Node.js
 *
 * Copyright (c) 2014 NAN contributors
 *
 * MIT +no-false-attribs License <https://github.com/rvagg/nan/blob/master/LICENSE>
 **********************************************************************************/

#include <nan.h>
#include <map>
#include <string>
#include "./async.h"

using v8::Array;
using v8::Function;
using v8::Local;
using v8::Null;
using v8::Object;
using v8::String;
using v8::Uint32;
using v8::Value;

typedef std::map<std::string, uint32_t> WordMap;
typedef std::pair<const std::string, uint32_t> WordCount;


class CountWorker : public NanAsyncWorker {
 public:
  CountWorker(NanCallback *callback, std::string* words, uint32_t length)
    : NanAsyncWorker(callback), words(words), length(length) {}
  ~CountWorker() {
    delete[] words;
  }

  // Executed inside the worker-thread.
  // It is not safe to access V8, or V8 data structures
  // here, so everything we need for input and output
  // should go on `this`.
  void Execute () {
    for (uint32_t i = 0; i < length; i++) {
      word_map[words[i]]++;
    }
  }

  // Executed when the async work is complete
  // this function will be run inside the main event loop
  // so it is safe to use V8 again
  void HandleOKCallback () {
    NanScope();

    Local<Object> res = NanNew<Object>();

    for (WordMap::iterator iter = word_map.begin(); iter != word_map.end(); iter++) {
      res->Set(NanNew<String>(iter->first.c_str(), iter->first.length()), NanNew<Uint32>(iter->second));
    }

    Local<Value> argv[] = {
        NanNull()
      , res
    };

    callback->Call(2, argv);
  }

 private:
  WordMap word_map;
  std::string *words;
  uint32_t length;
};

NAN_METHOD(CountAsync) {
  NanScope();

  // expect an array as the first argument
  Local<Array> arr = args[0].As<Array>();
  uint32_t len = arr->Length();

  std::string *strings = new std::string[len];

  for (uint32_t i = 0; i < len; i++) {
    String::Utf8Value word(arr->Get(i));
    strings[i] = std::string(*word, word.length());
  }

  NanCallback *callback = new NanCallback(args[1].As<Function>());

  NanAsyncQueueWorker(new CountWorker(callback, strings, len));
  NanReturnUndefined();
}
