#pragma once

#include "Interpreter.hpp"

uint64_t VM::interpretExpressionStmts()
{
    const int ExpressionType = this->eat();

    switch (ExpressionType)
    {
        case ExpressionType::Literal:
        {
            this->stack.push(this->generateUInt());
        };
        default:
        {
            error("Corrupted bytecode: ExpressionStmts Cannot match $0x" + itoh(this->at()));
            return 1;
        };
    };
};

uint64_t VM::interpretLiteral()
{
    switch (this->eat())
    {
        case InstructionTypes::Const0:
        {
            this->stack.push(0);
            break;
        };

        case InstructionTypes::Const1:
        {
            this->stack.push(1);
            break;
        };

        case InstructionTypes::Const2:
        {
            this->stack.push(2);
            break;
        };

        case InstructionTypes::Const3:
        {
            this->stack.push(3);
            break;
        };

        case InstructionTypes::Const4:
        {
            this->stack.push(4);
            break;
        };

        case InstructionTypes::Const5:
        {
            this->stack.push(5);
            break;
        };

        case InstructionTypes::Const6:
        {
            this->stack.push(6);
            break;
        };

        case InstructionTypes::Constm1:
        {
            this->stack.push(-1);
            break;
        };

        case InstructionTypes::Constm2:
        {
            this->stack.push(-2);
            break;
        };

        case InstructionTypes::Constm3:
        {
            this->stack.push(-3);
            break;
        };

        case InstructionTypes::Constm4:
        {
            this->stack.push(-4);
            break;
        };

        case InstructionTypes::Constm5:
        {
            this->stack.push(-5);
            break;
        };

        case InstructionTypes::Constm6:
        {
            this->stack.push(-6);
            break;
        };

        case InstructionTypes::U8:
        {
            this->stack.push(this->generateUInt());
        };
        case InstructionTypes::U16:
        {
            this->stack.push(this->generateUInt());
        };
        case InstructionTypes::U32:
        {
            this->stack.push(this->generateUInt());
        };
        case InstructionTypes::U64:
        {
            this->stack.push(this->generateUInt());
        };
    };
    return 0;
};

uint64_t VM::generateUInt()
{
    const int bits = this->eat();

    switch (bits)
    {
        case 1:
        {
            return this->eat();
        };
        case 2:
        {
            return this->eat() | (this->eat() << 8);
        };
        case 4:
        {
            return this->eat() | (this->eat() << 8) | (this->eat() << 16) | (this->eat() << 24);
        };
        case 8:
        {
            uint64_t value;
            for (int i = 0; i < 8; i++)
            {
                value |= this->eat() << 8 * i;
            };

            return value;
        };

        default:
        {
            error("Corrupted bytecode: generateUInt Cannot match $0x" + itoh(this->at()));
            return 1;
        };
    };
};