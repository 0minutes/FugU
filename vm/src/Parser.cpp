#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>

enum InstructionType {
    ipush,
    fpush,
    spush,

    npush,

    iadd,
    fadd,
    sadd,

    imin,
    fmin,

    smul,
    imul,
    fmul,

    idiv,
    fdiv,

    ipow,
    fpow,


    eq,
    neq,
    gt,
    lt,
    gteq,
    lteq,
    
    And,
    Or,
    Not,
    
    bitAnd,
    bitOr,
    xOr,
    bitNot,

    fmod,
    imod,
    rshift,
    lshift,

    load,

    store,
    update,

    jmp,
    jz,

    call,
    label,

    sret,
    fret,
    iret,
    vret,
};

struct Instruction {
    InstructionType type;
    std::string argument;
};



enum TokenType {
    str,
    num,
    f64float,

    ident,
    instruction,

    Tlabel,

    instrEnd
};

struct Token {
    TokenType type;
    std::string value;
    int line;
};

std::unordered_map<std::string, TokenType> instructions {
    {"ipush", TokenType::instruction},
    {"fpush", TokenType::instruction},
    {"spush", TokenType::instruction},

    {"npush", TokenType::instruction},

    {"iadd", TokenType::instruction},
    {"fadd", TokenType::instruction},
    {"sadd", TokenType::instruction},

    {"imin", TokenType::instruction},
    {"fmin", TokenType::instruction},

    {"smul", TokenType::instruction},
    {"imul", TokenType::instruction},
    {"fmul", TokenType::instruction},

    {"idiv", TokenType::instruction},
    {"fdiv", TokenType::instruction},

    {"ipow", TokenType::instruction},
    {"fpow", TokenType::instruction},


    {"eq", TokenType::instruction},
    {"neq", TokenType::instruction},
    {"gt", TokenType::instruction},
    {"lt", TokenType::instruction},
    {"gteq", TokenType::instruction},
    {"lteq", TokenType::instruction},
    
    {"And", TokenType::instruction},
    {"Or", TokenType::instruction},
    {"Not", TokenType::instruction},
    
    {"bitAnd", TokenType::instruction},
    {"bitOr", TokenType::instruction},
    {"xOr", TokenType::instruction},
    {"bitNot", TokenType::instruction},

    {"fmod", TokenType::instruction},
    {"imod", TokenType::instruction},
    {"rshift", TokenType::instruction},
    {"lshift", TokenType::instruction},

    {"load", TokenType::instruction},

    {"store", TokenType::instruction},
    {"update", TokenType::instruction},

    {"jmp", TokenType::instruction},
    {"jz", TokenType::instruction},

    {"label", TokenType::instruction},

    {"sret", TokenType::instruction},
    {"fret", TokenType::instruction},
    {"iret", TokenType::instruction},
    {"vret", TokenType::instruction},
};

class Lexer {
    public:
    std::string filename;
    std::vector<Token> Tokens;

    int line;
    int errors;

    Lexer(const char* filename)
    {
        std::ifstream file(filename, std::ios::binary);

        if (!(file.is_open())) {
            std::cerr << "Fatal Error: Could not open the file " << filename << std::endl;
        };


        this->filename = filename;
        this->errors = 0;
        this->line = 0;

        this->Tokens = this->Lex(std::ifstream(filename, std::ios::binary));
    };

