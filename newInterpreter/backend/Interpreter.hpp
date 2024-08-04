#pragma once

#include "shared.hpp"
#include "vector"
#include "string"

using std::cout;
using std::string;
using std::vector;

#include "ExpressionStatements.hpp"

class VM
{
    private:
    vector<int> bytecode;
    Stack stack;

    using StackElement = std::variant<uint64_t, int64_t, std::string, float, double>;

    int eat()
    {
        if (this->bytecode.empty())
        {
            error("Cannot pop from an empty vector");
        };

        int topValue = this->bytecode.front();

        this->bytecode.erase(this->bytecode.begin());

        return topValue;
    };

    int at()
    {
        return this->bytecode.front();
    };


    int interpretProgram()
    {

        const int controlByte = this->eat(); //must always be 0x00


        if (controlByte != MethodType::Program)
        {
            error("Corrupted bytecode: Unrecognized pattern $0x" + itoh(controlByte));
        };

        size_t methodCount = this->generateUInt();

        while (methodCount > 0)
        {
            const int byte = this->eat();

            switch(byte)
            {
                case MethodType::ExpressionStmt:
                {
                    this->interpretExpressionStmts();
                };

                default:
                {
                    error("Corrupted bytecode: Unrecognized MethodType pattern $0x" + itoh(byte));
                };
            }

            methodCount--;
        };

        if (this->bytecode.empty())
        {
            error("Corrupted bytecode: missing 0xFF halt byte");
        };

        const int haltByte = this->eat();

        if (haltByte != 0xFF)
        {
            error("Corrupted bytecode: missing 0xFF halt byte");
        };

    };

    public:
    VM(std::vector<int> bytecode) : bytecode(std::move(bytecode)) {};

    Stack run()
    {
        this->interpretProgram();

        return this->stack;
    };

    uint64_t generateUInt();
    uint64_t interpretExpressionStmts();
    uint64_t interpretLiteral();
};