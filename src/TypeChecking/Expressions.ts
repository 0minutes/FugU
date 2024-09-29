import
{
    TypeChecker,
} from './TypeChecker.ts'

import
{
    simpleType,
    nullType,
    floatType,
    strType,
    chrType,
    intType,
    arrayType,
} from "../Parser/Types.ts";

import 
{
    Expr,
    Literal,
} from "../Parser/GlobalNodes.ts";

import 
{
    error,
    makePosition
} from '../Errors/Errors.ts';

export const getExpressionType = (TypeChecker: TypeChecker, Expression: Expr): simpleType =>
{
    switch (Expression.type)
    {
        case 'AssignmentExpression':
        case 'BinaryExpression':
        {
            break;
        }
        case 'ArrayLiteralExpression':
        {
            let ElementKind = undefined;

            for (let i = 0; i < Expression.elements.length; i++)
            {
                const element = Expression.elements[i];

                if (i == 0)
                {
                    ElementKind = getExpressionType(TypeChecker, element);
                    continue;
                };

                if (getExpressionType(TypeChecker, element).kind != ElementKind!.kind)
                {
                    new error(
                        'Type Error',
                        `Expected to only have the ${ElementKind!.kind} type in the array instead of ${getExpressionType(TypeChecker, element).kind}. Cannot have different types in the same array`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                        ElementKind!.kind
                    );
                };

                if (element.type == 'Identifier')
                {
                    if (!(TypeChecker.env.getVar(element.value)!.init))
                    {
                        new error(
                            'Type Error',
                            `The variable '${element.value}' is not initialized and therefore cannot be added to the list`,
                            TypeChecker.parser.source,
                            makePosition(TypeChecker.parser.filename, element.where[0], element.where[1], element.where[2]),
                            'Initialize it first'
                        );
                    };
                };
            };

            const arrayType = {
                kind: 'array',
                elementKind: ElementKind,
                where: Expression.where,
            } as arrayType;

            return arrayType;
        };

        case 'UnaryExpression':
        {
            const elementKind = getExpressionType(TypeChecker, Expression);

            const element = Expression.right;

            if (element.type == 'Identifier')
            {
                if (!(TypeChecker.env.getVar(element.value)!.init))
                {
                    new error(
                        'Type Error',
                        `The variable '${element.value}' is not initialized and can therefore not be operated on`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, element.where[0], element.where[1], element.where[2]),
                        'Initialize it first'
                    );
                };
            };

            if (Expression.operator == '+' || Expression.operator == '-')
            {
                if (elementKind.kind == 'int' || elementKind.kind == 'float')
                {
                    return elementKind;
                };

                new error(
                    'Type Error',
                    `Cannot perform ${Expression.operator} on the ${elementKind.kind} type`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                    'int or float type'
                );

                return {
                    kind: 'null',
                    where: Expression.where
                } as nullType;
            };

            return elementKind;
        };

        case 'UnaryUpdateExpression':
        {
            const identType = getExpressionType(TypeChecker, Expression.right);

            if (identType.kind == 'int' || identType.kind == 'float')
            {
                return identType;
            };

            if (TypeChecker.env.getVar(Expression.right.value)!.init == false)
            {
                new error(
                    'Type Error',
                    `The variable '${Expression.right.value}' is not initialized and can therefore not be operated on`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2]),
                    'Initialize it first'
                );
            };

            new error(
                'Type Error',
                `Cannot perform ${Expression.operator} on the ${identType.kind} type`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                'int or float type'
            );

            return {
                kind: 'null',
                where: Expression.where
            } as nullType;
        };

        case 'Identifier':
        {
            const simpleType = TypeChecker.env.getVar(Expression.value);

            if (simpleType == undefined)
            {
                new error(
                    'Name Error',
                    `The variable ${Expression.value} is not defined`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2])
                );

                return {
                    kind: 'null',
                    where: Expression.where,
                } as nullType;
            };

            return simpleType.type;
        };

        case 'Literal':
        {
            return getLiteralType(Expression);
        };
    }; 
};

export const getLiteralType = (Literal: Literal): simpleType =>
{
    switch (Literal.kind)
    {
        case 'NullLiteral':
        {
            return {
                kind: 'null',
                where: Literal.where
            } as nullType;
        };

        case 'FloatLiteral':
        {
            return {
                kind: 'float',
                where: Literal.where
            } as floatType;
        };

        case 'StringLiteral':
        {
            return {
                kind: 'str',
                where: Literal.where
            } as strType;
        };

        case 'CharLiteral':
        {
            return {
                kind: 'chr',
                where: Literal.where
            } as chrType;
        };
        case 'IntegerLiteral':
        {
            return getIntegerType(Literal);
        };
    };
};

export const getIntegerType = (Literal: Literal): simpleType =>
{
    const value = Literal.value as bigint;
    
    let size;

    switch (true)
    {
        case value === 0n || value === 1n:
        {
            size = 'u1';
            break;
        };

        case value >= 0n && value <= 255n:
        {
            size = 'u8';
            break;
        };
        
        case value >= 0n && value <= 65535n:
        {
            size = 'u16';
            break;
        };

        case value >= 0n && value <= 4294967295n:
        {
            size = 'u32';
            break;
        };

        case value >= 0n:
        {
            size = 'u64';
            break;
        };

        case value >= -128n && value <= 127n:
        {
            size = 'i8';
            break;
        };

        case value >= -32768n && value <= 32767n:
        {
            
            size = 'i16';
            break;
        };

        case value >= -2147483648n && value <= 2147483647n:
        {
            size = 'i32';
            break;
        };

        default:
        {
            size = 'i64';
            break;
        }
    }

    return {
        kind: 'int',
        size: size,
        where: Literal.where
    } as intType;
};
