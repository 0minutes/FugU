
import
{
    Global,
    Statement,
    EmptyStatement,
    ExpressionStatement,
    Expression,
    BinaryExpression,
    UnaryExpression,
    UnaryUpdateExpression,
    Literal,
    Identifier,
} from './NodeTypes.ts';

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
    makePosition,
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

    expect = (expectedType: TokenType, eat: boolean, message: string): void =>
    {
        const token = eat ? this.eat() : this.at();

        if (token.type != expectedType)
        {
            new error(
                'Syntax Error',
                message,
                this.source,
                makePosition(this.filename, token.where.line, token.where.start, token.where.end)
            );
        };
    };

    parseLiteral = (): Literal | Identifier =>
    {
        const token = this.eat();

        switch (token.type)
        {
            case TokenType.int:
            {
                return {
                    type: 'Literal',
                    realType: 'IntegerLiteral',
                    value: BigInt(token.value),
                    where: [token.where.line, token.where.start, token.where.end],
                };
            };

            case TokenType.bool:
            {
                return {
                    type: 'Literal',
                    realType: 'IntegerLiteral',
                    value: token.value == 'true' ? 1n : 0n,
                    where: [token.where.line, token.where.start, token.where.end],
                };
            };

            case TokenType.float:
            {
                return {
                    type: 'Literal',
                    realType: 'FloatLiteral',
                    value: parseFloat(token.value),
                    where: [token.where.line, token.where.start, token.where.end],
                };
            };

            case TokenType.char:
            {
                return {
                    type: 'Literal',
                    realType: 'CharLiteral',
                    value: token.value,
                    where: [token.where.line, token.where.start, token.where.end],
                };
            };

            case TokenType.str:
            {
                return {
                    type: 'Literal',
                    realType: 'StringLiteral',
                    value: token.value,
                    where: [token.where.line, token.where.start, token.where.end],
                };
            };

            case TokenType.null:
            {
                return {
                    type: 'Literal',
                    realType: 'NullLiteral',
                    value: token.value,
                    where: [token.where.line, token.where.start, token.where.end],
                };
            };

            case TokenType.identifier:
            {
                return {
                    type: 'Identifier',
                    value: token.value,
                    where: [token.where.line, token.where.start, token.where.end],
                };
            }

            default:
            {
                new error(
                    'Syntax Error',
                    `Unexpectedly got the '${token.value}' (${token.type}) token. Expected a Literal such as a string number or an Expression such as 1 + 1 etc`,
                    this.source,
                    makePosition(this.filename, token.where.line, token.where.start, token.where.end)
                );
            };
        };

        return {} as Literal;
    };

    parseBracketsExpr = (): Expression =>
    {
        const token = this.at();

        if (token.type == TokenType.leftParenthesis)
        {
            this.eat();

            if (this.at().type == TokenType.rightParenthesis)
            {
                new error(
                    'Syntax Error',
                    'Expected an expression inside the Parenthesis',
                    this.source,
                    makePosition(this.filename, this.at().where.line, this.at().where.start, this.at().where.end)
                );
            };

            const expression = this.parseExpression();

            this.expect(
            TokenType.rightParenthesis,
            true,
            `Expected a closing parenthesis inside after the expression but instead got '${this.at().value}' (${this.at().type})`
            );

            return expression;
        };

        return this.parseLiteral();
    };

    parseUnaryUpdateExpr = (): Expression =>
    {
        const token = this.at();

        while (['++', '--'].includes(token.value))
        {
            const operand = this.eat().value;
            const rhs = this.parseBracketsExpr();
            const prefix = true;

            return {
                type: 'UnaryUpdateExpression',
                operand: operand,
                prefix: prefix,
                right: rhs,
                where: [rhs.where[0], rhs.where[1], rhs.where[2]],
            } as UnaryUpdateExpression;
        };

        const rhs = this.parseBracketsExpr();

        while (['++', '--'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const prefix = false;
            return {
                type: 'UnaryUpdateExpression',
                operand: operand,
                prefix: prefix,
                right: rhs,
                where: [rhs.where[0], rhs.where[1], rhs.where[2]],
            } as UnaryUpdateExpression;
        };

        return rhs;
    };

    parseUnaryExpr = (): Expression =>
    {
        const token = this.at();

        while (['+', '-'].includes(token.value))
        {
            const operand = this.eat().value;
            const rhs = this.parseLogicalOrExpr();

            return {
                type: 'UnaryExpression',
                operand: operand,
                right: rhs,
                where: [rhs.where[0], rhs.where[1], rhs.where[2]],
            } as UnaryExpression;
        };

        return this.parseUnaryUpdateExpr();
    };

    parseNotExpr = (): Expression =>
    {
        const token = this.at();

        while (['!'].includes(token.value))
        {
            const operand = this.eat().value;
            const rhs = this.parseLogicalOrExpr();

            return {
                type: 'UnaryExpression',
                operand: operand,
                right: rhs,
                where: [rhs.where[0], rhs.where[1], rhs.where[2]],
            } as UnaryExpression;
        };

        return this.parseUnaryExpr();
    };

    parseBitwiseNotExpr = (): Expression =>
    {
        let lhs = this.parseNotExpr();

        while (['~'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs = this.parseNotExpr();
            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [lhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseMulplicativeExpr = (): Expression =>
    {
        let lhs = this.parseBitwiseNotExpr();
        
        while (['/', '*', '%'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs = this.parseBitwiseNotExpr();
            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [lhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseAdditiveExpr = (): Expression =>
    {
        let lhs = this.parseMulplicativeExpr();

        while (['-', '+'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs = this.parseMulplicativeExpr();
            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [lhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseBitwiseExpr = (): Expression =>
    {
        let lhs = this.parseAdditiveExpr();
        while (['<<', '>>'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs = this.parseAdditiveExpr();
            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [lhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseRationalExpr = (): Expression =>
    {
        let lhs = this.parseBitwiseExpr();
        while (['<', '>', '<=', '>='].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs = this.parseBitwiseExpr();
            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [lhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseInExpr = (): Expression =>
    {
        let lhs = this.parseRationalExpr();
        while (['in'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs = this.parseRationalExpr();
            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [lhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseEqualityExpr = (): Expression =>
    {
        let lhs: Expression = this.parseInExpr();

        while (['==', '!=', '<>'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs: Expression = this.parseInExpr();

            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [rhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression
        }

        return lhs
    };

    parseBitwiseAndExpr = (): Expression =>
    {
        let lhs: Expression = this.parseEqualityExpr();

        while (['&'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs: Expression = this.parseEqualityExpr();

            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [rhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseBitwiseXorExpr = (): Expression =>
    {
        let lhs: Expression = this.parseBitwiseAndExpr();

        while (['^'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs: Expression = this.parseBitwiseAndExpr();

            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [rhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseBitwiseOrExpr = (): Expression =>
    {
        let lhs: Expression = this.parseBitwiseXorExpr();

        while (['|'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs: Expression = this.parseBitwiseXorExpr();

            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [rhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseLogicalAndExpr = (): Expression =>
    {
        let lhs: Expression = this.parseBitwiseOrExpr();

        while (['&&'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs: Expression = this.parseBitwiseOrExpr();

            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [rhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseLogicalOrExpr = (): Expression =>
    {
        let lhs: Expression = this.parseLogicalAndExpr();

        while (['||'].includes(this.at().value))
        {
            const operand = this.eat().value;
            const rhs: Expression = this.parseLogicalAndExpr();

            lhs = {
                type: 'BinaryExpression',
                left: lhs,
                operand: operand,
                right: rhs,
                where: [rhs.where[0], lhs.where[1], rhs.where[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseExpression = (): Expression =>
    {
        let Expr = {} as Expression

        const token: Token = this.at();

        switch(token.type)
        {
            default:
            {
                Expr = this.parseLogicalOrExpr();
                break;
            };
        };

        this.expect(
            TokenType.semicolon,
            true,
            `Unexpectedly got the '${this.at().value}' (${this.at().type}) token. Expected a semicolon at the end of a statement`
        );
        
        return Expr;
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

                ExprStatement.body.push(this.parseExpression());

                ExprStatement.where = [ExprStatement.body[0].where[0], ExprStatement.body[0].where[1], ExprStatement.body[0].where[2]];

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

            GlobalProgram.body.push(statement);
        };

        return GlobalProgram;
    };
};
