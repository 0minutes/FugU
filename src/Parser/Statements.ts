import 
{
    Parser
} from './Parser.ts';

import
{
    ExpressionStatement,
    DeclerationStatement,
    Identifier,
    Expr,
    Stmt,
    IfStatement,
} from './GlobalNodes.ts';

import 
{
    parseExpression,
    parseLiteral,

    parseType,
} from './Expressions.ts';

import
{
    TokenType,
} from '../Lexer/TokenTypes.ts';

import
{
    error,
    makePosition,
} from '../Errors/Errors.ts'

import
{
    simpleType,
} from './Types.ts';

const formatValues = (items: Identifier[]): string =>
{
    const values = items.map(item => item.value);
    
    if (values.length == 0) return '';
    if (values.length == 1) return values[0];
    
    const lastValue = values.pop();

    return values.length ? `${values.join(', ')} and ${lastValue}` : lastValue || '';
};

export const parseIfStatement = (parser: Parser) =>
{
    const iftoken = parser.eat();

    parser.expect(
        TokenType.leftParenthesis,
        true,
        `Expected a '(' (${TokenType.leftParenthesis}) to specify the condition of the ${iftoken.value} statement`,
        '('
    );

    const condition: Expr = parseExpression(parser, 2);

    parser.expect(
        TokenType.rightParenthesis,
        true,
        `Expected a ')' (${TokenType.rightParenthesis}) to specify the end of condition of the ${iftoken.value} statement`,
        ')'
    );

    parser.expect(
        TokenType.leftBrace,
        true,
        `Expected a '{' (${TokenType.leftBrace}) for the block body of the ${iftoken.value} statement`,
        '{'
    );

    const body: Stmt[] = [];

    while (parser.at().type != TokenType.rightBrace)
    {
        if (parser.at().value == 'EOF')
        {
            new error(
                'Syntax Error',
                `Expected to get a '}' (${TokenType.rightBrace}) to end the block body of the ${iftoken.value} statement`,
                parser.source,
                parser.at().where,
                '}'
            );
        };

        body.push(parser.parseStatement());
    };

    parser.eat();

    parser.expectMultiple(
        [
            TokenType.semicolon,
            TokenType.elif,
            TokenType.else
        ],
        false,
        `Expected one of the following: ';' 'elif' or 'else' instead of ${parser.at().value} (${parser.at().type})`,
        `; or else or elif`
    );

    if (parser.at().type == TokenType.semicolon)
    {
        return {
            type: 'IfStatement',
            condition: condition,
            body: body,
            alternate: undefined,
            where: [iftoken.where.line, iftoken.where.start, parser.eat().where.end]
        };
    }

    else if (parser.at().type == TokenType.elif)
    {

        //@ts-ignore <The function is expecting an if statement since we are at elif>
        const alternate: IfStatement = parseIfStatement(parser);

        return {
            type: 'IfStatement',
            condition: condition,
            body: body,
            alternate: alternate,
            where: [iftoken.where.line, iftoken.where.start, alternate.where[2]]
        }; 
    }

    else
    {
        const elsetoken = parser.eat();

        parser.eat();

        const elsebody: Stmt[] = [];

        while (parser.at().type != TokenType.rightBrace)
        {
            if (parser.at().value == 'EOF')
            {
                new error(
                    'Syntax Error',
                    `Expected to get a '}' (${TokenType.rightBrace}) to end the block body of the ${elsetoken.value} statement`,
                    parser.source,
                    parser.at().where,
                    '}'
                );
            };
    
            elsebody.push(parser.parseStatement());
        };
    
        const rbrace = parser.eat();

        parser.expect(
            TokenType.semicolon,
            true,
            `Unexpectedly got the '${parser.at().value}' (${parser.at().type}) token. Expected a semicolon at the end of the Statement`,
            ';'
        );

        return {
            type: 'IfStatement',
            condition: condition,
            body: body,
            alternate: {
                type: 'ElseStatement',
                body: elsebody,
                where: [elsetoken.where.line, elsetoken.where.start, rbrace.where.end]
            },
            where: [iftoken.where.line, iftoken.where.start, rbrace.where.end]
        } as IfStatement;
    };
};

