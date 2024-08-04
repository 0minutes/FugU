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

vector<int> readBytes(std::string &filepath)
{
    std::vector<uint8_t> bytes;
    std::ifstream file(filepath, std::ios::binary);

    if (!file)
    {
        cout << "Unable to open the file " << filepath << "\n";
        exit(1);
    };

    uint8_t byte;

    while (file.read(reinterpret_cast<char*>(&byte), sizeof(byte)))
    {
        bytes.push_back(byte);
    };

    std::vector<int> bytecode;

    for (uint8_t byte : bytes)
    {
        bytecode.push_back(static_cast<int>(byte));
    };

    return bytecode;
}


int main(int argc, char* argv[])
{
    
    if (argc < 2)
    {
        cout << "Fatal Error: No filepath was provided";
        getchar();
        exit(1);
    }

    std::string filepath = argv[1];

    vector<int> bytecode = readBytes(filepath);

    VM vm(bytecode);

    Stack stack = vm.run();

    while(!stack.empty())
    {
        stack.printElement(stack.pop());
    };

    return 0;
}