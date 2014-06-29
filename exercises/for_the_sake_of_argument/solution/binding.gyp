{
  "targets": [
    {
      "target_name": "myaddon",
      "sources": [ "myaddon.cc" ],
      "include_dirs": [ "<!(node -e \"require('nan')\")" ]
    }
  ]
}
