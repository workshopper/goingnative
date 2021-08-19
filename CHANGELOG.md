# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.0](https://github.com/rvagg/goingnative/compare/v2.0.8...v2.1.0) (2021-08-19)


### Features

* add basic N-API exercises ([c48d2c7](https://github.com/rvagg/goingnative/commit/c48d2c74bc1fde30d9a68a61afc6f042cce0bad4))
* allowing access to goingnative as library ([3f427b4](https://github.com/rvagg/goingnative/commit/3f427b4ac3182a39dab9d4c9107bf7cda56c2b1f))


### Bug Fixes

* **timing:** pre-warming the the vm with the binary code to make sure the execution can be measured. ([81fc044](https://github.com/rvagg/goingnative/commit/81fc0446cf012bcc83fcc881368611b54d5bb07a))
* **timing:** pre-warming the the vm with the binary code to make sure the execution can be measured. ([0d72080](https://github.com/rvagg/goingnative/commit/0d720802afc9481bfb9365a2e6af386f77a37cf2)), closes [#98](https://github.com/rvagg/goingnative/issues/98)
* **ui:** fixing display of solution files ([5ff1ca8](https://github.com/rvagg/goingnative/commit/5ff1ca85b83a4be756659f9b4053ce01a4f4ee90))

### [2.0.8](https://github.com/rvagg/goingnative/compare/v2.0.7...v2.0.8) (2020-05-14)


### Bug Fixes

* **offloading_the_work:** fix Nan::Callback#Call deprecation warning ([5e098e4](https://github.com/rvagg/goingnative/commit/5e098e4bf99180bc49025a6270bf167fdc3e4b98))
* use `Nan::Utf8String` instead `v8::String::Utf8Value` ([a9d58b9](https://github.com/rvagg/goingnative/commit/a9d58b9aa76feda60b08c77d127225ad282eb798))
* **am_i_ready:** update node versions ([8e9a028](https://github.com/rvagg/goingnative/commit/8e9a0284b2e582b86248a8c45ae22aa41efbb5fc))
* **am_i_ready:** update test package ([8e01af6](https://github.com/rvagg/goingnative/commit/8e01af629906a26b64cd81550964a5b63d4d04b0))
* **lib/solution:** remove map-async dependency ([b098e8a](https://github.com/rvagg/goingnative/commit/b098e8ae6733b98e53ed2d3566dc5f423be7f59e))
