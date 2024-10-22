#include "src/Interpreter.cpp"

int main(int argc, const char* argv[]) {

    if (argc < 2)
    {
        std::cerr << "Fatal Error: Expected a file path" << std::endl;
        exit(1);
    };

    const Lexer L(argv[1]);

    const Parser P(L.Tokens, argv[1]);

    return 0;
}