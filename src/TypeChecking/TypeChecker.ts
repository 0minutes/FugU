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
    Env
} from './Environment.ts'

import
{
    checkDeclerationStatements,
    checkExpressionStatement,
    checkIfStatements,
    checkProcStatement,
    checkReturnStatement,
} from './Statements.ts'

export class TypeChecker {
    parser: Parser;
    env: Env;

    warnings: number

    constructor(parser: Parser, env: Env)
    {
        this.parser = parser;
        this.env = env;
        this.warnings = 0;
    };

    checkStatement = (Statement: Stmt, env: Env): void =>
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
            }

            case 'ProcStatement':
            {
                checkProcStatement(this, Statement, env);
                break;
            };

            case 'ReturnStatement':
            {
                console.log(1)
                checkReturnStatement(this, Statement, env);
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