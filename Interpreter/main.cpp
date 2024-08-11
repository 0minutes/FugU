#include <iostream>
#include <string>
#include <vector>
#include <stack>
#include <fstream>
#include <cstdint>

using std::cout;
using std::cin;
using std::vector;

#include "backend/interpreter.hpp"


int main(int argc, char* argv[])
{
    
    if (argc < 2)
    {
        cout << "Fatal Error: No filepath was provided";
        getchar();
        exit(1);
    };

    VM vm(argv[1]);

    vm.run();
    
    return 0;
}