    std::vector<Token> Lex(std::ifstream file) {
        std::string line;

        std::vector<Token> Tokens;

        while (std::getline(file, line)) {
            this->line++;
            int i = 0;

            while (i < line.length()) {
                char chr = line[i];

                if (chr == '\n')break;

                if (chr == ';')
                {
                    Tokens.push_back({
                        .type = TokenType::instrEnd,
                        .value = ";",
                        .line = this->line
                    });
                    i++;
                }

                else if (chr =='\t' || chr == '\v' || chr == '\r' || chr == '\f' || chr == ' ')
                {
                    i++;
                    continue;
                }

                else if (chr == '/')
                {
                    i++;
                    if(i >= line.length())
                    {
                        error("Bad token: (unicode) " + std::to_string(chr));
                        break;
                    };
    

                    if (line[i] != '/')
                    {
                        error("Bad token: (unicode) " + std::to_string(chr));
                        break;
                    };

                    break;
                    
                }

                else if (std::isdigit(chr))
                {
                    std::string flt;
                    flt += chr;
                    i++;

                    bool dot = false;
                    if(i >= line.length())
                    {
                        error("Invalid digit");
                        break;
                    };
                    if((line[i] == 'x' || line[i] == 'X') && flt == "0")
                    {
                        flt += line[i];
                        i++;
                        if (i >= line.length())
                        {
                            error("Invalid hex digit");
                            break;
                        }

                        do {
                            if(line[i] == '\n' || line[i] == '\r' || line[i] == ' ' || line[i] == ';')break;
                            if(!std::isxdigit(line[i]))
                            {
                                error("Invalid hex digit: (unicode) " + std::to_string(line[i]));
                            };
                            flt += line[i];
                            i++;
                        } while (i < line.length());

                        const Token tok = {
                            .type = TokenType::num,
                            .value = flt,
                            .line = this->line
                        };

                        Tokens.push_back(tok);
                    }

                    else
                    {
                        do
                        {
                            if (line[i] == '.' && dot)
                            {
                                error("Invalid float digit. Multiple dots");
                                break;
                            };

                            if (line[i] == '.')
                            {
                                dot = true;
                                flt += line[i];
                                i++;
                                continue;
                            };

                            if (line[i] == '\n' || line[i] == '\r' || line[i] == ' ' || line[i] == ';') break;
                            if (!std::isdigit(line[i]))
                            {
                                error("Invalid float digit: (unicode) " + std::to_string(line[i]));
                                break;
                            }

                            flt += line[i];
                            i++;
                        } while (i < line.length());

                        if (!dot)
                        {
                            error("Invalid float digit. Missing a dot");
                        }

                        const Token tok = {
                            .type = TokenType::f64float,
                            .value = flt,
                            .line = this->line
                        };

                        Tokens.push_back(tok);
                    }
                }

                else if (chr == '"')
                {
                    i++;
                    std::string str;

                    if (i >= line.length())
                    {
                        error("Undetermined string");
                        break;
                    }

                    do {
                        if (line[i] == '"')
                        {
                            i++;
                            break;
                        }

                        str += line[i];
                        i++;

                    } while (i < line.length());

                    if (line[i-1] != '"')
                    {
                        error("Undetermined string");
                        break;
                    }

                    const Token tok = {
                        .type = TokenType::str,
                        .value = str, 
                        .line = this->line
                    };

                    Tokens.push_back(tok);
                }
                
                else if (std::isalpha(chr))
                {
                    std::string ident;
                    ident += chr;
                    
                    i++;

                    if (i < line.length())
                    {
                        if (line[i] == ':')
                        {
                            i++;
                            const Token tok = {
                                .type = TokenType::Tlabel,
                                .value = ident, 
                                .line = this->line
                            };

                            Tokens.push_back(tok);

                            continue;
                        }

                        do {
                            if (!(std::isalpha(line[i])))
                            {
                                break;
                            };

                            ident += line[i];
                            i++;
                        } while(i < line.length());

                        if (i < line.length())
                        {
                            if (line[i] == ':')
                            {
                                i++;
                                const Token tok = {
                                    .type = TokenType::Tlabel,
                                    .value = ident,
                                    .line = this->line
                                };

                                Tokens.push_back(tok);

                                continue;
                            }
                        }
                    };


                    if (instructions.find(ident) == instructions.end())
                    {
                        const Token tok = {
                            .type = TokenType::ident,
                            .value = ident,
                            .line = this->line
                        };

                        Tokens.push_back(tok);
                    }
                    else
                    {
                        const Token tok = {
                            .type = TokenType::instruction,
                            .value = ident,
                            .line = this->line
                        };
                        
                        Tokens.push_back(tok);
                    }

                }

                else
                {
                    error("Bad token: (unicode) " + std::to_string(chr));
                    break;
                };
            };
        };

        if (this->errors >= 1)
        {
            std::cout << "Found " << this->errors << " error(s) in " << this->filename << std::endl;
            exit(1);
        };

        return Tokens;
    };

    void error(std::string message)
    {
        std::cout << "Error: At line " + std::to_string(this->line) + ": " << message << std::endl;
        this->errors++;
    };
};


class Parser {
public:
    std::unordered_map<std::string, std::vector<Instruction>> functions;
    std::vector<Token> Tokens;
    std::string filename;
    int errors;

