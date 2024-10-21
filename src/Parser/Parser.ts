
import
{
    Global,

    Stmt,

    EmptyStatement,
    DeclerationStatement,
    ExpressionStatement,
    type IfStatement,
} from './GlobalNodes.ts';

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

import
{
    parseExpressionStatement,
    parseDeclarationStatement,
    parseIfStatement,
} from './Statements.ts';


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

    parseStatement = (): Stmt =>
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

            case TokenType.mut:
            case TokenType.const:
            {

                const DeclStatement: DeclerationStatement = parseDeclarationStatement(this);

                return DeclStatement;
            };

            case TokenType.if:
            {
                // @ts-ignore <We are expecting an if statement since we are at tok if>
                const ifStatement: IfStatement = parseIfStatement(this);

                return ifStatement;
            };
            
            default:
            {
                const ExprStatement: ExpressionStatement = parseExpressionStatement(this);

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
            where: [this.tokens[this.tokens.length -1].where.line, this.tokens[0].where.start, this.tokens[this.tokens.length -1].where.end],
        };

        while (this.at().type != TokenType.eof)
        {
            const statement: Stmt = this.parseStatement();

            if (statement.type != 'EmptyStatement')
            {
                GlobalProgram.body.push(statement);
            };
        };

        return GlobalProgram;
    };
};