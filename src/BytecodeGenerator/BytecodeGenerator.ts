import
{
    Stmt
} from "../Parser/GlobalNodes.ts";

import
{
    Parser
} from "../Parser/Parser.ts";

import
{
    Environment
} from "../TypeChecking/Environment.ts";

import
{
    TypeChecker
} from "../TypeChecking/TypeChecker.ts";

import
{
    Bytecode
} from "./Instructions.ts";

import 
{
    generateDeclerationStatement,
    generateExpressionStatement
} from './Statements.ts'

export class BytecodeGenerator
{
    Bytecode: Bytecode;
    Stringbytecode: string;
    TypeChecker: TypeChecker;
    Environment: Environment;
    parser: Parser;

    constructor(parser: Parser, Environment: Environment)
    {
        this.parser = parser;
        this.Environment = Environment;
        this.TypeChecker = new TypeChecker(this.parser, Environment);

        this.Bytecode = this.generateBytecode();

        this.Stringbytecode = this.stringify();
    };

    stringify = (): string =>
    {
        let stringBytecode: string = '';

        stringBytecode += 'main:\n'

        for (const instruction of this.Bytecode)
        {
            stringBytecode += '  ' + instruction.type;

            if (instruction.argument)
            {
                stringBytecode += ' ' + instruction.argument;
            };

            if (instruction.comment)
            {
                stringBytecode += ` // ${instruction.comment}`
            };

            stringBytecode += '\n';
        };

        return stringBytecode;
    };

    generateStatement = (Statement: Stmt): Bytecode =>
    {
        const Bytecode: Bytecode = [];

        switch (Statement.type)
        {
            case 'ExpressionStatement':
            {
                Bytecode.push(...generateExpressionStatement(this, Statement));
                break;
            };

            case 'DeclerationStatement':
            {
                Bytecode.push(...generateDeclerationStatement(this, Statement));
                break;
            }
        };

        return Bytecode;
    };

    generateBytecode = (): Bytecode =>
    {
        const Bytecode: Bytecode = [];

        for (const statement of this.parser.ast.body) 
        {
            Bytecode.push(...this.generateStatement(statement));
        };

        return Bytecode;
    };
};