    Parser(const std::vector<Token>& Tokens, std::string filename) : Tokens(Tokens), filename(filename)
    {
        this->errors = 0;
        this->Parse();
    };

    void Parse() {
        int i = 0;

        while (i < this->Tokens.size()) {
            const Token tok = this->Tokens[i];

            if (tok.type == TokenType::Tlabel) {
                std::string labelName = tok.value;
                i++;

                if (i >= this->Tokens.size()) {
                    error("Expected at least one or more instructions after the label " + labelName, tok.line);
                }

                std::vector<Instruction> functionBody; // Store instructions for the function
                while (i < this->Tokens.size()) 
                {
                    if (this->Tokens[i].value == "iret")
                    {
                        functionBody.push_back({ InstructionType::iret, "" });
                        i++;
                        break;
                    }
                    else if (this->Tokens[i].value == "fret")
                    {
                        functionBody.push_back({ InstructionType::fret, "" });
                        i++;
                        break;
                    }
                    else if (this->Tokens[i].value == "sret")
                    {
                        functionBody.push_back({ InstructionType::sret, "" });
                        i++;
                        break;
                    }
                    else if (this->Tokens[i].value == "vret")
                    {
                        functionBody.push_back({ InstructionType::vret, "" });
                        i++;
                        break;
                    }

                    handleInstruction(i, functionBody);

                    if (i >= this->Tokens.size() || this->Tokens[i].type != TokenType::instrEnd) {
                        error("Expected a semicolon at the end of the instruction ", tok.line);
                    }
                    i++;
                }

                functions[labelName] = functionBody;
            }
            else {
                error("Bad Label: " + tok.value, tok.line);
            };

            i++;
        }

        if (this->errors >= 1) {
            std::cout << "Found " << this->errors << " error(s) in " << this->filename << std::endl;
            exit(1);
        }
    };

