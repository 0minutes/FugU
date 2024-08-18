#pragma once

#include <iostream>
#include <map>
#include <variant>
#include <cstdint>

#include "shared.hpp"

using ConstPoolValue = std::variant<int,char32_t ,std::string, double, unsigned long long, signed long long>;

struct ConstPoolEntry
{
    ConstPoolType type;
    ConstPoolValue value;
};

class ConstPoolManager
{
    public:
    std::map<int, ConstPoolEntry> constPool;

    ConstPoolEntry addEntry(int idx, ConstPoolEntry value)
    {
        this->constPool[idx] = value;
        return value;
    };

    ConstPoolEntry getEntry(int idx)
    {
        if (this->constPool.size() <= idx || idx < 0)
        {
            error("Cannot access the entry at an invalid index");
        };

        return this->constPool[idx];
    };

    ConstPoolValue getEntryValue(int idx)
    {
        if (this->constPool.size() <= idx || idx < 0)
        {
            error("Cannot access the entry at an invalid index");
        };

        if (this->constPool[idx].type == ConstPoolType::PtrInfo)
        {
            int ptrPointsTo = std::get<int>(this->constPool[idx].value);

            return this->constPool[ptrPointsTo].value;
        };

        return this->constPool[idx].value;
    };

    std::string constPoolType2String(ConstPoolType type)
    {
        switch (type)
        {
            case ConstPoolType::PtrInfo:
            {
                return "PtrInfo";
            };
            case ConstPoolType::StringInfo:
            {
                return "StringInfo";
            };
            case ConstPoolType::BigIntInfo:
            {
                return "BigIntInfo";
            };
            case ConstPoolType::SignedInfo:
            {
                return "SignedInfo";
            };
            case ConstPoolType::DoubleInfo:
            {
                return "DoubleInfo";
            };
            case ConstPoolType::CharInfo:
            {
                return "CharInfo";
            };
            default:
            {
                return "Corrupted std::map<int, ConstPoolEntry>: Unreachable constpooltype: " + type;
            };
        };
    };

    size_t accessPool()
    {
        size_t maxTypeLength = 0;
        for (const auto &entry : constPool)
        {
            size_t typeLength = constPoolType2String(entry.second.type).length();
            if (typeLength > maxTypeLength)
            {
                maxTypeLength = typeLength;
            };
        };  

        for (const auto &entry : constPool)
        {
            int idx = entry.first;
            ConstPoolEntry constPoolEntry = entry.second;
            
            std::string typeStr = constPoolType2String(constPoolEntry.type);
            std::cout << "Index: " << idx << ", Type: " << typeStr;

            std::cout << std::string(maxTypeLength - typeStr.length() + 1, ' ') << "Value: ";

            std::visit([](auto &&arg)
            {
                std::cout << arg;
            }, constPoolEntry.value);
            
            std::cout << std::endl;
        };

        return constPool.size();
    };
};