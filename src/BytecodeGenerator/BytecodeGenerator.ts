import 
{
    Parser
} from "../Parser/Parser";

import
{
    Global,
    Stmt,
} from "../Parser/GlobalNodes";

import
{
    Bytecode
} from "./Instructions";



export class BytecodeGenerator
{
    Bytecode: Bytecode;

    parser: Parser;
    ast: Global;

    filename: string;
    source: string;

    constructor(parser: Parser, filename: string, source: string)
    {
        this.parser = parser;
        this.ast = parser.ast;

        this.filename = filename;
        this.source = source;

        this.Bytecode = this.generateGlobal();
    };

    generateStatement = (Statement: Stmt): Bytecode =>
    {
        const Bytecode: Bytecode = [];

        switch (Statement.type)
        {
            case "ExpressionStatement":
            case "DeclerationStatement":
        };

        return Bytecode;
    };

    generateGlobal = (): Bytecode =>
    {
        const Bytecode: Bytecode = [];

        for (const statement of this.parser.ast.body) 
        {
            Bytecode.push(...this.generateStatement(statement));
        };

        return Bytecode;
    }
};