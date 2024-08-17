#include <iostream>
#include <string>
#include <cstring>
#include <vector>
#include <sstream>
#include <iomanip>
#include <variant>
#include <stdexcept>

enum ConstPoolType
{
    PtrInfo,
    StringInfo,
    BigIntInfo,
    SignedInfo,
    DoubleInfo,
    CharInfo,
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

enum BinaryOps
{
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
};

enum InstructionType
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

    Constnull,

    U8,
    U16,
    U32,
    U64,

    S8,
    S16,
    S32,
    S64,

    Ldc,
    Ldcp,

    Ret = 0xFE,
    Halt = 0xFF,
};

uint64_t uint64(std::vector<uint8_t> &bytes)
{
    if (bytes.empty())
    {
        throw std::invalid_argument("bytes array is empty");
    }

    int chunks = bytes[0];

    if (chunks > bytes.size() - 1)
    {
        throw std::invalid_argument("Corrupted Bytecode: Insufficient bytes to decode uint64");
    }

    uint64_t value = 0;

    for (int i = 1; i <= chunks; ++i)
    {
        value |= (static_cast<uint64_t>(bytes[i]) << ((i - 1) * 8));
    };

    for (uint8_t i = 0; i < chunks+1; i++)
    {
        bytes.erase(bytes.begin());
    };

    return value;
}

uint32_t uint32(std::vector<uint8_t> &bytes)
{
    if (bytes.empty())
    {
        throw std::invalid_argument("bytes array is empty");
    }

    int chunks = bytes[0];

    if (chunks > bytes.size() - 1)
    {
        throw std::invalid_argument("Corrupted Bytecode: Insufficient bytes to decode uint32");
    }

    uint32_t value = 0;

    for (int i = 1; i <= chunks; ++i)
    {
        value |= (static_cast<uint32_t>(bytes[i]) << ((i - 1) * 8));
    };

    for (uint8_t i = 0; i < chunks+1; i++)
    {
        bytes.erase(bytes.begin());
    };

    return value;
}

uint16_t uint16(std::vector<uint8_t> &bytes)
{
    if (bytes.empty())
    {
        throw std::invalid_argument("bytes array is empty");
    };

    int chunks = bytes[0];

    if (chunks > bytes.size() - 1)
    {
        throw std::invalid_argument("Corrupted Bytecode: Insufficient bytes to decode uint16");
    }

    uint16_t value = 0;

    for (int i = 1; i <= chunks; ++i)
    {
        value |= (static_cast<uint16_t>(bytes[i]) << ((i - 1) * 8));
    };

    for (uint8_t i = 0; i < chunks+1; i++)
    {
        bytes.erase(bytes.begin());
    };

    return value;
};

uint8_t uint8(std::vector<uint8_t> &bytes)
{
    if (bytes.empty())
    {
        throw std::invalid_argument("bytes array is empty");
    }

    int chunks = bytes[0];
    uint8_t value = 0;

    if (chunks > bytes.size() - 1)
    {
        throw std::invalid_argument("Corrupted Bytecode: Insufficient bytes to decode uint8");
    }

    for (int i = 1; i <= chunks; ++i)
    {
        value |= (static_cast<uint8_t>(bytes[i]) << ((i - 1) * 8));
    };

    for (uint8_t i = 0; i < chunks+1; i++)
    {
        bytes.erase(bytes.begin());
    };

    return value;
};

double f64float(std::vector<unsigned char> &bytes)
{
    if (bytes.size() < 8)
    {
        throw std::runtime_error("Corrupted Bytecode: Insufficient amount of bytes to create a f64 double");
    };

    uint64_t bits = 0;

    for (size_t i = 0; i < 8; i++)
    {
        bits |= static_cast<uint64_t>(bytes[i]) << (8 * i);
    };

    double result;
    std::memcpy(&result, &bits, sizeof(result));

    for (uint8_t i = 0; i < 8; i++)
    {
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
            return uint8(bytes);
        };

        case 2:
        {
            return uint16(bytes);
        };

        case 4:
        {
            return uint32(bytes);
        };

        case 8:
        {
            return uint64(bytes);
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
    

    StackElement push(const StackElement& element)
    {
        elements.push_back(element);
        return element;
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