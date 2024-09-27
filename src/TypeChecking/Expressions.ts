import
{
    error,
    makePosition,
    warning
} from "../Errors/Errors.ts";

import
{
    Expr,
    Literal,
} from "../Parser/GlobalNodes.ts";

import
{
    FugType,

    UnionType,
    arrayType,
    intType,
    floatType,
    stringType,
    charType,
    nullType,
} from "../Parser/GlobalTypes.ts";

import
{
    TypeChecker
} from "./TypeChecker.ts";



const MIN_I32 = BigInt(-2147483648);
const MAX_I32 = BigInt(2147483647);

const MIN_I64 = BigInt(-9223372036854775808);
const MAX_I64 = BigInt(9223372036854775807);

const MAX_U64 = BigInt(18446744073709551615);

export const getIntSize = (TypeChecker: TypeChecker, Expression: Literal): string =>
{
    const value = Expression.value as bigint;

    if (value == 1n || value == 0n)
    {
        return 'u1';
    }

    else if (value >= MIN_I32 && value <= MAX_I32)
    {
        return 'i32';
    }
    
    else if (value >= MIN_I64 && value <= MAX_I64)
    {
        return 'i64';
    }
    
    else if (value >= 0n && value <= MAX_U64)
    {
        return 'u64';
    }

    new warning(
        'Value Error',
        `value is too ${value > 0n ? 'big' : 'small'} for validation and will at runtime ${value > 0n ? 'overflow' : 'underflow'}`,
        TypeChecker.parser.source,
        makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
        `A ${value > 0n ? 'smaller' : 'bigger'} value`
    );

    return value > 0 ? 'u64' : 'i64';
};
    
    
export const checkExpression = (TypeChecker: TypeChecker, Expression: Expr): FugType | undefined =>
{
    switch (Expression.type)
    {
        case 'Identifier':
        {
            const value = TypeChecker.env.getVar(Expression.value);

            if (value == undefined)
            {
                new error(
                    'Name Error',
                    `The variable ${Expression.value} seems to have not be defined`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2])
                );
                
                return;
            };

            return value.type;
        };

        case 'Literal':
        {
            return getLiteralType(TypeChecker, Expression);
        };

        case 'UnaryUpdateExpression':
        {
            const identType = checkExpression(TypeChecker, Expression.right) as FugType;
        };
    };
};

const getLiteralType = (TypeChecker: TypeChecker, Expression: Literal): FugType =>
{
    switch (Expression.kind)
    {
        case 'StringLiteral':
        {
            return {
                type: 'string',
                where: Expression.where,
            } as stringType;
        };

        case 'CharLiteral':
        {
            return {
                type: 'char',
                where: Expression.where,
            } as charType;
        };

        case 'FloatLiteral':
        {
            return {
                type: 'float',
                where: Expression.where,
            } as floatType;
        };

        case 'IntegerLiteral':
        {
            return {
                type: 'integer',
                size: getIntSize(TypeChecker, Expression),
                where: Expression.where,
            } as intType;
        };

        case 'NullLiteral':
        {
            return {
                type: 'null',
                where: Expression.where,
            } as nullType;
        };
    };
};