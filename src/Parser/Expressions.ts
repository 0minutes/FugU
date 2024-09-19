import
{
    error
} from "../Errors/Errors.ts";

import
{
    TokenType
} from "../Lexer/TokenTypes.ts";

import
{
    BinaryExpression,
    Expression,
    Literal,
    UnaryExpression,
    UnaryUpdateExpression,

} from "./NodeTypes.ts";
import { Parser } from "./Parser.ts";

const BindingPower = (operator: string): number => {
    switch (operator) {
        case '||': return 1;

        case '&&': 
        case '|':
        {
        
            return 2;
        };

        case '^': 
        {
            return 3;
        };

        case '&': 
        {
            return 4;
        };

        case '==':
        case '!=':
        case '<>':
        case 'in': 
        {
            return 5;
        };

        case '>':
        case '<':
        case '>=':
        case '<=':
        {
            return 6;
        };

        case '<<':
        case '>>':
        {
            return 7;
        };

        case '+':
        case '-':
        {
            return 8;
        };

        case '*':
        case '/':
        case '%':
        {
            return 9;
        };

        case '**':
        {
            return 10;
        };

        case '!':
        case '~':
        case '++':
        case '--':
        {
            return 11;
        };

        default:
        {
            return -1;
        };
    };
};


export const parseExpression = (parser: Parser, precedence: number): Expression =>
{
    let lhs = nud(parser);

    while (BindingPower(parser.at().value) > precedence)
    {
        lhs = led(parser, lhs);
    };
    
    return lhs;
};

const led = (parser: Parser, lhs: Expression): Expression =>
{
    if (['++','--'].includes(parser.at().value))
    {
        const operator = parser.eat();

        return {
            type: 'UnaryUpdateExpression',
            operator: operator.value,
            prefix: false,
            right: lhs,
            where: [lhs.where[0], lhs.where[1], operator.where.end]
        } as UnaryUpdateExpression;
    };

    const operator = parser.eat();
    const rhs = parseExpression(parser, BindingPower(operator.value));
    
    return {
        type: "BinaryExpression",
        left: lhs,
        operator: operator.value,
        right: rhs,
        where: [lhs.where[0], lhs.where[1], rhs.where[2]]
    } as BinaryExpression;
};

const nud = (parser: Parser): Expression =>
{
    const token = parser.eat();

    let lhs: Expression;

    if (['--', '++'].includes(token.value))
    {
        const op = token;

        parser.expectMultiple(
            [TokenType.identifier, TokenType.leftParenthesis],
            false,
            'Expected an identifier after a unary expression',
            'Identifier'
        );

        const ident = nud(parser);

        lhs = {
            type: 'UnaryUpdateExpression',
            operator: op.value,
            prefix: true,
            right: ident,
            where: [op.where.line, op.where.start, ident.where[2]]
        } as UnaryUpdateExpression;
    }


    else if (['~', '!', '-', '+'].includes(token.value))
    {
        const op = token;
        
        const expr = parseExpression(parser, 0);

        lhs = {
            type: 'UnaryExpression',
            operator: op.value,
            right: expr,
            where: [op.where.line, op.where.start, expr.where[2]]
        } as UnaryExpression;
    }

    else if (token.type == TokenType.int)
    {
        lhs = {
            type: 'Literal',
            //@ts-ignore <Literal is an expression>
            realType: 'IntegerLiteral',
            value: BigInt(token.value),
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.bool)
    {
        lhs = {
            type: 'Literal',
            //@ts-ignore <Literal is an expression>
            realType: 'IntegerLiteral',
            value: token.value == 'true' ? 1n : 0n,
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.float)
    {
        lhs = {
            type: 'Literal',
            //@ts-ignore <Literal is an expression>
            realType: 'FloatLiteral',
            value: parseFloat(token.value),
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.char)
    {
        lhs = {
            type: 'Literal',
            //@ts-ignore <Literal is an expression>
            realType: 'CharLiteral',
            value: token.value,
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.str)
    {
        lhs = {
            type: 'Literal',
            //@ts-ignore <Literal is an expression>
            realType: 'StringLiteral',
            value: token.value,
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.null)
    {
        lhs = {
            type: 'Literal',
            //@ts-ignore <Literal is an expression>
            realType: 'NullLiteral',
            value: token.value,
            where: [token.where.line, token.where.start, token.where.end],
        };
    }

    else if (token.type == TokenType.identifier)
    {
        lhs = {
            type: 'Identifier',
            //@ts-ignore <Literal is an expression>
            value: token.value,
            where: [token.where.line, token.where.start, token.where.end],
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
            'Literal'
        );

        lhs = {} as Literal;
    };

    return lhs;
};