import
{
    Expr,
    Literal,
} from "../Parser/NodeTypes.ts";

import
{
    Type,
    UnionType,
    strUnionType,
    baseTypes,
    charType,
    strType,
    floatType,
    intType,
    nullType,
} from "../Parser/Types.ts";

import
{
    TypeChecker
} from "./TypeChecker.ts";

import
{
    error,
    makePosition,
} from '../Errors/Errors.ts'

export const checkUnionType = (kind: baseTypes[], Union: UnionType): boolean =>
{
    for (const type of Union.types)
    {
        if (kind.includes(type.type))
        {
            return true;
        };
    };

    return false;
};

function getIntSize(value: bigint): string
{
    const isNegative = value < 0n;
    const absValue = isNegative ? -value : value;

    switch (true)
    {
        case isNegative && absValue <= 2n**7n:
        {
            return 'i8';
        };
        case isNegative && absValue <= 2n**15n:
        {
            return 'i16';
        };
        case isNegative && absValue <= 2n**31n:
        {
            return 'i32';
        };
        case isNegative && absValue <= 2n**63n:
        {
            return 'i64';
        };
        case isNegative:
        {
            return 'i128';
        };

        case absValue <= 1n:
        {
            return 'u1';
        };
        case absValue <= 2n**8n:
        {
            return 'u8';
        };
        case absValue <= 2n**16n:
        {
            return 'u16';
        };
        case absValue <= 2n**32n:
        {
            return 'u32';
        };
        case absValue <= 2n**64n:
        {
            return 'u64';
        };
        default:
        {
            return 'u128';
        };
    };
}


export const getLiteralType = (Literal: Literal): Type =>
{
    switch (Literal.kind)
    {
        case 'CharLiteral':
        {
            return {
                type: 'char',
                where: Literal.where
            } as charType;
        };
        case "IntegerLiteral":
        {
            return {
                type: 'int',
                size: getIntSize(Literal.value as bigint),
                where: Literal.where
            } as intType;
        };

        case "FloatLiteral":
        {
            return {
                type: 'float',
                where: Literal.where
            } as floatType;
        };

        case "StringLiteral":
        {
            return {
                type: 'str',
                where: Literal.where
            } as strType;
        };

        case "NullLiteral":
        {
            return {
                type: 'null',
                where: Literal.where
            } as nullType;
        };
    }
}

export const getExpressionType = (TypeChecker: TypeChecker, Expression: Expr): Type =>
{
    switch (Expression.type)
    {
        case 'Literal':
        {
            return getLiteralType(Expression);
        };

        case 'Identifier':
        {
            const variable = TypeChecker.Env.getVariableInfo(Expression.value)

            if (variable == null)
            {
                new error(
                    'Name Error',
                    `Unable to find the variable ${Expression.value}`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2])
                );
                return {} as Type;
            }

            return variable.type;
        };

        case 'UnaryUpdateExpression':
        {
            const variable = TypeChecker.Env.getVariableInfo(Expression.right.value);
            
            if (variable == null)
            {
                new error(
                    'Name Error',
                    `Unable to find the variable ${Expression.right.value}`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2])
                );

                return {} as Type;
            };

            if (variable.type.type == 'UnionType')
            {
                if (!checkUnionType(['int', 'float'], variable.type as UnionType))
                {
                    new error(
                        'Type Error',
                        `Cannot perform a UnaryUpdate on the ${strUnionType(variable.type.types)} type`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2]),
                        'int or float'
                    );
                };
            };

            if (variable.type.type == 'int' || variable.type.type == 'float')
            {
                return variable.type;
            };

            new error(
                'Type Error',
                `Cannot perform a UnaryUpdate on the ${variable.type} type`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2]),
                'int or float'
            )
            break;
        };
    };

    return {} as Type;
};