export const parseDeclarationStatement = (parser: Parser): DeclerationStatement =>
{
    const mut = parser.eat();

    let DeclStatement: DeclerationStatement = 
    {
        type: 'DeclerationStatement',
        simpleType: {} as simpleType,
        mut: false,
        variables: [],
        init: {} as Expr,
        where: [],
    };
        
    const variables: Identifier[] = [];
    
    while (true)
    {
        parser.expect(
            TokenType.identifier,
            false,
            `Expected an identifier instead of the '${parser.at().value}' (${parser.at().type}) token`,
            'Identifier'
        );

        //@ts-ignore <Identifier is an expression>
        const ident: Identifier = parseLiteral(parser, parser.at());

        if (ident.type != 'Identifier')
        {
            new error(
                'Syntax Error',
                `Expected an identifier instead of a ${ident.type} token`,
                parser.source,
                makePosition(parser.filename, parser.at().where.line, parser.at().where.start, parser.at().where.end),
                'Identifier'
            );
        };

        parser.eat();
        
        variables.push(ident);
        
        if (parser.at().value == ',')
        {
            parser.eat();
            continue;
        }
        else
        {
            break;
        };
    }

    parser.expect(
        TokenType.colon,
        true,
        `Expected a ':' (${TokenType.colon}) to specify a type after the Identifier instead of ${parser.at().type}`,
        ':'
    );

    const typedef: simpleType = parseType(parser);
    
    if (parser.at().type == TokenType.semicolon && mut.value == 'mut')
    {
        const initializer = undefined;

        const where = [mut.where.line, mut.where.start, parser.at().where.end];

        DeclStatement = {
            type: 'DeclerationStatement',
            mut: mut.value == 'mut' ? true : false,
            simpleType: typedef,
            variables: variables,
            init: initializer,
            where: where,
        };

        parser.eat();

        return DeclStatement;
    }
    
    else if (parser.at().type == TokenType.semicolon && mut.value == 'const')
    {
        new error(
            'Syntax Error',
            `Expected an initializer after a const decleration to specify ${formatValues(variables)}'s value`,
            parser.source,
            makePosition(parser.filename, mut.where.line, parser.at().where.start, parser.at().where.end),
            '='
        );
    };

    parser.expect(
        TokenType.AssignmentOperator,
        true,
        `Expected an '=' (${TokenType.AssignmentOperator}) operator to specify ${formatValues(variables)}'s value`,
        '='
    );

    const initializer = parseExpression(parser, 2);

    DeclStatement = {
        type: 'DeclerationStatement',
        mut: mut.value == 'mut' ? true : false,
        simpleType: typedef,
        variables: variables,
        init: initializer,
        where: [mut.where.line, mut.where.start, initializer.where[2]],
    } as DeclerationStatement;

    parser.expect(
        TokenType.semicolon,
        true,
        `Unexpectedly got the '${parser.at().value}' (${parser.at().type}) token. Expected a semicolon at the end of the Statement`,
        ';'
    );

    return DeclStatement;
};

export const parseExpressionStatement = (parser: Parser): ExpressionStatement =>
{
    const ExprStatement: ExpressionStatement = 
    {
        type: 'ExpressionStatement',
        body: {} as Expr,
        where: [],
    };

    ExprStatement.body = parseExpression(parser, 0);

    ExprStatement.where = [ExprStatement.body.where[0], ExprStatement.body.where[1], ExprStatement.body.where[2]];

    parser.expect(
        TokenType.semicolon,
        true,
        `Unexpectedly got the '${parser.at().value}' (${parser.at().type}) token. Expected a semicolon at the end of the Statement`,
        ';'
    );

    return ExprStatement;
};
