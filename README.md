# Learning TypeScript by Creating a Programming Language

A bytecode compiled programming language by me (frontend) and NoTimeDev (<https://github.com/NoTimeDev>) (Bytecode interpreter)
Simple but easy to learn with a straight forward syntax language which compiles to bytecode for faster execution

## Credits

Special thanks to NoTimeDev (<https://github.com/NoTimeDev>) for helping out and being a part of the development process for the bytecode interpreter

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

**Stay tuned for updates as I continue to build and refine this programming language!**

## Bytecode Generator

Up to date, here is an example of how an if statement would look like

```python
mut z: 6;

if (z == 6)
{
    z += 1;
}
elif (z == 7)
{
    z += 1;
}
else
{
    z += 1;
};
```

```js
main:
  ipush 0x6
  store z // Assign the top of the stack to 'z'
  load z // load the variable 'z' onto the stack
  ipush 0x6
  eq
  jz 0xb // If the top of the stack is 0 jump to the next instructions
  load z // load the variable 'z' onto the stack
  ipush 0x1
  iadd
  update z // Reassign z to the top of the stack
  jmp 0x18 // Jump through the if else blocks
  load z // load the variable 'z' onto the stack
  ipush 0x7
  eq
  jz 0x14 // If the top of the stack is 0 jump to the next instructions
  load z // load the variable 'z' onto the stack
  ipush 0x1
  iadd
  update z // Reassign z to the top of the stack
  jmp 0x18 // Jump through the if else blocks
  load z // load the variable 'z' onto the stack
  ipush 0x1
  iadd
  update z // Reassign z to the top of the stack

```

## Type Conversions

Current conversions which take place on binary operations

(*if an operation between types is not listed, it's probably a type error*)

String Concatenation / Addition (```+```):

    string + string = string
    char + string = string
    int + string = string
    float + string = string
    int + int = int
    float + float = float

    array + value = array (pushes the value onto the array if types are compatible)

Subtraction (```-```):

    int - int = int
    float - float = float
    
    array - int = array (removes the int-th element)

Multiplication (```*```):

    int * int = int
    float * float = float
    string * int = string (repeats the string int times)

Division (```/```):

    int / int = float (integer division results in float)
    float / float = float

Modulo (```%```):

    int % int = float
    float % float = float

Comparison (```==```, ```!=```, ```>```, ```<```, ```>=```, ```<=```):

    Comparisons between int, float, char return int

    any == any = int

    Mixed types comparison: Promotes to the most compatible type (e.g., int == chr is compared as int == int (ASCII int)).

Bitwise Operators (```<<```, ```>>```, ```&```, ```|```, ```^```):

    Only valid between integers:
        int & int = int
        int | int = int
        int << int = int
        int >> int = int

Logical Operators (```&&```, ```||```):

    Logical operators return int:
        int && int = int
        int || int = int

```in``` Operator:
    Used to check if a value is present in an array:
        value in array = int
