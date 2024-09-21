import 
{
    Parser
} from './Parser.ts';

import
{
    ExpressionStatement,
    DeclerationStatement,
    Identifier,
    Expression,
} from './NodeTypes.ts';

import 
{
    parseExpression,
    parseLiteral,
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

export const parseDeclarationStatement = (parser: Parser): DeclerationStatement =>
{
    const mut = parser.eat();

    let DeclStatement: DeclerationStatement = 
    {
        type: 'DeclerationStatement',
        foldable: false,
        valType: 'int',
        mut: false,
        variables: [],
        init: {} as Expression,
        where: [],
    };

    parser.expect(
        TokenType.identifier,
        false,
        `Expected an identifier instead of the '${parser.at().value}' (${parser.at().type})`,
        'Identifier'
    );

    //@ts-ignore <Identifier is an expression>
    const ident: Identifier = parseLiteral(parser, parser.at());

    if (ident.type != 'Identifier')
    {
        new error(
            'Syntax Error',
            `Expected an identifier instead of a ${ident.type}`,
            parser.source,
            makePosition(parser.filename, parser.at().where.line, parser.at().where.start, parser.at().where.end),
            'Identifier'
        );
    };

    parser.eat();

    DeclStatement.variables.push(ident as Identifier);

    parser.expect(
        TokenType.colon,
        true,
        `Expected a colon ${TokenType.colon} to specify a type after the Identifier instead of ${parser.at().type}`,
        ':'
    );

    const type = parser.expectMultiple(
        [
            TokenType.intType,
            TokenType.boolType,
            TokenType.floatType,
            TokenType.strType,
            TokenType.charType,
        ],
        true,
        `Expected a valid type such as int str etc instead of '${parser.at().value}'`,
        'int or str or bool etc'
    );

    
    if (parser.at().type == TokenType.semicolon && mut.value == 'mut')
    {
        const initializer = {
            type: 'Literal',
            foldable: false,
            //@ts-ignore <Literal is an expression>
            realType: 'NullLiteral',
            value: 'null',
            where: [ident.where[0], ident.where[1], ident.where[2]],
        } as Expression;

        const where = [mut.where.line, mut.where.start, parser.at().where.end];

        DeclStatement = {
            type: 'DeclerationStatement',
            foldable: initializer.foldable,
            mut: mut.value == 'mut' ? true : false,
            valType: type.value,
            variables: [ident],
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
            `Expected an initializer after a const decleration to specify ${ident.value}'s value`,
            parser.source,
            makePosition(parser.filename, mut.where.line, parser.at().where.start, parser.at().where.end),
            '='
        );
    };

    parser.expect(
        TokenType.AssignmentOperator,
        true,
        `Expected an = (${TokenType.AssignmentOperator}) operator to specify ${ident.value}'s value`,
        '='
    );

    const initializer = parseExpression(parser, 0);

    DeclStatement = {
        type: 'DeclerationStatement',
        foldable: initializer.foldable,
        mut: mut.value == 'mut' ? true : false,
        valType: type.value,
        variables: [ident],
        init: initializer,
        where: [mut.where.line, mut.where.start, initializer.where[2]],
    };

    parser.expect(
        TokenType.semicolon,
        true,
        `Unexpectedly got the '${parser.at().value}' (${parser.at().type}) token. Expected a semicolon at the end of an Expression`,
        ';'
    );

    return DeclStatement;
};

export const parseExpressionStatement = (parser: Parser): ExpressionStatement =>
{
    const ExprStatement: ExpressionStatement = 
    {
        type: 'ExpressionStatement',
        foldable: true,
        body: [],
        where: [],
    };

    ExprStatement.body.push(parseExpression(parser, 0));

    ExprStatement.where = [ExprStatement.body[0].where[0], ExprStatement.body[0].where[1], ExprStatement.body[0].where[2]];

    parser.expect(
        TokenType.semicolon,
        true,
        `Unexpectedly got the '${parser.at().value}' (${parser.at().type}) token. Expected a semicolon at the end of an Expression`,
        ';'
    );

    ExprStatement.foldable = ExprStatement.body[0].foldable;

    return ExprStatement;
};