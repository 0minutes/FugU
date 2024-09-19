
import
{
    Global,
    Statement,
    EmptyStatement,
    ExpressionStatement,
} from './NodeTypes.ts';

import
{
    parseExpression,
} from './Expressions.ts'

import
{
    Lexer,
} from '../Lexer/Lexer.ts'

import
{
    Token,
    TokenType,
} from '../Lexer/TokenTypes.ts';

import
{
    error,
} from '../Errors/Errors.ts';


export class Parser
{
    filename: string;
    source: string;

    Lexer: Lexer;
    tokens: Token[];

    ast: Global;

    constructor(filename: string, source: string)
    {
        this.filename = filename;
        this.source = source;

        this.Lexer = new Lexer(filename, source);
        this.tokens = this.Lexer.tokens;

        this.ast = this.parseGlobal();
    };

    peek = (): Token =>
    {
        if (this.at().type == TokenType.eof)
        {
            return this.at();
        }

        return this.tokens[1];
    };

    at = (): Token => 
    {
        return this.tokens[0];
    };

    eat = (): Token =>
    {   
        return this.tokens.shift()!;
    };


    expect = (expectedType: TokenType, eat: boolean, message: string, under?: string): Token =>
    {
        const token = eat ? this.eat() : this.at();

        if (token.type != expectedType)
        {
            new error(
                'Syntax Error',
                message,
                this.source,
                token.where,
                under
            );
        };

        return token;
    };

    expectMultiple = (expectedTypes: TokenType[], eat: boolean, message: string, under?: string): Token =>
    {
        const token = eat ? this.eat() : this.at();

        if (!(expectedTypes.includes(token.type)))
        {
            new error(
                'Syntax Error',
                message,
                this.source,
                token.where,
                under
            );
        };

        return token;
    };

    parseStatement = (): Statement =>
    {
        const token: Token = this.at();

        switch (token.type)
        {
            case TokenType.semicolon:
            {
                const token = this.eat();

                return {
                    type: 'EmptyStatement',
                    where: [token.where.line, token.where.start, token.where.end]
                } as EmptyStatement;
            };

            default:
            {
                const ExprStatement: ExpressionStatement = 
                {
                    type: 'ExpressionStatement',
                    body: [],
                    where: [],
                };

                ExprStatement.body.push(parseExpression(this, 0));

                ExprStatement.where = [ExprStatement.body[0].where[0], ExprStatement.body[0].where[1], ExprStatement.body[0].where[2]];

                this.expect(
                    TokenType.semicolon,
                    true,
                    `Unexpectedly got the '${this.at().value}' (${this.at().type}) token. Expected a semicolon at the end of a statement`,
                    ';'
                );

                return ExprStatement;
            };
        };
    };

    parseGlobal = (): Global =>
    {   
        const GlobalProgram: Global =
        {
            type: 'Global',
            file: this.filename,
            body: [],
            where: [this.tokens.at(-1)!.where.line, this.tokens[0].where.start, this.tokens.at(-1)!.where.end] //line, first char pos, last char pos
        };

        while (this.at().type != TokenType.eof)
        {
            const statement: Statement = this.parseStatement();

            if (statement.type != 'EmptyStatement')
            {
                GlobalProgram.body.push(statement);
            };
        };

        return GlobalProgram;
    };
};