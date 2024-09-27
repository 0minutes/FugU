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
} from './Environment.ts'

import
{
    checkExpressionStatement,
    checkDeclerationStatement,
} from './Statements.ts'

export class TypeChecker
{
    parser: Parser;
    env: Environment;

    constructor (parser: Parser, env: Environment)
    {
        this.parser = parser;
        this.env = env;
    };

    checkStatement = (Statement: Stmt): void =>
    {
        switch (Statement.type)
        {
            case "ExpressionStatement":
            {
                checkExpressionStatement(this, Statement.body[0]);
                break
            }
            case "DeclerationStatement":
            {
                checkDeclerationStatement(this, Statement);
                break;
            };
        };
    };

    checkGlobal = (): void =>
    {
        for (const statement of this.parser.ast.body)
        {
            this.checkStatement(statement);
        };
    };
};