// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars
import { Program, Statement, Expression, Node, Literal, EmptyStatement, Token, TokenType, SyntaxErr, ParserErr, makePosition, unaryChars, unaryBuilders} from './shared.ts';
import { Lexer } from './Lexer.ts';

export class Parser {
    filename: string;
    source: string;

    lexer: Lexer;
    tokens: Token[];

    constructor(source: string, filename?: string) {
        if (filename === undefined) {
            this.filename = 'shell';
        } else {
            this.filename = filename;
        };
        this.source = source;
        this.lexer = new Lexer(source, this.filename);
        this.tokens = this.lexer.tokenize();

    }

    at = (): Token => {
        return this.tokens[0];
    };
    
    eof = (): boolean => {
        return this.at().type == TokenType.eof;
    };

    eol = (): boolean => {
        return this.at().type == TokenType.eol;
    };
    
    next = (): any => {
        if (this.tokens.length >= 1) {
            return this.tokens[1];
        };
        return TokenType.eof;
    };

    eat = (): any => {
        if (this.tokens.length > 0) {
            return this.tokens.shift();
        } else {
            return TokenType.eof;
        };
        
    };


    parseNode = (): Node | Expression => {
        let token = this.eat();

        switch (token.type) {
            case TokenType.integer:
                return {
                    type: 'integer',
                    value: token.value,
                    range: [token.loc.start, token.loc.end]
                } as Node;

                case TokenType.float:
                    return {
                        type: 'float',
                        value: token.value,
                        range: [token.loc.start, token.loc.end]
                    } as Node;

            case TokenType.string:
                return {
                    type: 'string',
                    value: token.value,
                    range: [token.loc.start, token.loc.end]
                } as Node;

            case TokenType.bool:
                return {
                    type: 'boolean',
                    value: token.value,
                    range: [token.loc.start, token.loc.end]
                } as Node;

            case TokenType.oparen:
                if (this.at().type == TokenType.cparen) {
                    new SyntaxErr('Expected an expression inside the parenthesis', makePosition(this.filename, token.loc.line, token.loc.start, token.loc.end), this.source);
                };

                let value = this.parseExpression();

                if (this.at().type != TokenType.cparen) {
                    new SyntaxErr('Expected a closing parenthesis', makePosition(this.filename, token.loc.line, token.loc.start, token.loc.end), this.source);
                };
                this.eat();
                return value;

            default:
                console.log(token)
                new SyntaxErr(`Unexpected token: '${token.value}'.`, makePosition(this.filename, token.loc.line, token.loc.start, token.loc.end), this.source);
                return {} as Node; //Lie to compiler since it's asking for me to return Node but it exits if node isn't recognized
            };
    };

    parseBinaryExpr = (): Expression => {
        let lhs = this.parseNode();
        return lhs;
    };

    parseExpression = (): Expression => {
        let Expr: Expression = {
            type: 'Expression',
            body: [],
            range: [0,0],
        }
        
        switch (this.at().type) {
            default:
                Expr.body.push(this.parseBinaryExpr());
        }
        
        Expr.range = [Expr.body[0].range[0], Expr.body[Expr.body.length-1].range[1]];

        return Expr;
    };

    parseStatement = (): Statement => {
        let Stmt: Statement = {
            type: 'Statement',
            body: [],
            range: [0,0],
        }

        while (!this.eol()) {
            Stmt.body.push(this.parseExpression());
        };

        if (this.eol() && Stmt.body.length == 0) {
            let token = this.eat();
            return {
                type: 'EmptyStatement',
                body : [],
                range: [token.loc.start, token.loc.end]
            } as EmptyStatement;
        }
        else {
            this.eat();
        };

        Stmt.range = [Stmt.body[0].range[0], Stmt.body[Stmt.body.length-1].range[1]];

        return Stmt;
    };

    parse = (): Program => {
        let program: Program = {
            type: 'Program',
            body: [],
            range: [0, this.source.length],
        }

        if (this.eof()) {
            let token = this.eat();
            return {
                type: 'Program',
                body: [],
                range: [token.loc.start, token.loc.end],
            } as Program;
        }

        while (!this.eof()) {
            program.body.push(this.parseStatement());
        };
        
        program.range = [program.body[0].range[0], program.body[program.body.length-1].range[1]];
        
        return program;
    };
};