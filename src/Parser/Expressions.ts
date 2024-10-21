import
{
    makePosition,
    error,
} from "../Errors/Errors.ts";

import
{
    Token,
    TokenType,
} from "../Lexer/TokenTypes.ts";

import
{
    BinaryExpression,
    ElementAccessExpression,
    AssignmentExpression,
    UnaryExpression,
    UnaryUpdateExpression,
    
    Expr,
} from "./GlobalNodes.ts";

import
{
    Parser,
} from "./Parser.ts";

import 
{
    simpleType,
    intType,
    floatType,
    strType,
    arrayType,
    nullType,
} from './Types.ts'

const BindingPower = (operator: string): number =>
{

    switch (operator)
    {
        case '=':
        case '+=':
        case '-=':
        case '*=':
        case '/=':
        case '%=':
        case '<<=':
        case '>>=':
        case '&=':
        case '|=':
        case '^=':
        {
            return 2;
        };

        case '||': 
        {
            return 3;
        };

        case '&&': 
        case '|':
        {
            return 4;
        };

        case '^': 
        {
            return 5;
        };

        case '&': 
        {
            return 6;
        };

        case '==':
        case '!=':
        case '<>':
        case 'in': 
        {
            return 7;
        };

        case '>':
        case '<':
        case '>=':
        case '<=':
        {
            return 8;
        };

        case '<<':
        case '>>':
        {
            return 9;
        };

        case '+':
        case '-':
        {
            return 10;
        };

        case '*':
        case '/':
        case '%':
        {
            return 11;
        };

        case '**':
        {
            return 12;
        };

        case '!':
        case '~':
        case '++':
        case '--':
        {
            return 13;
        };

        default:
        {
            return -1;
        };
    };
};


export const parseExpression = (parser: Parser, precedence: number): Expr =>
{
    let lhs = nud(parser);

    while (BindingPower(parser.at().value) > precedence)
    {
        lhs = led(parser, lhs);
    };
    
    return lhs;
};

const led = (parser: Parser, lhs: Expr): Expr =>
{
    if (['++','--'].includes(parser.at().value))
    {
        const op = parser.eat();

        const operator = {
            kind: op.value,
            where: [op.where.line, op.where.start, op.where.end]
        };

        if (lhs.type != 'Identifier')
        {
            new error(
                'Syntax Error',
                `Expected an identifier instead of a ${lhs.type} before a UnaryUpdateExpression`,
                parser.source,
                makePosition(parser.filename, lhs.where[0], lhs.where[1], lhs.where[2]),
                'Identifier'
            );
        };

        return {
            type: 'UnaryUpdateExpression',
            foldable: false,
            operator: operator,
            prefix: false,
            right: lhs,
            where: [lhs.where[0], lhs.where[1], operator.where[2]]
        } as UnaryUpdateExpression;
    }

    else if (BindingPower(parser.at().value) == 2)
    {
        if (lhs.type != 'Identifier')
        {
            new error(
                'Syntax Error',
                `Expected an identifier instead of ${lhs.type}. Cannot assign a ${lhs.type} to an Expression`,
                parser.source,
                makePosition(parser.filename, lhs.where[0], lhs.where[1], lhs.where[2]),
                'Identifier'
            );
        };

        const op = parser.eat();

        const operator = {
            kind: op.value,
            where: [op.where.line, op.where.start, op.where.end]
        };
        
        const rhs = parseExpression(parser, BindingPower(operator.kind));
        
        return {
            type: "AssignmentExpression",
            left: lhs,
            operator: operator,
            right: rhs,
            where: [lhs.where[0], lhs.where[1], rhs.where[2]]
        } as AssignmentExpression;
    }

    else
    {
        const op = parser.eat();

        const operator = {
            kind: op.value,
            where: [op.where.line, op.where.start, op.where.end]
        };

        const rhs = parseExpression(parser, BindingPower(operator.kind));
        
        return {
            type: "BinaryExpression",
            left: lhs,
            operator: operator,
            right: rhs,
            where: [lhs.where[0], lhs.where[1], rhs.where[2]]
        } as BinaryExpression;
    };
};

const nud = (parser: Parser): Expr =>
{
    const token = parser.eat();

    let lhs: Expr;

    if (['--', '++'].includes(token.value))
    {

        const operator = {
            kind: token.value,
            where: [token.where.line, token.where.start, token.where.end]
        };

        parser.expectMultiple(
            [TokenType.identifier, TokenType.leftParenthesis],
            false,
            'Expected an identifier after a UnaryExpression',
            'Identifier'
        );

        const ident = nud(parser);

        if (ident.type != 'Identifier')
        {
            new error(
                'Syntax Error',
                `Expected an identifier instead of a ${ident.type} after a UnaryExpression`,
                parser.source,
                makePosition(parser.filename, ident.where[0], ident.where[1], ident.where[2]),
                'Identifier'
            );
        };

        lhs = {
            type: 'UnaryUpdateExpression',
            foldable: false,
            operator: operator,
            prefix: true,
            right: ident,
            where: [token.where.line, token.where.start, ident.where[2]]
        } as UnaryUpdateExpression;
    }

    else if (['~', '!', '-', '+'].includes(token.value))
    {
        const operator = {
            kind: token.value,
            where: [token.where.line, token.where.start, token.where.end]
        };
        
        const expr = parseExpression(parser, BindingPower(token.value));

        lhs = {
            type: 'UnaryExpression',
            operator: operator,
            right: expr,
            where: [token.where.line, token.where.start, expr.where[2]]
        } as UnaryExpression;
    }

    else
    {
        lhs = parseLiteral(parser, token);
    };

    return lhs;
};

