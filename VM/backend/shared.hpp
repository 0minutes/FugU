#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include <variant>
#include <stdexcept>

using std::cout;
using std::cin;
using std::vector;

enum InstructionTypes
{
    Const0,
    Const1,
    Const2,
    Const3,
    Const4,
    Const5,
    Const6,

    Constm1,
    Constm2,
    Constm3,
    Constm4,
    Constm5,
    Constm6,

    ConstNull,

    U8, 
    U16,
    U32,
    U64,

    S8,
    S16,
    S32,
    S64,

    Add,
    Sadd,

    Sub,

    Mul,
    Smul,

    Pow,

    Div,
    Mod,
    Not,

    Eqls,
    Neqls,

    Gt,
    Lt,

    Gteqls,
    Lteqls,

    Shl,
    Shr,

    Ldc,

    Ret = 0xFE,
    Halt = 0xFF,
};

enum ConstPoolType
{
    Utf8Info,
    StringInfo,
    BigIntInfo,
    SignedInto,
    DoubleInfo,
};

enum MethodType
{
    Program,
    ExpressionStmt,
};

enum ExpressionType
{
    Literal,
    BinaryExpression,
    UnaryExpression,
    UnaryUpdateExpression,
};

unsigned char u8int(std::vector<unsigned char> &bytes)
{
    if (bytes.size() < 2)
    {
        throw std::runtime_error("Corrupted Bytecode: Insufficient amount of bytes to create an u8 int");
    };

    uint8_t temp = bytes[1]; 

    bytes.erase(bytes.begin());
    bytes.erase(bytes.begin());

    return temp;
};

unsigned short u16int(std::vector<unsigned char> &bytes)
{
    if (bytes.size() < 3)
    {
        throw std::runtime_error("Corrupted Bytecode: Insufficient amount of bytes to create a u16 int");
    };

    bytes.erase(bytes.begin());

    unsigned short result = 0;

    for (size_t i = 0; i < 2; i++)
    {
        result |= static_cast<unsigned short>(bytes[i]) << (8 * (i - 1));
        bytes.erase(bytes.begin());
    };

    return result;
};

unsigned u32int(std::vector<unsigned char> &bytes)
{
    if (bytes.size() < 5)
    {
        throw std::runtime_error("Corrupted Bytecode: Insufficient amount of bytes to create a u32 int");
    };

    bytes.erase(bytes.begin());

    unsigned result = 0;

    for (size_t i = 0; i < 4; i++)
    {
        result |= static_cast<unsigned>(bytes[i]) << (8 * (i - 1));
        bytes.erase(bytes.begin());
    };

    return result;
};

unsigned long long u64int(std::vector<unsigned char> &bytes)
{
    if (bytes.size() < 9)
    {
        throw std::runtime_error("Corrupted Bytecode: Insufficient amount of bytes to create a u64 int");
    };

    bytes.erase(bytes.begin());
    unsigned long long result = 0;

    for (size_t i = 0; i < 8; i++)
    {
        result |= static_cast<unsigned long long>(bytes[i]) << (8 * (i - 1));
        bytes.erase(bytes.begin());
    };

    return result;
};

std::string itoh(int integer)
{
    std::stringstream stream;
    stream << std::hex << std::uppercase << integer;
    std::string result = stream.str();

    return "0x" + result;
};

uint64_t mapInteger(std::vector<uint8_t> &bytes)
{
    switch (bytes[0])
    {
        case 1:
        {
            return u8int(bytes);
        };

        case 2:
        {
            return u16int(bytes);
        };

        case 4:
        {
            return u32int(bytes);
        };

        case 8:
        {
            return u64int(bytes);
        };

        default:
        {
            throw std::runtime_error("Corrupted Bytecode: Invalid amount of chunks for Integer Constructor provided 0x" + itoh(bytes[0]));
            return 1;
        };
    };
};

class Stack
{
    private:
    using StackElement = unsigned int;
    std::vector<StackElement> elements;

    public:
    

    void push(const StackElement& element)
    {
        elements.push_back(element);
    };

    StackElement pop()
    {
        if (elements.empty())
        {
            throw std::out_of_range("Cannot pop from an empty stack");
        };

        StackElement topElement = elements.back();

        elements.pop_back();

        return topElement;
    };

    StackElement top() const
    {
        if (!elements.empty())
        {
            return elements.back();
        }
        else
        {
            throw std::out_of_range("Cannot get a value from an empty stack");
        };
    };

    bool empty() const
    {
        return elements.empty();
    };

    size_t size() const
    {
        return elements.size();
    };
};