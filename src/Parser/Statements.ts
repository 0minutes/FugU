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
} from './GlobalNodes.ts';

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

import
{
    FugType,
    parseType,
} from './GlobalTypes.ts';

const formatValues = (items: Identifier[]): string =>
{
    const values = items.map(item => item.value);
    
    if (values.length == 0) return '';
    if (values.length == 1) return values[0];
    
    const lastValue = values.pop();

    return values.length ? `${values.join(', ')} and ${lastValue}` : lastValue || '';
};


export const parseDeclarationStatement = (parser: Parser): DeclerationStatement =>
{
    const mut = parser.eat();

    let DeclStatement: DeclerationStatement = 
    {
        type: 'DeclerationStatement',
        foldable: false,
        Type: {} as FugType,
        mut: false,
        variables: [],
        initialized: false,
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
        `Expected a colon ${TokenType.colon} to specify a type after the Identifier instead of ${parser.at().type}`,
        ':'
    );

    const typedef: FugType = parseType(parser, false);

    
    if (parser.at().type == TokenType.semicolon && mut.value == 'mut')
    {
        const initializer = undefined;

        const where = [mut.where.line, mut.where.start, parser.at().where.end];

        DeclStatement = {
            type: 'DeclerationStatement',
            foldable: false,
            mut: mut.value == 'mut' ? true : false,
            Type: typedef,
            variables: variables,
            initialized: false,
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
        `Expected an = (${TokenType.AssignmentOperator}) operator to specify ${formatValues(variables)}'s value`,
        '='
    );

    const initializer = parseExpression(parser, 0);

    DeclStatement = {
        type: 'DeclerationStatement',
        foldable: initializer.foldable,
        mut: mut.value == 'mut' ? true : false,
        Type: typedef,
        variables: variables,
        initialized: true,
        init: initializer,
        where: [mut.where.line, mut.where.start, initializer.where[2]],
    } as DeclerationStatement;

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
