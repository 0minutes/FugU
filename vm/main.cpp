#include "src/Interpreter.cpp"

int main(int argc, const char* argv[]) {

    if (argc < 2)
    {
        std::cerr << "Fatal Error: Expected a file path" << std::endl;
        exit(1);
    };

    VM vm(argv[1]);

    const VM_STATE ret = vm.runmain();

    return ret;
};