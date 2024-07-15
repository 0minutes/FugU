// deno-lint-ignore-file
import { Parser } from "../Parser/Parser.ts";
import { ExpressionStatementGenerator } from "./ExpressionStatement.ts"
import
{
    NodeType,

    Program,
    Statement,

    MethodType,
} from "../shared.ts";



export class ByteEncoder
{
    filename: string;
    source: string;

    parser: Parser;
    ast: Program;

    bytecode: number[];

    constructor(source: string, filename : string)
    {
        this.filename = filename == undefined ? 'shell' : filename;
        this.source = source;
        this.parser = new Parser(source, this.filename);
        this.ast = this.parser.ast;

        this.bytecode = this.generateProgram(this.ast);
    };

    generateProgram = (ast: Program): number[] =>
    {
        const Bytecode: number[] = [];

        for (let i = 0; i < ast.body.length; i++)
        {
            Bytecode.push(...this.generateStatement(ast.body[i]));
        };

        Bytecode.unshift(ast.body.length);
        Bytecode.unshift(MethodType.Program);

        return Bytecode;
    };

    generateStatement = (ast: Statement): number[] =>
    {
        const StatementBytecode: number[] = [];
        
        switch (ast.type)
        {
            case NodeType.ExpressionStatement:
            {
                const ExpressionStmtGenerator = new ExpressionStatementGenerator(this);
                StatementBytecode.push(MethodType.ExpressionStmt);
                StatementBytecode.push(...ExpressionStmtGenerator.generateExpression(ast.body[0]));
                break;
            };
        };

        return StatementBytecode;
    };

};

// TESTING PURPOSES

const test = new ByteEncoder('922337203685477580123123', 'tst');
console.log(test.bytecode); 