export const parseLiteral = (parser: Parser, token: Token): Expr =>
{
    let lhs: Expr;

    if (token.type == TokenType.int)
    {
        lhs = {
            type: 'Literal',
            kind: 'IntegerLiteral',
            value: BigInt(token.value),
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.bool)
    {
        lhs = {
            type: 'Literal',
            kind: 'IntegerLiteral',
            value: token.value == 'TRUE' ? 1n : 0n,
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.float)
    {
        lhs = {
            type: 'Literal',
            kind: 'FloatLiteral',
            value: parseFloat(token.value),
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.str)
    {
        lhs = {
            type: 'Literal',
            kind: 'StringLiteral',
            value: token.value,
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.null)
    {
        lhs = {
            type: 'Literal',
            kind: 'NullLiteral',
            value: token.value,
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.identifier)
    {
        lhs = {
            type: 'Identifier',
            value: token.value,
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.leftBrace)
    {

        const expressions: Expr[] = [];

        lhs = {
            type: 'ArrayLiteralExpression',
            elements: expressions,
            where: []
        };

        if (parser.at().type == TokenType.rightBrace)
        {
            lhs = {
                type: 'ArrayLiteralExpression',
                elements: expressions,
                where: [token.where.line, token.where.start, parser.eat().where.end]
            };
        }
        
        else
        {
            expressions.push(parseExpression(parser, 2));

            while (parser.at().type == TokenType.comma)
            {
                parser.eat();
                expressions.push(parseExpression(parser, 2));
            };


            const rightBrace = parser.expect(
                TokenType.rightBrace,
                true,
                `Expected a '}' instead of '${parser.at().value}' to end the array`,
                '}'
            );

            lhs = {
                type: 'ArrayLiteralExpression',
                elements: expressions,
                where: [token.where.line, token.where.start, rightBrace.where.end]
            };
        };
    }

    else if (token.type == TokenType.leftParenthesis)
    {
        if (parser.at().type == TokenType.rightParenthesis)
        {
            new error(
                'Syntax Error',
                'Expected an expression inside the Parenthesis',
                parser.source,
                parser.at().where,
                'Expression'
            );
        };

        lhs = parseExpression(parser, 0);

        parser.expect(
            TokenType.rightParenthesis,
            true,
            `Expected a closing parenthesis inside after the expression but instead got '${parser.at().value}' (${parser.at().type})`,
            ')'
        );
    }

    else
    {
        new error(
            'Syntax Error',
            `Unexpectedly got the '${token.value}' (${token.type}) token. Expected a Literal such as a string number or an Expression such as 1 + 1 etc`,
            parser.source,
            token.where,
            'Expression'
        );

        lhs = {} as Expr;
    };

    while (parser.at().type == TokenType.leftBracket)
    {
        parser.eat();

        const argument = parseExpression(parser, 2);

        const rightBracket = parser.expect(
            TokenType.rightBracket,
            true,
            `Expected a ']' (${TokenType.rightBracket}) instead of '${parser.at().value}' (${parser.at().type})`,
            ']'
        );

        lhs = {
            type: 'ElementAccessExpression',
            left: lhs,
            index: argument,
            where: [lhs.where[0], lhs.where[1], rightBracket.where.end],
        } as ElementAccessExpression;
    };
    
    return lhs;
}

export const parseType = (parser: Parser): simpleType => 
{
    const token = parser.expectMultiple(
        [
            TokenType.intDef,
        
            TokenType.floatDef,

            TokenType.strDef,

            TokenType.nullDef,
        ],
        true,
        'Expected a valid type definition',
        'Valid Type'
    );

    let simpleType: simpleType;

    switch (token.type)
    {
        case TokenType.floatDef:
        {
            simpleType = {
                kind: 'float',
                where: [token.where.line, token.where.start, token.where.end]
            } as floatType;
            
            break;
        };
        case TokenType.strDef:
        {
            simpleType = {
                kind: 'str',
                where: [token.where.line, token.where.start, token.where.end]
            } as strType;

            break;
        };

        case TokenType.intDef:
        {
            simpleType = {
                kind: 'int',
                where: [token.where.line, token.where.start, token.where.end]
            } as intType;

            break;
        };

        default:
        {
            simpleType = {
                kind: 'null',
                where: [token.where.line, token.where.start, token.where.end]
            } as nullType;
        };
    };

    while (parser.at().type == TokenType.leftBracket)
    {
        const leftBracket = parser.eat();

        const rightBracket = parser.expect(
            TokenType.rightBracket,
            true,
            `Expected a ']' (${TokenType.rightBracket}) instead of '${parser.at().value}' (${parser.at().type})`,
            ']'
        );

        simpleType = {
            kind: 'array',
            elementKind: simpleType,
            where: [leftBracket.where.line, leftBracket.where.start, rightBracket.where.end],
        } as arrayType;
    };

    return simpleType;
};