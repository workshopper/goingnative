{
  "targets": [
    {
      "target_name": "test",
      "sources": [ "test.cc" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
