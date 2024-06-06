# Learning TypeScript by Creating a Programming Language

Welcome to my project, where I am learning TypeScript by creating a programming language from scratch. This hands-on approach helps me deepen my understanding of TypeScript, building on my existing JavaScript knowledge.

The source code for various components of the language can be found in the `./backend/` directory.

## Project Structure

- [`./backend/Lexer.ts`](./backend/Lexer.ts) - Contains the lexer implementation.
- [`./backend/shared.ts`](./backend/shared.ts) - Defines all the used Types Functions Enums etc etc.
- [`./backend/Parser.ts`](./backend/Parser.ts) - Houses the parser code, currently a work in progress.
- - [`./backend/ConstantFolding.ts`](./backend/ConstantFolding.ts) - Contains the implementation of the Constantfolding (Something I've been experimenting on) Very early version
- [`./backend/StackGenerator.ts`](./backend/StackGenerator.ts) - Contains the bytecode generator code
- Additional files for the Interpreter will be added as the project progresses.

- [`./main.ts`](./main.ts) - Contains the shell code which allows the language to be run in the console.
- [`./ast.json`](./ast.json) - Contains the AST tree I'm able to produce as of now.

## Progress

- [x] **Lexer** - Completed ([source](./backend/Lexer.ts))
- [x] **AST (Abstract Syntax Tree)** - Completed ([source](./backend/shared.ts))
- [x] **Parser** - Completed and is able to parse Expressions and Numbers etc... ([source](./backend/Parser.ts))
- [x] **Some sort of optimization** - Very early version with only removal of `EmptyStatement` ([source](./backend/ConstantFolding.ts))
- [x] **Bytecode Generator** - Started, but only added support for Literals/Identifiers and Binary Expressions. ([source](./backend/StackGenerator.ts))
- [ ] **Interpreter** - Not started

## How to Run

To run the project, execute the following command in your terminal (*No arguments automatically runs the shell*):

```bash
deno run main.ts [[-h | --help] | [-r | --run [path/to/file]]]
```

To *read from file* use the following command

```bash
deno run --allow-read main.ts -r [path/to/file]
```

**Stay tuned for updates as I continue to build and refine this programming language!**
