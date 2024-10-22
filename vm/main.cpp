#include "Src/Interpreter.cpp"

int main(int argc, const char* argv[]) {

    const Lexer L(argv[1]);

    const Parser P(L.Tokens, argv[1]);

    for (Instruction instr : P.Bytecode)
    {
        std::cout << instr.type << ": ";
        std::cout << instr.argument << std::endl;
    }

    return 0;
}