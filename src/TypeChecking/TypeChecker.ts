import {
Stmt
} from "../Parser/GlobalNodes.ts";

import {
Parser
} from "../Parser/Parser.ts";

import {
Environment
} from './Environment.ts'

import {
checkDeclerationStatements,
checkExpressionStatement,
} from './Statements.ts'

export class TypeChecker {
    parser: Parser;
    env: Environment;

    warnings: number

    constructor(parser: Parser, env: Environment) {
        this.parser = parser;
        this.env = env;
        this.warnings = 0;

        this.checkGlobal();
        
        if (this.warnings > 0)
        {
            Deno.exit();
        };
    };

    checkStatement = (Statement: Stmt): void => {
        switch (Statement.type) {
            case "ExpressionStatement":
                {
                    checkExpressionStatement(this, Statement.body);
                    break;
                };

            case "DeclerationStatement":
                {
                    checkDeclerationStatements(this, Statement);
                    break;
                };
        };
    };

    checkGlobal = (): void => {
        for (const statement of this.parser.ast.body) {
            this.checkStatement(statement);
        };
    };
};