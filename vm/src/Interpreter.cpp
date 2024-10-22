#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include <variant>

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

    label,
};

struct Instruction {
    InstructionType type;
    std::string argument;
};

enum TokenType {
    str,
    num,
    f64float,

    instruction,

    Tlabel,

    instrEnd
};

struct Token {
    TokenType type;
    std::string value;
    int line;
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

        if (!file.is_open()) {
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

                if (chr == '\n') break;

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

                    
                    if (i >= line.length())
                    {
                        error("Invalid digit");
                        break;
                    };

                    if ((line[i] == 'x' || line[i] == 'X') && flt == "0")
                    {
                        flt += line[i];
                        i++;
                        if (i >= line.length())
                        {
                            error("Invalid hex digit");
                            break;
                        }

                        do {
                            if (line[i] == '\n' || line[i] == '\r' || line[i] == ' ' || line[i] == ';') break;
                            if (!std::isxdigit(line[i]))
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
                            break;
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

                    const Token tok = {
                        .type = TokenType::instruction,
                        .value = ident,
                        .line = this->line
                    };

                    Tokens.push_back(tok);
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
    std::vector<Instruction> Bytecode;
    std::vector<Token> Tokens;

    std::string filename;

    int errors;

    Parser(const std::vector<Token> &Tokens, std::string filename) : Tokens(Tokens), filename(filename) {
        this->errors = 0;
        Parse();
    };

    void Parse() {
        int i = 0;

        while (i < this->Tokens.size()) {
            const Token tok = this->Tokens[i];

            if (tok.type == TokenType::Tlabel)
            {
                this->Bytecode.push_back(
                    {
                        .type = InstructionType::label,
                        .argument = tok.value
                    }
                );
            }

            else if (tok.type == TokenType::instruction)
            {
                this->handleInstruction(i);
            }

            else
            {
                error("Bad token: " + tok.value, tok.line);
            };

            i++;
        };

        if (this->errors >= 1)
        {
            std::cout << "Found " << this->errors << " error(s) in " << this->filename << std::endl;
            exit(1);
        };
    };

    void handleInstruction(int &idx) {
        const Token tok = this->Tokens[idx];

        if (tok.value == "ipush")
        {
            if (idx++ >= this->Tokens.size())
            {
                error("Expected hex integer after " + tok.value, tok.line);
                return;
            };

            if (this->Tokens[idx].type != TokenType::num)
            {
                error("Expected hex integer after " + tok.value, tok.line);
                return;
            }

            this->Bytecode.push_back({
                .type = InstructionType::ipush,
                .argument = this->Tokens[idx].value
            });
        }

        else if (tok.value == "fpush")
        {
            if (idx++ >= this->Tokens.size())
            {
                error("Expected a float after " + tok.value, tok.line);
                return;
            };

            if (this->Tokens[idx].type != TokenType::f64float)
            {
                error("Expected a float after " + tok.value, tok.line);
                return;
            }

            this->Bytecode.push_back({
                .type = InstructionType::fpush,
                .argument = this->Tokens[idx].value
            });
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
                return;
            }

            this->Bytecode.push_back({
                .type = InstructionType::spush,
                .argument = this->Tokens[idx].value
            });
        }

        else
        {
            error("Bad instruction: " + tok.value, tok.line);
        };

        if (idx++ >= this->Tokens.size())
        {   
            error("Expected a semicolon at the end of the instruction", tok.line);
            return;
        }

        if (this->Tokens[idx].type != TokenType::instrEnd)
        {
            error("Expected a semicolon at the end of the instruction ", tok.line);
            return;
        };

        return;
    }; 

    void error(std::string message, int line)
    {
        std::cout << "Error: At line " + std::to_string(line) + ": " << message << std::endl;
        this->errors++;
    };
};