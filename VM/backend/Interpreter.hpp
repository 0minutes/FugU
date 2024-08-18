#pragma once

#include "shared.hpp"
#include "ConstPoolManager.hpp"
#include <vector>
#include <fstream>
#include <map>
#include <string>

class VM
{
    private:
    std::vector<uint8_t> bytecode;

    ConstPoolManager constPool;

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

                    this->constPool.addEntry(label, {ConstPoolType::StringInfo, str});
                    break;
                };

                case ConstPoolType::BigIntInfo:
                {
                    const uint64_t BigInt = uint64(this->bytecode);

                    this->constPool.addEntry(label, {ConstPoolType::BigIntInfo, BigInt});
                    break;
                };

                case ConstPoolType::SignedInfo:
                {
                    const uint64_t BigInt = uint64(this->bytecode);

                    int64_t SignedInt = 0-BigInt;

                    this->constPool.addEntry(label, {ConstPoolType::SignedInfo, SignedInt});
                    break;
                };

                case ConstPoolType::DoubleInfo:
                {
                    const double dflt = f64float(this->bytecode);
                    
                    this->constPool.addEntry(label, {ConstPoolType::DoubleInfo, dflt});
                    break;
                };
                
                case ConstPoolType::CharInfo:
                {
                    const int length = mapInteger(this->bytecode);

                    char32_t chr = 0;

                    for (int j = 0; j < length; j++)
                    {
                        chr = (chr << 8) | static_cast<char32_t>(mapInteger(this->bytecode));
                    }

                    this->constPool.addEntry(label, {ConstPoolType::CharInfo, chr});
                    break;
                };

                case ConstPoolType::PtrInfo:
                {
                    this->constPool.addEntry(label, {ConstPoolType::PtrInfo, mapInteger(this->bytecode)});
                    break;
                };

                default:
                {
                    error("Currupted Bytecode: Unreachable ConstPoolType: " + InfoType);
                };
            };
        };

        return 0;
    };

    public:
    int accessConstPool()
    {
        return constPool.accessPool();
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