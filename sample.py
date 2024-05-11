import sys
from importlib.machinery import PathFinder, SourceFileLoader, ModuleSpec
import types
import ctypes as ct
import imp

class CustomFinder(PathFinder):

    def find_spec(self, fullname, path=None, target=None):
        spec = None
        if not path:
            path = []
        if fullname == 'numpy.core._multiarray_umath' or fullname == 'numpy.core._multiarray_tests':
            spec = ModuleSpec(fullname, CustomModule, is_package=True)
        return spec

class CustomModule:

    def create_module(spec):
        names = spec.name.split('.')
        local_name = './lib/{}'.format(names[2])
        local_path = local_name + ".cpython-311-darwin.so"
        mod = imp.load_dynamic(spec.name, local_path)
        return mod

    def exec_module(mod):
        pass


def main():
    sys.meta_path.insert(0, CustomFinder())
    import cv2
    print(cv2.__version__)

if __name__ == "__main__":
    main()
