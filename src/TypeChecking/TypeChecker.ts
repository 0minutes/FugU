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
    checkDeclerationStatements,
    checkExpressionStatement,
    checkIfStatements,
} from './Statements.ts'

export class TypeChecker {
    parser: Parser;
    env: Environment;

    warnings: number

    constructor(parser: Parser, env: Environment)
    {
        this.parser = parser;
        this.env = env;
        this.warnings = 0;
    };

    checkStatement = (Statement: Stmt, env: Environment): void =>
    {
        switch (Statement.type)
        {
            case "ExpressionStatement":
            {
                checkExpressionStatement(this, Statement.body, env);
                break;
            };

            case 'IfStatement':
            {
                checkIfStatements(this, Statement, env);
                break;
            };

            case "DeclerationStatement":
            {
                checkDeclerationStatements(this, Statement, env);
                break;
            };
        };
    };

    checkGlobal = (): void =>
    {
        for (const statement of this.parser.ast.body) 
        {
            this.checkStatement(statement, this.env);
        };
    };
};