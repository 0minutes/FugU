#pragma once

#include "shared.hpp"
#include <vector>
#include <fstream>
#include <map>
#include <string>

using std::cout;

class VM
{
    private:
    std::vector<int> bytecode;

    std::map<int, std::string> stringPool;
    std::map<int, double> doublePool;
    std::map<int, unsigned long long int> bigIntPool;
    std::map<int, signed long long int> signedPool;

    Stack stack;
    size_t sp;

    std::vector<int> readBytes(const std::string &filepath)
    {
        std::vector<int> bytecode;
        std::ifstream file(filepath, std::ios::binary);

        if (file.is_open())
        {
            char byte;

            while (file.get(byte))
            {
                bytecode.push_back(static_cast<unsigned char>(byte));
            };

            file.close();
        }
        else
        {
            error("Unable to open the file location");
        };

        return bytecode;
    };

    int validateBytecode()
    {
        if (this->bytecode.empty())
        {
            error("Invalid Bytecode: Empty Bytecode");
        };

        if (this->bytecode[0] != 0x00)
        {
            error("Invalid Bytecode: First byte must always equal to 0x00 but instead got " + itoh(this->bytecode[0]));
        };

        if (this->bytecode[this->bytecode.size()-1] != 0xFF)
        {
            error("Invalid Bytecode: Last byte must always equal to 0xFF but instead got "  + itoh(this->bytecode[this->bytecode.size()-1]));
        };

        return 0;
    };

    int getVarPool();

    public:
    int run()
    {
        this->validateBytecode();
        this->getVarPool();
        return 0;
    };

    VM(std::string filepath)
    {
        this->bytecode = this->readBytes(filepath);
    };
};