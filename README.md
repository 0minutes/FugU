# Learning TypeScript && C++ by Creating a Programming Language

## Project Structure

The source code for various components of the language can be found in the `./src/` directory.

- [`./src/Lexer/Lexer.ts`](./src/Lexer/Lexer.ts) - Contains the lexer implementation.
- [`./src/Parser/Parser.ts`](./src/Parser/Parser.ts) - Contains the Parser implementation.
- [`./src/TypeChecking/TypeChecker.ts`](./src/TypeChecking/TypeChecker.ts) - Contains the TypeChecker implementation
- [`./src/BytecodeGenerator/BytecodeGenerator.ts`](./src/BytecodeGenerator/BytecodeGenerator.ts) - Contains the Bytecode generation implementation
- [`./main.ts`](./main.ts) - Contains the shell code which allows the language to be run in the console (when interpreter somewhat working ill add support).

## Progress

- [x] **Lexer** - Completed ([source](./src/Lexer/Lexer.ts))
- [x] **Parser** - Completed ([source](./src/Parser/Parser.ts)) Missing many features
- [x] **Typechecker** - Complete ([source](./src/TypeChecking/TypeChecker.ts)) Up do date with the ast
- [x] **BytecodeGenerator** - Complete ([source](./src/BytecodeGenerator/BytecodeGenerator.ts)) Up do date with the ast