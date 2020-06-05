{
  "targets": [
    {
      "target_name": "myaddon",
      "sources": [ "myaddon.cc" ],
      "include_dirs": [ "<!@(node -p \"require('node-addon-api').include\")" ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ]
    }
  ]
}
