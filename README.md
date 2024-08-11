# Learning TypeScript by Creating a Programming Language

Welcome to my project, where I am learning TypeScript by creating a programming language from scratch. This hands-on approach helps me deepen my understanding of TypeScript, building on my existing JavaScript knowledge.

The source code for various components of the language can be found in the `./backend/` directory.

## Project Structure

- [`./backend/Parser/Lexer.ts`](./backend/Parser/Lexer.ts) - Contains the lexer implementation.
- [`./backend/shared.ts`](./backend/shared.ts) - Defines all the used Types Functions Enums etc etc.
- [`./backend/Parser/Parser.ts`](./backend/Parser/Parser.ts) - Houses the parser code, currently a work in progress.
- [`./backend/Parser/ConstantFolding.ts`](./backend/Parser/ConstantFolding.ts) - Contains the implementation of the Constantfolding (Something I've been experimenting on) Very early version
- [`./backend/Bytecode/ByteEncoder.ts`](./backend/Bytecode/ByteEncoder.ts) - Contains the bytecode generator code
- Additional files for the Interpreter will be added as the project progresses.
- [`./Interpreter/main.cpp`](./Interpreter/main.cpp) - Contains the first simple code of the bytecode interpreter
- [`./main.ts`](./main.ts) - Contains the shell code which allows the language to be run in the console (when interpreter somewhat working ill add support).

## Progress

- [x] **Lexer** - Completed ([source](./backend/Parser/Lexer.ts))
- [x] **AST (Abstract Syntax Tree)** - Completed and can be found in ([source](./backend/shared.ts))
- [x] **Parser** - Completed and is able to parse Expressions and Numbers etc... ([source](./backend/Parser/Parser.ts))
- [x] **Some sort of optimization** - Very early version with only removal/replacement of `EmptyStatement` and simple Expressions ([source](./backend/Parser/ConstantFolding.ts))
- [x] **Bytecode Generator** - Started, but only added support for `Literals` and `BinaryExpressions`. ([source](./backend/Bytecode/ByteEncoder.ts))
- [ ] **Interpreter** - Started writing in C, havnt added anything yet, just setting up

## How to Run

To run the project, execute the following command in your terminal (*No arguments automatically runs the shell*):

```bash
deno run main.ts [-h | --help];
```

To *read from file* use the following command

```bash
deno run --allow-read main.ts -r [path/to/file];
```

**Stay tuned for updates as I continue to build and refine this programming language!**
