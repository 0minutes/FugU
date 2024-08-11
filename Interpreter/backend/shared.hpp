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

    halt = 0xff,
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

std::string itoh(int integer)
{
    std::stringstream stream;
    stream << std::hex << std::uppercase << integer;
    std::string result = stream.str();

    return "0x" + result;
};


void error(std::string message)
{
    cout << "Fatal Error: " << message << std::endl;
    getchar();
    exit(1);
};

class Stack
{
    private:
    using StackElement = int;
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