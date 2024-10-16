# Learning TypeScript by Creating a Programming Language

Welcome to my project, where I am learning TypeScript by creating a programming language from scratch. This hands-on approach helps me deepen my understanding of TypeScript, building on my existing JavaScript knowledge.

The source code for various components of the language can be found in the `./src/` directory.

## Project Structure

- [`./src/Lexer/Lexer.ts`](./src/Lexer/Lexer.ts) - Contains the lexer implementation.
- [`./src/Parser/Parser.ts`](./src/Parser/Parser.ts) - Contains the Parser implementation.
- [`./stc/TypeChecking/TypeChecker.ts`](./src/TypeChecking/TypeChecker.ts) - Contains the TypeChecker implementation
- [`./main.ts`](./main.ts) - Contains the shell code which allows the language to be run in the console (when interpreter somewhat working ill add support).

## Progress

- [x] **Lexer** - Completed ([source](./src/Lexer/Lexer.ts))
- [x] **Parser** - Started ([source](./src/Parser/Parser.ts))

**Stay tuned for updates as I continue to build and refine this programming language!**

## Type Conversions

Current conversions which take place on binary operations

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
