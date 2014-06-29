/**********************************************************************************
 * NAN - Native Abstractions for Node.js
 *
 * Copyright (c) 2014 NAN contributors
 *
 * MIT +no-false-attribs License <https://github.com/rvagg/nan/blob/master/LICENSE>
 **********************************************************************************/

#include <node.h>
#include <nan.h>
#include <map>
#include <string>
#include "./sync.h"

using v8::Array;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Uint32;

typedef std::map<std::string, uint32_t> WordMap;
typedef std::pair<const std::string, uint32_t> WordCount;

// Simple synchronous access to the `Estimate()` function
NAN_METHOD(CountSync) {
  NanScope();

  // expect an array as the first argument
  Local<Array> arr = args[0].As<Array>();
  uint32_t len = arr->Length();

  WordMap word_map;

  Local<Object> res = NanNew<Object>();

  for (uint32_t i = 0; i < len; i++) {
    Local<String> word = arr->Get(i).As<String>();
    String::Utf8Value val(word);
    word_map[std::string(*val, static_cast<uint32_t>(val.length()))]++;
  }

  for (WordMap::iterator iter = word_map.begin(); iter != word_map.end(); iter++) {
    res->Set(NanNew<String>(iter->first.c_str(), iter->first.length()), NanNew<Uint32>(iter->second));
  }

  NanReturnValue(res);
}
