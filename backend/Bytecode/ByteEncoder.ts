// deno-lint-ignore-file
import { Parser } from "../Parser/Parser.ts";
import { ExpressionStatementGenerator } from "./ExpressionStatement.ts"
import
{
    NodeType,

    Program,
    Statement,

    MethodType,
    Flags,
} from "../shared.ts";


export class ByteEncoder
{
    filename: string;
    source: string;
    flags: Flags

    parser: Parser;
    ast: Program;

    bytecode: number[];


    constructor(flags: Flags, source: string, filename : string)
    {
        this.filename = filename == undefined ? 'shell' : filename;
        this.source = source;
        this.flags = flags,
        this.parser = new Parser(this.flags, source, this.filename);
        this.ast = this.parser.ast;

        this.bytecode = this.generateProgram(this.ast);

        for (let i = 0; i < this.bytecode.length; i++)
        {
            const byte = this.bytecode[i];
            if (byte > 255)
            {
                console.log(this.bytecode);
                console.error(`FATAL ERROR: Byte size overflow -> byte $${byte.toString(16)} at position ${i}`);
                Deno.exit(1);
            };
        };

        if (!this.flags.shellMode)
        {
            this.writeToFile();
        };
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

    writeToFile = () => 
    {
        const encoded = [];

        for (let i = 0; i < this.bytecode.length; i++)
        {
            const byte = this.bytecode[i];
            encoded.push(String.fromCharCode(byte))
        };

        const encoder = new TextEncoder();
        const data = encoder.encode(encoded.join());
        
        Deno.writeFileSync(`./${this.filename.split('.')[0]}.fo`, data);
    };
};

// TESTING PURPOSES

// const test = new ByteEncoder({warnings: true, strictWarnings: true,} as Flags, '256;', 'tst');
// console.log(test.bytecode); 