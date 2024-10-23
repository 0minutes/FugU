#include <stack>
#include <unordered_map>
#include <iostream>

#include "./Parser.cpp"

enum VM_STATE {
    OK,
    UFLOW,
    INVIDX,
    BADLBL,
    ILLINSTR,
};

class VM {
public:
    const char* &filename;
    std::stack<std::string> stack;
    std::stack<size_t> returnStack;

    std::unordered_map<std::string, std::vector<Instruction>> functions;

    size_t sp = 0;

    std::unordered_map<std::string, size_t> LabelsIndx;

    VM(const char* filename) : filename(filename)
    {
        const Lexer L(filename);
        const Parser P(L.Tokens, filename);

        this->functions = P.functions;
    }

    size_t push(std::string arg)
    {
        this->stack.push(arg);
        this->sp++;
        return this->sp;
    }

    std::string pop()
    {
        std::string temp = stack.top();

        if (this->sp == 0)
        {
            std::cerr << "Error: Stack underflow" << std::endl;
            return 0;
        }

        this->stack.pop();
        this->sp--;

        return temp;
    }

    VM_STATE runmain()
    {
        if (this->functions.find("main") == this->functions.end())
        {
            std::cerr << "Unable to find main label entry" << std::endl;
            return VM_STATE::BADLBL;
        }

        return this->run(this->functions.at("main"));
    }

    VM_STATE run(std::vector<Instruction> instructions)
    {
        size_t ip = 0;

        while (ip < instructions.size())
        {
            const Instruction &instr = instructions[ip];

            switch (instr.type)
            {
                case InstructionType::vret:
                case InstructionType::sret:
                case InstructionType::fret:
                case InstructionType::iret:
                {
                    return VM_STATE::OK;
                }

                case InstructionType::call:
                {
                    if (this->LabelsIndx.find(instr.argument) == LabelsIndx.end())
                    {
                        std::cerr << "BADLBL: Unable to find the label " << instr.argument << std::endl;
                        return VM_STATE::INVIDX;
                    }

                    VM_STATE state = run(this->functions.at(instr.argument));

                    if (state != VM_STATE::OK)
                    {
                        return state;
                    };

                    break;
                }

                case InstructionType::jmp:
                {
                    int skipCount = htoll(pop());
                    ip += skipCount;

                    if (ip >= instructions.size())
                    {
                        std::cout << "UFLOW: Unable jmp to more than the instruction set" << std::endl;
                        return VM_STATE::UFLOW;
                    };

                    continue;
                }

                case InstructionType::jz:
                {
                    if (this->stack.empty())
                    {
                        std::cout << "UFLOW: Unable to get top of the stack at jz" << std::endl;
                        return VM_STATE::UFLOW;
                    }

                    size_t topValue = htoll(pop());

                    if (topValue == 0)
                    {
                        int skipCount = std::stoi(instr.argument);
                        ip += skipCount;

                        if (ip >= instructions.size())
                        {
                            std::cout << "UFLOW: Unable jmp to more than the instruction set" << std::endl;
                            return VM_STATE::UFLOW;
                        };

                        continue;
                    }
                    
                    break;
                }

                case InstructionType::ipush:
                {
                    this->push(instr.argument);
                }
                case InstructionType::fpush:
                {
                    this->push(instr.argument);
                }
                case InstructionType::spush:
                {
                    this->push(instr.argument);
                }

                case InstructionType::npush:
                {
                    this->push(instr.argument);
                }

                case InstructionType::iadd:
                {
                    this->push(instr.argument);
                }
                case InstructionType::fadd:
                {
                }
                case InstructionType::sadd:
                {

                }

                case InstructionType::imin:
                {

                }
                case InstructionType::fmin:
                {

                }

                case InstructionType::smul:
                {

                }
                case InstructionType::imul:
                {

                }
                case InstructionType::fmul:
                {

                }

                case InstructionType::idiv:
                {

                }
                case InstructionType::fdiv:
                {

                }

                case InstructionType::ipow:
                {

                }
                case InstructionType::fpow:
                {

                }

                default:
                {
                    std::cout << "illegal instruction: " << instr.argument << std::endl;
                    return VM_STATE::ILLINSTR;
                }
            }

            ip++;
        }
        return VM_STATE::OK;
    }

    size_t htoll(const std::string& hex)
    {
        if (hex.substr(0, 2) == "0x" || hex.substr(0, 2) == "0X")
        {
            return std::stoll(hex, nullptr, 16);
        };

        std::cerr << "Invalid hexadecimal string format";
    }
};