    void handleInstruction(int& idx, std::vector<Instruction>& functionBody) {
        const Token tok = this->Tokens[idx];

        if (tok.value == "ipush") {
            if (idx++ >= this->Tokens.size()) 
            {
                error("Expected hex integer after " + tok.value, tok.line);
                return;
            };

            if (this->Tokens[idx].type != TokenType::num)
            {
                error("Expected hex integer after " + tok.value, tok.line);
            }

            functionBody.push_back({ InstructionType::ipush, this->Tokens[idx].value });
        }

        else if (tok.value == "fpush")
        {
            if (idx++ >= this->Tokens.size()) {
                error("Expected a float after " + tok.value, tok.line);
                return;
            };

            if (this->Tokens[idx].type != TokenType::f64float)
            {
                error("Expected a float after " + tok.value, tok.line);
            }

            functionBody.push_back({ InstructionType::fpush, this->Tokens[idx].value });
        }

        else if (tok.value == "spush")
        {
            if (idx++ >= this->Tokens.size())
            {
                error("Expected a string after " + tok.value, tok.line);
                return;
            };

            if (this->Tokens[idx].type != TokenType::str)
            {
                error("Expected a string after " + tok.value, tok.line);
            }

            functionBody.push_back({ InstructionType::spush, this->Tokens[idx].value });
        }

        else if (tok.value == "jz")
        {
            if (idx++ >= this->Tokens.size())
            {
                error("Expected a hex integer after " + tok.value, tok.line);
                return;
            };

            if (this->Tokens[idx].type != TokenType::num)
            {
                error("Expected a hex integer after " + tok.value, tok.line);
            }

            functionBody.push_back({ InstructionType::jz, this->Tokens[idx].value });
        }

        else if (tok.value == "jmp")
        {
            if (idx++ >= this->Tokens.size())
            {
                error("Expected a hex integer after " + tok.value, tok.line);
                return;
            };

            if (this->Tokens[idx].type != TokenType::num)
            {
                error("Expected a hex integer after " + tok.value, tok.line);
            }

            functionBody.push_back({ InstructionType::jmp, this->Tokens[idx].value });
        }

        else if (tok.value == "call")
        {
            if (idx++ >= this->Tokens.size())
            {
                error("Expected a label after " + tok.value, tok.line);
                return;
            };

            if (this->Tokens[idx].type != TokenType::ident)
            {
                error("Expected a label after " + tok.value, tok.line);
            }

            functionBody.push_back({ InstructionType::call, this->Tokens[idx].value });
        }

        else if (tok.value == "iadd")
        {
            functionBody.push_back({
                .type = InstructionType::iadd,
                .argument = ""
            });
        }

        else if (tok.value == "fadd")
        {
            functionBody.push_back({
                .type = InstructionType::fadd,
                .argument = ""
            });
        }

        else if (tok.value == "sadd")
        {
            functionBody.push_back({
                .type = InstructionType::sadd,
                .argument = ""
            });
        }

        else if (tok.value == "imin")
        {
            functionBody.push_back({
                .type = InstructionType::imin,
                .argument = ""
            });
        }

        else if (tok.value == "fmin")
        {
            functionBody.push_back({
                .type = InstructionType::fmin,
                .argument = ""
            });
        }

        else if (tok.value == "imul")
        {
            functionBody.push_back({
                .type = InstructionType::imul,
                .argument = ""
            });
        }

        else if (tok.value == "smul")
        {
            functionBody.push_back({
                .type = InstructionType::smul,
                .argument = ""
            });
        }

        else if (tok.value == "fmul")
        {
            functionBody.push_back({
                .type = InstructionType::fmul,
                .argument = ""
            });
        }

        else if (tok.value == "idiv")
        {
            functionBody.push_back({
                .type = InstructionType::idiv,
                .argument = ""
            });
        }

        else if (tok.value == "fdiv")
        {
            functionBody.push_back({
                .type = InstructionType::fdiv,
                .argument = ""
            });
        }

        else if (tok.value == "ipow")
        {
            functionBody.push_back({
                .type = InstructionType::ipow,
                .argument = ""
            });
        }

        else if (tok.value == "fpow")
        {
            functionBody.push_back({
                .type = InstructionType::fpow,
                .argument = ""
            });
        }

        else if (tok.value == "eq")
        {
            functionBody.push_back({
                .type = InstructionType::eq,
                .argument = ""
            });
        }

        else if (tok.value == "neq")
        {
            functionBody.push_back({
                .type = InstructionType::neq,
                .argument = ""
            });
        }

        else if (tok.value == "gt")
        {
            functionBody.push_back({
                .type = InstructionType::gt,
                .argument = ""
            });
        }

        else if (tok.value == "lt")
        {
            functionBody.push_back({
                .type = InstructionType::lt,
                .argument = ""
            });
        }

        else if (tok.value == "gteq")
        {
            functionBody.push_back({
                .type = InstructionType::gteq,
                .argument = ""
            });
        }

        else if (tok.value == "lteq")
        {
            functionBody.push_back({
                .type = InstructionType::lteq,
                .argument = ""
            });
        }
        
        else if (tok.value == "and")
        {
            functionBody.push_back({
                .type = InstructionType::And,
                .argument = ""
            });
        }

        else if (tok.value == "or")
        {
            functionBody.push_back({
                .type = InstructionType::Or,
                .argument = ""
            });
        }

        else if (tok.value == "not")
        {
            functionBody.push_back({
                .type = InstructionType::Not,
                .argument = ""
            });
        }

        else if (tok.value == "bitAnd")
        {
            functionBody.push_back({
                .type = InstructionType::bitAnd,
                .argument = ""
            });
        }

        else if (tok.value == "bitOr")
        {
            functionBody.push_back({
                .type = InstructionType::bitOr,
                .argument = ""
            });
        }

        else if (tok.value == "xOr")
        {
            functionBody.push_back({
                .type = InstructionType::xOr,
                .argument = ""
            });
        }

        else if (tok.value == "bitNot")
        {
            functionBody.push_back({
                .type = InstructionType::bitNot,
                .argument = ""
            });
        }

        else if (tok.value == "fmod")
        {
            functionBody.push_back({
                .type = InstructionType::fmod,
                .argument = ""
            });
        }

        else if (tok.value == "imod")
        {
            functionBody.push_back({
                .type = InstructionType::imod,
                .argument = ""
            });
        }

        else if (tok.value == "rshift")
        {
            functionBody.push_back({
                .type = InstructionType::rshift,
                .argument = ""
            });
        }

        else if (tok.value == "lshift")
        {
            functionBody.push_back({
                .type = InstructionType::lshift,
                .argument = ""
            });
        }

        else {
            error("Bad instruction: " + tok.value, tok.line);
        }

        idx++;
    };

    void error(std::string message, int line) {
        std::cout << "Error: At line " + std::to_string(line) + ": " << message << std::endl;
        this->errors++;
    };
};
