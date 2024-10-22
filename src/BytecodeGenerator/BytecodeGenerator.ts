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
    Bytecode,
} from "./Instructions.ts";

import 
{
    generateDeclerationStatement,
    generateExpressionStatement,
    generateIfStatement
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
        this.TypeChecker.checkGlobal()
        

        this.Bytecode = [];

        this.generateBytecode();
        this.Stringbytecode = this.stringify();
    };

    stringify = (): string =>
    {
        let stringBytecode: string = '';

        let maxInstructionLen = 1;

        for (const instruction of this.Bytecode)
        {
            if (instruction.argument != undefined)
            {
                if ((instruction.type + ' ' + instruction.argument).length > maxInstructionLen)
                {
                    maxInstructionLen = (instruction.type + ' ' + instruction.argument).length;
                };
            }
            else if ((instruction.type).length > maxInstructionLen)
            {
                maxInstructionLen = (instruction.type).length;
            };
        };

        stringBytecode += 'main:\n' 

        for (const instruction of this.Bytecode)
        {
            stringBytecode += '  ' + instruction.type;

            if (instruction.argument)
            {
                stringBytecode += ' ' + instruction.argument;
            };

            stringBytecode += ';';

            if (instruction.comment != undefined && instruction.argument != undefined)
            {
                stringBytecode += (' '.repeat(maxInstructionLen - (instruction.type + ' ' + instruction.argument).length) + `// ${instruction.comment}`)
            }

            else if (instruction.comment != undefined && instruction.argument == undefined)
            {
                stringBytecode += (' '.repeat(maxInstructionLen - (instruction.type).length) + ` // ${instruction.comment}`)
            };

            stringBytecode += '\n';
        };

        stringBytecode += '  end;\n'

        return stringBytecode;
    };

    generateStatement = (Statement: Stmt): void =>
    {
        switch (Statement.type)
        {
            case 'ExpressionStatement':
            {
                generateExpressionStatement(this, Statement);
                break;
            };

            case 'DeclerationStatement':
            {
                generateDeclerationStatement(this, Statement);
                break;
            };
            
            case 'IfStatement':
            {
                generateIfStatement(this, Statement);
                break;
            };
        };
    };

    generateBytecode = (): void =>
    {
        for (const statement of this.parser.ast.body) 
        {
            this.generateStatement(statement);
        };
    };
};