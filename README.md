# Learning TypeScript by Creating a Programming Language

Welcome to my project, where I am learning TypeScript by creating a programming language from scratch. This hands-on approach helps me deepen my understanding of TypeScript, building on my existing JavaScript knowledge.

The source code for various components of the language can be found in the `./backend/` directory.

## Project Structure

- `./backend/Lexer.ts` - Contains the lexer implementation.
- `./backend/shared.ts` - Defines the Abstract Syntax Tree (AST) structures.
- `./backend/Parser.ts` - Houses all the globa lvariabels that the Parser, Lexer and other classes/functions will use in the future.
- Additional files for ByteCode and Interpreter will be added as the project progresses.

## Progress

- [x] **Lexer** - Completed ([source](./backend/Lexer.ts))
- [x] **AST (Abstract Syntax Tree)** - Completed ([source](./backend/shared.ts))
- [x] **Parser** - Completed and is able to parse Expressions and Numbers etc...([source](./backend/Parser.ts))
- [ ] **ByteCode** - Not started
- [ ] **Interpreter** - Not started

## How to Run

To run the project, execute the following command in your terminal:

```bash
deno run main.ts
```

Stay tuned for updates as I continue to build and refine this programming language!
