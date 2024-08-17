#pragma once

#include "shared.hpp"
#include <vector>
#include <fstream>
#include <map>
#include <string>

using ConstPoolValue = std::variant<int, std::string, double, unsigned long long, signed long long>;

class VM
{
    private:
    std::vector<uint8_t> bytecode;

    std::map<int, ConstPoolValue> constPool;

    Stack stack;
    size_t sp;

    std::vector<uint8_t> readBytes(const std::string &filepath)
    {
        std::vector<uint8_t> bytecode;
        std::ifstream file(filepath, std::ios::binary);

        if (file.is_open())
        {
            char byte;
            while (file.get(byte))
            {
                bytecode.push_back(static_cast<uint8_t>(byte));
            };

            file.close();
        }
        else
        {
            throw std::runtime_error("Unable to open the file location");
        };
        return bytecode;
    };

    int validateBytecode()
    {
        if (this->bytecode.empty())
        {
            throw std::runtime_error("Invalid Bytecode: Empty Bytecode");
        };

        if (this->bytecode[0] != 0x00)
        {
            throw std::runtime_error("Invalid Bytecode: First byte must always equal to 0x00 but instead got " + itoh(this->bytecode[0]));
        };

        if (this->bytecode[this->bytecode.size()-1] != 0xFF)
        {
            throw std::runtime_error("Invalid Bytecode: Last byte must always equal to 0xFF but instead got "  + itoh(this->bytecode[this->bytecode.size()-1]));
        };

        return 0;
    };

    uint8_t eat()
    {
        const uint8_t temp = this->bytecode[0];

        this->bytecode.erase(this->bytecode.begin());

        return temp;
    };

    int parseConstPool()
    {
        const uint8_t contolByte = this->eat();
        const auto constPoolCount = mapInteger(this->bytecode);

        for (int i = 0; i < constPoolCount; i++)
        {
            const int label = mapInteger(this->bytecode);

            const uint8_t InfoType = this->eat();

            switch (InfoType)
            {

                case ConstPoolType::StringInfo:
                {
                    const int length = mapInteger(this->bytecode);

                    std::string str = "";

                    for (int j = 0; j < length; j++)
                    {
                        str += static_cast<char>(mapInteger(this->bytecode));
                    };

                    this->constPool[label] = str;
                    break;
                };

                case ConstPoolType::BigIntInfo:
                {
                    const uint64_t BigInt = uint64(this->bytecode);

                    this->constPool[label] = BigInt;
                    break;
                };

                case ConstPoolType::SignedInfo:
                {
                    const uint64_t BigInt = uint64(this->bytecode);

                    int64_t SignedInt = 0-BigInt;

                    this->constPool[label] = SignedInt;
                    break;
                };

                case ConstPoolType::DoubleInfo:
                {
                    const double dflt = f64float(this->bytecode);
                    
                    this->constPool[label] = dflt;
                    break;
                };
                
                case ConstPoolType::CharInfo:
                {
                    const int length = mapInteger(this->bytecode);

                    std::string str = "";

                    for (int j = 0; j < length; j++)
                    {
                        str += static_cast<char>(mapInteger(this->bytecode));
                    };

                    this->constPool[label];
                    break;
                };
                case ConstPoolType::PtrInfo:
                {
                
                };
            };
        };

        return 0;
    };

    public:
    int accessConstPool()
    {
        for (const auto &entry : this->constPool)
        {
            std::cout << "Key: " << entry.first << ", Value: ";
            std::visit([](const auto &value) { std::cout << value; }, entry.second);
            std::cout << std::endl;
        };

        return 0;
    };
    
    int run()
    {
        this->validateBytecode();
        this->parseConstPool();

        return 0;
    };

    VM(std::string filepath)
    {
        this->bytecode = this->readBytes(filepath);
    };
};