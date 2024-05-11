# color-vision

# sample 2
This is a sample of trying to include OpenCV in the wasm module using py2wasm, with the aim of completing it on the Python side.
The build itself is successful, but it does not work with Wasmer and JavascriptSDK.

# Prerequisite knowledge
WASI does not support dynamic library loading, and when importing numpy, which is internally loading a shared library, the following error will occur:

```
OpenCV bindings requires "numpy" package.
Install it via command:
    pip install numpy
Traceback (most recent call last):
  File "./numpy/__init__.py", line 130, in <module numpy>
  File "./numpy/__config__.py", line 4, in <module numpy.__config__>
  File "./numpy/core/__init__.py", line 24, in <module numpy.core>
  File "./numpy/core/multiarray.py", line 10, in <module numpy.core.multiarray>
  File "./numpy/core/overrides.py", line 8, in <module numpy.core.overrides>
ImportError: dynamic libraries are not implemented in wasi

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "./sample.py", line 2, in <module>
  File "./cv2/__init__.py", line 11, in <module cv2>
  File "./numpy/__init__.py", line 135, in <module numpy>
ImportError: Error importing numpy: you should not try to import numpy from
        its source directory; please exit the numpy source tree, and relaunch
        your python interpreter from there.
```

This sample uses a monkey patch to incorporate dynamic library loading in the import process.

# Environment

OS: MaxOS 14.4.1
clang: 17.0.6

The library versions used are as follows.

* numpy              1.26.4
* opencv-python      4.9.0.80
* py2wasm            2.6.3
* PyYAML             6.0.1
* wasmer             1.1.0

There are cases where yaml import fails, so in that case, execute the following.
`export SDKROOT="$(xcrun --sdk macosx --show-sdk-path)"`


## File to place
### ./lib
Copy and place the following shared library.

~/.pyenv/versions/3.11.9/lib/python3.11/site-packages/numpy/core/_multiarray_umath.cpython-311-darwin.so
~/.pyenv/versions/3.11.9/lib/python3.11/site-packages/numpy/core/_multiarray_tests.cpython-311-darwin.so

### .dylibs

~/.pyenv/versions/3.11.9/lib/python3.11/site-packages/numpy/.dylibs/lib/libgcc_s.1.1.dylib
~/.pyenv/versions/3.11.9/lib/python3.11/site-packages/numpy/.dylibs/lib/libgfortran.5.dylib
~/.pyenv/versions/3.11.9/lib/python3.11/site-packages/numpy/.dylibs/lib/libopenblas64_.0.dylib
~/.pyenv/versions/3.11.9/lib/python3.11/site-packages/numpy/.dylibs/lib/libquadmath.0.dylib


# Run the command

```
py2wasm sample.py -o sample.wasm
wasmer run sample.wasm

```

