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
    Expression,
    AssignmentExpression,
    UnaryExpression,
    UnaryUpdateExpression,
    SequenceExpression,
    Expr,
} from "./NodeTypes.ts";

import
{
    Parser,
} from "./Parser.ts";


const BindingPower = (operator: string): number =>
{

    switch (operator)
    {
        case ',':
        {
            return 1;
        };

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

const led = (parser: Parser, lhs: Expression): Expr =>
{
    if (['++','--'].includes(parser.at().value))
    {
        const operator = parser.eat();

        if (lhs.type != 'Identifier')
        {
            new error(
                'Syntax Error',
                `Expected an identifier instead of a ${lhs.type} before a UnaryExpression`,
                parser.source,
                makePosition(parser.filename, lhs.where[0], lhs.where[1], lhs.where[2]),
                'Identifier'
            );
        };

        return {
            type: 'UnaryUpdateExpression',
            foldable: false,
            operator: operator.value,
            prefix: false,
            right: lhs,
            where: [lhs.where[0], lhs.where[1], operator.where.end]
        } as UnaryUpdateExpression;
    }

    else if (parser.at().value == ',')
    {
        const expressions: Expression[] = [lhs];
        let foldable = false;

        while(parser.at().value == ',')
        {
            parser.eat();
            expressions.push(parseExpression(parser, BindingPower(',')));  
        };

        for (const expression of expressions)
        {
            if (expression.foldable == true)
            {
                foldable = true;
            };
        };

        return {
            type: 'SequenceExpression',
            foldable: foldable,
            expressions: expressions,
            where: [lhs.where[0], lhs.where[1], expressions[expressions.length-1].where[2]],
        } as SequenceExpression;
    }

    else if (BindingPower(parser.at().value) == 1)
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

        const operator = parser.eat();
        const rhs = parseExpression(parser, BindingPower(operator.value));
        
        return {
            type: "AssignmentExpression",
            foldable: lhs.foldable && rhs.foldable,
            left: lhs,
            operator: operator.value,
            right: rhs,
            where: [lhs.where[0], lhs.where[1], rhs.where[2]]
        } as AssignmentExpression;
    }

    else
    {
        const operator = parser.eat();
        const rhs = parseExpression(parser, BindingPower(operator.value));
        
        return {
            type: "BinaryExpression",
            foldable: lhs.foldable && rhs.foldable,
            left: lhs,
            operator: operator.value,
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
        const op = token;

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
            operator: op.value,
            prefix: true,
            right: ident,
            where: [op.where.line, op.where.start, ident.where[2]]
        } as UnaryUpdateExpression;
    }

    else if (['~', '!', '-', '+'].includes(token.value))
    {
        const op = token;
        
        const expr = parseExpression(parser, BindingPower(op.value));

        lhs = {
            type: 'UnaryExpression',
            foldable: expr.foldable,
            operator: op.value,
            right: expr,
            where: [op.where.line, op.where.start, expr.where[2]]
        } as UnaryExpression;
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
            foldable: true,
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
            foldable: true,
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
            foldable: true,
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
            foldable: true,
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
            foldable: true,
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
            foldable: false,
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
            foldable: false,
            //@ts-ignore <Literal is an expression>
            value: token.value,
            where: [token.where.line, token.where.start, token.where.end],
        };
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

    return lhs;
};
