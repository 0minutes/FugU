import 
{
    Global,
    Stmt,
} from '../Parser/NodeTypes.ts';

import 
{
    Parser
} from '../Parser/Parser.ts';

import
{
    checkDeclerationStatement,
} from './CheckStatements.ts';

import
{
    Environment,
} from './Environment.ts';

export class TypeChecker
{
    parser: Parser;
    ast: Global
    Env: Environment;

    constructor (Env: Environment, parser: Parser)
    {
        this.parser = parser;
        this.ast = this.parser.ast;

        this.Env = Env;
        
        this.checkGlobal();
    };

    checkStatement = (Statement: Stmt): void =>
    {
        switch (Statement.type)
        {
            case 'ExpressionStatement':
            {
                checkExpressionStatement(this, Statement);
                break;
            };

            case 'DeclerationStatement':
            {
                checkDeclerationStatement(this, Statement);
                break;
            };
        };
    };

    checkGlobal = (): void =>
    {
        for (const Statement of this.ast.body)
        {
            this.checkStatement(Statement);
        };
    };
};