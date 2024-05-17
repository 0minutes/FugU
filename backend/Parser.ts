// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars
import { Lexer } from './Lexer.ts';
import { Identifier } from './shared.ts';
import {
    Program,
    Statement,
    Expression,
    unaryOperators,
    Token,
    TokenType,
    SyntaxErr,
    expected,
    makePosition,
    ExpressionStatement,
    EmptyStatement,
    BinaryExpression,
    UnaryUpdateExpression,
    Literal,
    unaryUpdaters,

} from './shared.ts';   

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


    parseLiteralNode = (prevToken?: TokenType): Expression | Literal => {
        let token = this.eat();

        switch (token.type) {
            case TokenType.integer: {
                return {
                    type: TokenType.integer,
                    value: token.value,
                    range: [token.loc.start, token.loc.end]
                } as Literal;
            };

            case TokenType.float: {
                return {
                    type: TokenType.float,
                    value: token.value,
                    range: [token.loc.start, token.loc.end]
                } as Literal;
            }

            case TokenType.string: {
                return {
                    type: TokenType.string,
                    value: token.value,
                    range: [token.loc.start, token.loc.end]
                } as Literal;
            };

            case TokenType.bool: {
                return {
                    type: TokenType.bool,
                    value: token.value,
                    range: [token.loc.start, token.loc.end]
                } as Literal;
            };

            case TokenType.null: {
                return {
                    type: TokenType.null,
                    value: token.value,
                    range: [token.loc.start, token.loc.end]
                } as Literal;
            };

            case TokenType.oparen: {
                if (this.at().type == TokenType.cparen) {
                    new SyntaxErr('Expected an expression inside the parenthesis', makePosition(this.filename, token.loc.line, token.loc.start, token.loc.end), this.source);
                };

                let value = this.parseAdditiveExpr(TokenType.oparen);

                if (this.at().type != TokenType.cparen) {
                    new SyntaxErr('Expected a closing parenthesis', makePosition(this.filename, token.loc.line, token.loc.start, token.loc.end), this.source);
                };
                this.eat();
                return value;
            };

            case TokenType.identifier: {
                return {
                    type: TokenType.identifier,
                    value: token.value,
                    range: [token.loc.start, token.loc.end]
                } as Identifier;
            };

            default: {
                if (prevToken) {
                    new SyntaxErr(`Unexpected ${token.type} token: '${token.value}'. Expected ${expected(prevToken)}`, makePosition(this.filename, token.loc.line, token.loc.start, token.loc.end), this.source);
                };

                new SyntaxErr(`Unexpected ${token.type} token: '${token.value}'.`, makePosition(this.filename, token.loc.line, token.loc.start, token.loc.end), this.source);
                return {} as Literal; //Lie to compiler since it's asking for me to return Expression but i do, otherwise exit
            };
        };
    };
    
    parseUnaryUpdateExpression = (prev?: TokenType): Literal | UnaryUpdateExpression | Expression => {
        let token = this.at();
        let lhs; //lie to compiler since it's asking for me to return Expression even if i do it

        if (token.value in unaryUpdaters) {
            let operator = this.eat();
            let lhs = this.parseLiteralNode(operator.type);
            lhs = {
                type: 'UnaryUpdateExpression',
                operator: operator.value,
                prefix: true,
                argument: lhs,
                range: [token.loc.start, lhs.range[1]],
            } as UnaryUpdateExpression;
            
            return lhs;
        }

        else if (token.type == TokenType.identifier) {
            let lhs = this.parseLiteralNode(token.type);
            if (this.at().value in unaryUpdaters) {
                let operator = this.eat();
                
                lhs = {
                    type: 'UnaryUpdateExpression',
                    operator: operator.value,
                    prefix: false,
                    argument: lhs,
                    range: [token.loc.start, lhs.range[1]],
                } as UnaryUpdateExpression;
            };
            
            return lhs;
        }

        else {
            lhs = this.parseLiteralNode(prev);
            return lhs;
        };
    };

    parseUnaryExpr = (prev?: TokenType): Literal | BinaryExpression | Expression => {
        let lhs = this.parseUnaryUpdateExpression(prev);
        while (this.at().value in unaryOperators) {
            let operator = this.eat();
            let rhs = this.parseUnaryUpdateExpression(operator.type);
            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operator: operator.value,
                right: rhs,
                range: [lhs.range[0], rhs.range[1]],

            } as BinaryExpression;
        };
        return lhs;
    };

    parseMultiplicationExpr = (prev?: TokenType): Literal | BinaryExpression | Expression => {
        let lhs = this.parseUnaryExpr(prev);
        while ('*/%'.includes(this.at().value)) {
            let operator = this.eat();
            let rhs = this.parseUnaryExpr(operator.type);
            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operator: operator.value,
                right: rhs,
                range: [lhs.range[0], rhs.range[1]],
            } as BinaryExpression;
        };
        return lhs;
    }

    parseAdditiveExpr = (prev?: TokenType): Literal | BinaryExpression | Expression => {
        let lhs = this.parseMultiplicationExpr(prev);
        while ('+-'.includes(this.at().value)) {
            let operator = this.eat();
            let rhs = this.parseMultiplicationExpr(operator.type);
            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operator: operator.value,
                right: rhs,
                range: [lhs.range[0], rhs.range[1]],
            } as BinaryExpression;
        };
        return lhs;
    };

    parseExpression = (): Expression => {
        let Expr = {} as Expression;
        let token = this.at();
        
        switch (token.type) {
            default: {
                Expr = this.parseAdditiveExpr();
                break;
            };
        };

        if (this.at().type == TokenType.eof) {
            return Expr;
        }
    
        else if (this.at().type == TokenType.eol) {
            this.eat();
            return Expr;
        }
        else {
            new SyntaxErr(`Expected an ${TokenType.eol} or ${TokenType.eol} but got: '${this.at().value}'`, makePosition(this.filename, this.at().loc.line, this.at().loc.start, this.at().loc.end), this.source);
        };
        return Expr; // Lie to compiler since it's asking for me to return Expression but i do, otherwise exit
    };

    parseStatement = (): Statement => {
        let Stmt = {} as Statement;
        let token = this.at();

        switch (token.type) {
            case TokenType.eol: {
                Stmt = {
                    type: 'EmptyStatement',
                    range: [token.loc.start, this.at().loc.end],
                } as EmptyStatement;
                
                this.eat();

                break;
            }
            default : {
                Stmt = {
                    type: 'ExpressionStatement',
                    body: [this.parseExpression()],
                    range: [0,0]
                } as ExpressionStatement;

                Stmt.range = [token.loc.start, Stmt.body[Stmt.body.length-1].range[1]];
                
                break;
            };
        };



        return Stmt
    };

    parse = (): Program => {
        let program: Program = {
            type: 'Program',
            body: [],
            range: [0, 0],
        } as Program;

        while (!this.eof()) {
            program.body.push(this.parseStatement());
        };

        program.range = [0, this.source.length];
        return program
    };
};